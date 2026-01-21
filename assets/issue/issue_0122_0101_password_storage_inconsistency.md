# [Critical] 비밀번호 저장 방식 불일치 - 보안 취약점

## 1. 이슈 개요 (Overview)
- **작성일**: 2026-01-22
- **작성자**: Security Analysis
- **중요도**: Critical 🔴🔴🔴
- **상태**: Open
- **카테고리**: Security / Authentication

## 2. 환경 정보 (Environment)
| 항목 | 내용 |
| --- | --- |
| App Version | v1.4 |
| Database | TiDB (MySQL Compatible) |
| Auth Library | bcryptjs |
| Backend | Node.js + Express |

## 3. 문제 발견 (Discovery)

### 데이터베이스 Users 테이블 현황

```
id      username                  password                                                      nickname
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1       jiyoonheo@test.com        1234                                                          나다
5       sejong                    123                                                           나가라
30001   heonseong2021@sju.ac.kr  plsMemory@26                                                  올드캐슬
30002   mypage@test.com          password123                                                   MyPageTester
30003   emptyuser@test.com       pw123                                                         EmptyTester
90001   master@imery.com         master@1234                                                   master
120001  usera@example.com        $2a$10$hsfFzXQ6V7kvqG7QxJUXf.pP8FInWuD.9bKFqrvu0IXi7qr5PEfP2  UserA  ✅
```

### 🔴 심각한 보안 문제

**패턴 분석:**
- ❌ **6명의 사용자**: 평문(plaintext) 비밀번호 저장
- ✅ **1명의 사용자** (id: 120001): bcrypt 해시 저장

**Bcrypt 해시 식별:**
- 형식: `$2a$10$...` (bcrypt 표준 형식)
- 길이: 60자
- Salt: 10 rounds

---

## 4. 원인 분석 (Root Cause Analysis)

### Backend 코드 분석

**`server/index.js:88-100` - 회원가입 엔드포인트**
```javascript
app.post('/users/signup', async (req, res) => {
    const { username, password, nickname } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);  // ✅ 해싱 사용
        const result = await db.run(
            'INSERT INTO Users (username, password, nickname) VALUES (?, ?, ?)',
            [username, hashedPassword, nickname]
        );
        res.json({ message: '가입 성공', id: result.lastID, nickname });
    } catch (error) {
        res.status(400).json({ detail: '회원가입 실패' });
    }
});
```

**`server/index.js:102-110` - 로그인 엔드포인트**
```javascript
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM Users WHERE username = ?', [username]);
    
    if (user && await bcrypt.compare(password, user.password)) {  // ✅ bcrypt 비교
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({
            message: '로그인 성공',
            user_id: user.id,
            // ...
        });
    }
}
```

### 🔍 근본 원인

1. **회원가입 API는 정상 작동** ✅
   - bcrypt 해싱 적용
   - id 120001 사용자가 증명

2. **기존 사용자들은 직접 DB 삽입** ❌
   - SQL INSERT 또는 Admin 툴로 직접 삽입
   - 비밀번호 해싱 없이 평문 저장
   - 테스트/개발 계정으로 추정

3. **로그인 문제 발생** 🔴
   ```javascript
   await bcrypt.compare(password, user.password)
   // password = "1234" (사용자 입력)
   // user.password = "1234" (DB의 평문)
   // bcrypt.compare("1234", "1234") => false!
   ```
   - bcrypt는 해시와 평문을 비교하려 함
   - 평문 비밀번호는 bcrypt 해시가 아니므로 **항상 실패**

---

## 5. 영향 범위 (Impact)

### 보안 (Security)
- 🔴 **Critical**: 6개 계정의 비밀번호가 평문 노출
- 🔴 **High**: 데이터베이스 탈취 시 즉시 비밀번호 유출
- 🟡 **Medium**: 개발자/DBA가 비밀번호 확인 가능

### 기능 (Functionality)
- 🔴 **Critical**: 평문 비밀번호 사용자는 **로그인 불가능**
  - `bcrypt.compare(plaintext, plaintext) = false`
- 🟡 **Medium**: 신규 가입 사용자만 정상 작동

### 데이터 일관성
- 🔴 **High**: 비밀번호 저장 정책 불일치
- 🟡 **Medium**: 마이그레이션 필요

---

## 6. 재현 시나리오 (Reproduction)

### Scenario 1: 평문 비밀번호 사용자 로그인 시도
```javascript
// 사용자 입력
username: "master@imery.com"
password: "master@1234"

// DB에 저장된 값
user.password = "master@1234" (평문)

// 로그인 로직
await bcrypt.compare("master@1234", "master@1234")
// Result: false ❌ (bcrypt는 평문을 해시로 인식 시도)
```

