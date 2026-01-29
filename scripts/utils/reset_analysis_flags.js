/**
 * Reset Analysis Flags Script
 * ============================
 * 
 * 기능:
 * - 모든 작품(Posts)의 is_analyzed 플래그를 0으로 초기화합니다.
 * - AI 분석 결과를 다시 테스트하거나 초기화할 때 유용합니다.
 * 
 * 실행 방법:
 * 1. 터미널에서 server 디렉토리로 이동
 *    cd /Users/apple/Desktop/React/iMery/server
 * 
 * 2. 스크립트 실행
 *    node ../scripts/utils/reset_analysis_flags.js
 */

import { initDb } from '../../server/db.js';

console.log('🔧 AI 분석 플래그 초기화 스크립트 시작...\n');

async function resetAnalysisFlags() {
    try {
        // 데이터베이스 연결
        const db = await initDb();
        console.log('✅ 데이터베이스 연결 성공\n');
        
        // 현재 is_analyzed = 1인 작품 개수 확인
        const beforeCount = await db.get('SELECT COUNT(*) as count FROM Posts WHERE is_analyzed = 1');
        console.log(`📊 현재 분석된 작품 수: ${beforeCount.count}개\n`);
        
        if (beforeCount.count === 0) {
            console.log('ℹ️  이미 모든 작품의 is_analyzed가 0입니다.');
            console.log('\n🎉 작업 완료!');
            process.exit(0);
        }
        
        // is_analyzed를 0으로 업데이트
        const result = await db.run('UPDATE Posts SET is_analyzed = 0 WHERE is_analyzed = 1');
        console.log(`✅ ${result.changes}개 작품의 is_analyzed를 0으로 초기화했습니다.\n`);
        
        // 검증
        const afterCount = await db.get('SELECT COUNT(*) as count FROM Posts WHERE is_analyzed = 1');
        console.log(`📊 업데이트 후 분석된 작품 수: ${afterCount.count}개`);
        
        console.log('\n🎉 작업 완료!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
resetAnalysisFlags();
