---
title: "SQLite3란"
slug: sqlite3란
date: "2025-07-16"
category: 개인
tags: ["SQLite"]
summary: "파일 하나가 곧 데이터베이스가 되는 SQLite3의 서버리스·제로 설정 특성을 일반 RDBMS와 견줘 정리한 짧은 소개 글."
featured: false
---
## SQLite3란
> 작성날짜: 25.07.16

- SQLite3는 `경량화된 관계형 데이터베이스 관리 시스템(RDBMS)`입니다. "Lite"라는 이름처럼 가볍고 간단하지만 강력한 기능을 제공하는 데이터베이스

### 🌟 주요 특징
#### 1. 📦 파일 기반 데이터베이스
```
전체 데이터베이스가 하나의 파일에 저장됩니다
별도의 서버 프로세스가 필요 없습니다
파일을 복사하면 데이터베이스 전체가 백업됩니다
```

#### 2. 🚀 서버리스 (Serverless)
```
기존 DB: 클라이언트 ↔ 서버 ↔ 데이터베이스
SQLite:  애플리케이션 ↔ 데이터베이스 파일
```

#### 3. 🔧 제로 설정 (Zero Configuration)
```
설치 후 바로 사용 가능
복잡한 설정 파일이나 관리자 계정 불필요
자동으로 데이터베이스 파일 생성
```

#### 4. 📱 크로스 플랫폼
```
Windows, macOS, Linux, Android, iOS 지원
32비트와 64비트 시스템 모두 지원
```

#### 5. 💾 작은 메모리 사용량
```
런타임 메모리 사용량이 매우 적음
임베디드 시스템에 적합
```

### 비교
<img width="680" height="237" alt="image" src="https://github.com/user-attachments/assets/a3f9981e-59e2-4275-92ce-bad944a43184" />