### Scenario 2: 해시된 비밀번호 사용자 로그인 시도
```javascript
// 사용자 입력
username: "usera@example.com"
password: "password123"

// DB에 저장된 값
user.password = "$2a$10$hsfF..." (bcrypt 해시)

// 로그인 로직
await bcrypt.compare("password123", "$2a$10$hsfF...")
// Result: true ✅ (정상 비교)
```

---

## 7. 해결 방안 (Solutions)

### 방안 1: 모든 평문 비밀번호를 해시로 변환 (권장) ✅

**단계별 실행 계획:**

#### Step 1: 평문 비밀번호 사용자 식별
```sql
SELECT id, username, password, 
       CASE 
           WHEN password LIKE '$2a$%' THEN 'HASHED'
           ELSE 'PLAINTEXT'
       END AS status
FROM Users;
```

#### Step 2: 비밀번호 해싱 스크립트 작성
```javascript
// server/hash_passwords.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
});

async function hashPlaintextPasswords() {
    // 평문 비밀번호 사용자 조회 (bcrypt 해시가 아닌 것)
    const [users] = await connection.execute(`
        SELECT id, username, password 
        FROM Users 
        WHERE password NOT LIKE '$2a$%'
    `);
    
    console.log(`Found ${users.length} users with plaintext passwords`);
    
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await connection.execute(
            'UPDATE Users SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );
        
        console.log(`✅ Updated user ${user.id} (${user.username})`);
    }
    
    console.log('\n🎉 All passwords hashed successfully!');
}

await hashPlaintextPasswords();
await connection.end();
```

#### Step 3: 실행 및 검증
```bash
cd server
node hash_passwords.js
```

**장점:**
- ✅ 기존 사용자들이 동일한 비밀번호로 로그인 가능
- ✅ 보안 강화
- ✅ 데이터 일관성 확보

**단점:**
- ⚠️ 평문 비밀번호를 알고 있어야 함 (현재 DB에 저장되어 있음)

---

### 방안 2: 비밀번호 재설정 강제

**프로세스:**
1. 평문 비밀번호 사용자에게 비밀번호 재설정 요청
2. 재설정 시 bcrypt 해싱 적용
3. 기존 계정 비활성화

**단점:**
- ❌ 사용자 불편
- ❌ 테스트 계정 재설정 번거로움

---

### 방안 3: Hybrid 인증 로직 (임시, 비권장)

**로그인 시 평문/해시 구분:**
```javascript
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM Users WHERE username = ?', [username]);
    
    if (!user) {
        return res.status(401).json({ detail: '사용자를 찾을 수 없습니다' });
    }
    
    let isPasswordValid = false;
    
    // Bcrypt 해시 확인 ($2a$, $2b$, $2y$ 등)
    if (user.password.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
        // 평문 비교 (레거시)
        isPasswordValid = (password === user.password);
        
        // ⚠️ 로그인 성공 시 자동으로 해시로 변환
        if (isPasswordValid) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run('UPDATE Users SET password = ? WHERE id = ?', 
                [hashedPassword, user.id]);
            console.log(`🔒 Auto-hashed password for user ${user.id}`);
        }
    }
    
    if (isPasswordValid) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ message: '로그인 성공', user_id: user.id, ... });
    } else {
        res.status(401).json({ detail: '비밀번호가 일치하지 않습니다' });
    }
});
```

**장점:**
- ✅ 사용자 즉시 로그인 가능
- ✅ 로그인 시 자동 마이그레이션

**단점:**
- ⚠️ 임시 방편
- ⚠️ 코드 복잡도 증가
- ⚠️ 여전히 일부 계정은 평문 (로그인 전까지)

---

## 8. 권장 실행 계획

| 순서 | 작업 | 예상 시간 | 우선순위 |
|------|------|-----------|----------|
| 1 | 평문 비밀번호 사용자 백업 | 5분 | High |
| 2 | 해싱 스크립트 작성 및 테스트 | 20분 | Critical |
| 3 | 운영 DB에 적용 | 10분 | Critical |
| 4 | 검증 (로그인 테스트) | 15분 | High |
| 5 | 문서화 | 10분 | Medium |

**총 예상 시간**: 1시간

---

## 9. 검증 체크리스트

로 해시 변환 후 확인 사항:

- [ ] 모든 사용자 비밀번호가 `$2a$10$...` 형식인지 확인
- [ ] 각 사용자 계정으로 로그인 테스트
- [ ] bcrypt.compare() 정상 작동 확인
- [ ] 비밀번호 변경 기능 정상 작동 확인

---

## 10. 관련 파일

- [server/index.js:88-100](file:///Users/apple/Desktop/React/iMery/server/index.js#L88-L100) - 회원가입 로직
- [server/index.js:102-110](file:///Users/apple/Desktop/React/iMery/server/index.js#L102-L110) - 로그인 로직
