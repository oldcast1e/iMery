#!/bin/bash

echo "🔄 iMery 프로젝트 환경 재설정 중..."

# 1. 의존성 설치
echo "📦 패키지 설치 중..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "node_modules 확인됨. 추가 설치 생략 (필요 시 'rm -rf node_modules' 후 재실행)"
fi

# 2. 서버 실행
echo "🚀 개발 서버 실행 중..."
npm run dev
