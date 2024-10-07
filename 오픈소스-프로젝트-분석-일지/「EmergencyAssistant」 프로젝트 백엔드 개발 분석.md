## 🔍 「EmergencyAssistant」 프로젝트 백엔드 개발 분석
> 📅 분석 일자: 2024-10-07

### 🏗️ 프로젝트 정보
- 프로젝트명: EmergencyAssistant-Server
- GitHub 링크: https://github.com/prgrms-be-devcourse/NBE1_2_Team06/tree/develop
- 개발자/팀: NBE1_2_Team06
- 주요 기능: 실시간 응급실 현황 조회

### 🏷️ 주요 키워드
- 지속 성장 가능한 소프트웨어, 멀티 모듈, 의존성, CQRS, Facade Pattern

### 💻 기술 스택
- 백엔드: Java, Spring Boot

### 🛠️ 구현 방식
#### 모듈 구성
<img width="338" alt="image" src="https://github.com/user-attachments/assets/668d13a9-2728-4ae3-988e-d6faa8a3d2f6">

##### 🎁 [서비스 명]-application
<img width="480" alt="image" src="https://github.com/user-attachments/assets/491a41a7-5bc0-4903-b4db-f758a7fa3006">

<img width="800" alt="image" src="https://github.com/user-attachments/assets/7c8c4520-ea94-4954-94e9-9d848b1175e0">

- 컨트롤러 명 네이밍 `[도메인]Api.java` 구성

##### 🎁 [서비스 명]-domain
<img width="347" alt="image" src="https://github.com/user-attachments/assets/b5cb1c01-dc6e-40cb-a077-d06eab55f645">

##### 🎁 [서비스 명]-infra
<img width="347" alt="image" src="https://github.com/user-attachments/assets/8070d80c-3df7-4a35-9f78-d0ca665d050a">


##### 서비스 로직 구성은?
<img width="360" alt="image" src="https://github.com/user-attachments/assets/808552ea-7293-419d-b7d9-3ac931f9ae77">

- 여러 기능 함수들을 조합해 최종적으로 컨트롤러 부분에서 호출

##### 좀 더 모듈 별로 구분지어 살펴보자면
<img width="647" alt="image" src="https://github.com/user-attachments/assets/a0f8ba7a-c793-4a38-8363-7e909cbc969d">

- 크게 2가지 도메인, 애플리케이션으로 나뉘게 되고

<img width="660" alt="image" src="https://github.com/user-attachments/assets/1f9e63ca-b306-44f0-8bb6-9f05f63dab2d">

- 각 기능함수들은 CQRS 패턴으로 네이밍 지어서 조합하게 된다

#### 이전 내용 다시 확인 (파사드 패턴, CQRS) - 참고
<img width="610" alt="image" src="https://github.com/user-attachments/assets/ef41aab6-476f-4b9f-8104-c869076261e5">

### 💡 주요 기술적 인사이트
1. CQRS 패턴, 파사드 패턴을 이용해 비즈니스 로직(도메인 언어)로 구성
