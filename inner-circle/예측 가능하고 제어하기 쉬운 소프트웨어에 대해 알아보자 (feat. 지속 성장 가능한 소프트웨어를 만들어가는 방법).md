## 예측 가능하고 제어하기 쉬운 소프트웨어에 대해 알아보자 (feat. 지속 성장 가능한 소프트웨어를 만들어가는 방법)
> 작성날짜: 24.09.24

### 상황
- [`지속 성장 가능한 소프트웨어를 만들어가는 방법`](https://geminikims.medium.com/%EC%A7%80%EC%86%8D-%EC%84%B1%EC%9E%A5-%EA%B0%80%EB%8A%A5%ED%95%9C-%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%EB%A5%BC-%EB%A7%8C%EB%93%A4%EC%96%B4%EA%B0%80%EB%8A%94-%EB%B0%A9%EB%B2%95-97844c5dab63) 을 참고해서 팀 프로젝트 리펙토링 예정
- 리펙토링 후 예상 구조까지 미리 생각해보자

### 먼저 여기서 설명하는 바를 요약해보자
> 해당 방법론은 휘발성 프로젝트(서비스)에서는 불필요! 

- 비즈니스 로직:
    - 상세 구현 로직보다는 비즈니스의 흐름을 이해할 수 있는 코드를 작성해야 함
    - 각 클래스가 명확한 역할을 갖도록 설계
    - 상세 구현은 implement layer 내 개발 진행
- 소프트웨어 레이어:
    - Presentation, Business, Implement, Data Access 등의 레이어로 구성
    - 레이어 간 참조 규칙을 설정하여 코드의 구조와 의존성을 관리
- 모듈화:
    - 기능과 책임에 따라 모듈을 분리하여 구성
    - 모듈 간 의존성을 최소화하고, 구현 기술의 변경이 다른 모듈에 영향을 미치지 않도록 설계
    - Gradle의 implementation 키워드를 활용하여 의존성 전파를 제한
- 소프트웨어 통제와 제어:
    - 비즈니스 로직의 가시화, 레이어 구조화, 적절한 모듈화를 통해 소프트웨어를 통제
    - 변화에 유연하게 대응할 수 있는 구조를 만들어 지속적인 성장과 유지보수가 가능한 소프트웨어 개발

### 그렇다면 다른 관점에서 다시 살펴보자
- 소프트웨어 개발론 측면:
    - 지속 가능한 소프트웨어 개발에 대한 전반적인 철학과 방법론을 다룸.
    - 비즈니스 로직의 명확성, 모듈화, 레이어 구조 등 소프트웨어 개발의 여러 측면을 포괄적 다룸.
- 클린 아키텍처 측면:
    - 의존성 규칙, 레이어 구조, 모듈 간 분리 등 클린 아키텍처의 핵심 개념들을 포함
    - 특히 비즈니스 로직을 중심에 두고, 외부 의존성(프레임워크, 데이터베이스 등)을 분리하는 접근 방식은 클린 아키텍처의 주요 원칙과 일치
- 실용적 접근:
    - 저자는 이론적 개념을 실제 개발 상황에 적용하는 방법을 구체적인 예시와 함께 설명
    - Gradle의 의존성 관리 기능 등 실제 개발 도구를 활용하는 방법도 포함
 
### 여기서 말하고자 하는 바는?
> 통제, 제어 = 참조, 의존성 격리

<img width="651" alt="image" src="https://github.com/user-attachments/assets/7bf527c4-e0da-40a1-a0a7-28c5d928e8be">

### 이제부터 좀 더 알아보자! (클린 아키텍처 관점)
<img width="956" alt="image" src="https://github.com/user-attachments/assets/67d95bef-c89d-4556-ab86-f2e477d62607">

- 여기까지 보면 일반적인 클린 아키텍처와 크게 다를바가 없다
#### 더 자세히 들어가보자 
> 구현부를 비즈니스 레이어단에서 조합 개발한다!
<img width="1244" alt="image" src="https://github.com/user-attachments/assets/51a33e74-0577-457e-a473-91e7071eb7fc">

### 해당 저자가 소개한 프로젝트 전체를 살펴보자
<img width="839" alt="image" src="https://github.com/user-attachments/assets/838be8b9-ccf8-4bcf-9380-59525351d6eb">

#### 서비스 비즈니스 핵심 모듈 `CORE-API` 
<img width="642" alt="image" src="https://github.com/user-attachments/assets/8e99c171-dc05-4ff7-969b-2039c1c45d75">

### 다른 방법론(멀티 모듈)을 구성한 프로젝트를 비교해보자
|`저자` @team-dodn|`리더님` @heli-os|`해외 개발자` @FrancescoJo|
|-|-|-|
|<img width="385" alt="image" src="https://github.com/user-attachments/assets/18fb121a-a315-4193-9d89-b761520f8c8a">|<img width="343" alt="image" src="https://github.com/user-attachments/assets/9b88f6cc-c017-401b-8309-6593e6658344">|<img width="180" alt="image" src="https://github.com/user-attachments/assets/02cc91f9-3696-497b-b841-2abb4eef09fb">|


- 모두 메인 코어 (비즈니스)를 중점을 해서 부가적인 부분은 따로 구성을 한걸 볼 수가 있다.
- 좀 더 분리를 할꺼냐 아니면 하나의 공통으로 가져가는 지는 개발(팀)의 소프트웨어 유지보수 스타일에 따라 달라질꺼라고 생각

### 다른 방법론(멀티 모듈)을 구성한 레이어를 비교해보자
#### `저자` 가 제안한 레이어 방법
<img width="661" alt="image" src="https://github.com/user-attachments/assets/2c161437-9771-46d7-b526-45f1ed0f50e7">

#### `대표적 방법론 - 핵사고날(CQRS)`
<img width="777" alt="image" src="https://github.com/user-attachments/assets/921febb0-8bf0-4e8d-8c41-09c3a2f3f6a3">


- 어디를 중점으로 소프트웨어 (개발)을 관리할 껀지에 따라 달라질꺼라 생각
- `비즈니스` 핵심인 가운데 쿼리 vs 동작(행위)
    - 쿼리: 데이터베이스 기준
    - 동작(행위): 사용자 기준
 
#### 각 레이어는 최종적으로 어떻게 사용될까 (컨트롤러단)
> 어디서 구현체를 조합하느냐에 따라 달라진다

##### 최종 단계 (저자)
<img width="545" alt="image" src="https://github.com/user-attachments/assets/a62b5345-ddfe-40f1-8f79-697b1bd29409">

##### 최종 단계 (핵사고날) 
<img width="745" alt="image" src="https://github.com/user-attachments/assets/ecf32479-0033-40c9-bd4b-076e6b1f1891">


### 저자가 제안한 방법론기반으로 다시 설계해보자! 
> [이너서클 1기 5&6조 커머스 프로젝트 바로가기](https://github.com/FC-InnerCircle/icd01-team05_06-commerce-be)
#### 모듈 
|현재|개선안(예상)|저자가 제안한 모듈 구조
|-|-|-|
|<img width="317" alt="image" src="https://github.com/user-attachments/assets/28f86a1d-1e71-4e76-b596-d26c30d28b2f">|<img width="313" alt="image" src="https://github.com/user-attachments/assets/5266edd8-f8a5-46f6-a4ce-330bb5d11002">|<img width="337" alt="image" src="https://github.com/user-attachments/assets/0af45838-5764-4e40-b837-ad49df6ba73b">|


- 기존 common 모듈의 역할을 분리
    - `저자` 가 제안한 모듈별 역할과 동일하게 가져감

#### 레이어
|현재|개선안(예상)|
|-|-|
|<img width="388" alt="image" src="https://github.com/user-attachments/assets/aff0336c-a495-4d18-a3a3-e2c48766529b">|<img width="404" alt="image" src="https://github.com/user-attachments/assets/63cc53cc-d27e-4bf7-87fc-6c536f0e8ba0">|

- implemnet layer 계층을 추가함으로써 business layer에는 도메인(유비쿼터스) 언어로만 구성

##### 레이어의 개선안을 좀 더 자세히 보자
<img width="541" alt="image" src="https://github.com/user-attachments/assets/d17eec5e-4673-4d9c-9640-9211b638074e">

#### 최종 아키텍처는???
<img width="561" alt="image" src="https://github.com/user-attachments/assets/857b9b59-efb3-414a-a892-4ccc45797b95">


- 현재는 위처럼 일부 모듈의 의존성이 다른 레이어 층을 바로 의존하고 있다!

<img width="564" alt="image" src="https://github.com/user-attachments/assets/37db9f05-c98c-4556-b4d7-9d6f1ee315c5">


- 그렇지만, 최종 개선안(예상) 에는 레이어별 의존관계도 정리된 모습

### 회고
- 소프트웨어 개발은 단순히 기술 적용뿐 아니라 유지보수, 확장성을 위한 아키텍처 중요
- 결국에는 비즈니스를 위한 서비스이므로 모든 관계자들이 알 수 있는 `비즈니스(도메인) 언어` 로 작성된 코드 중요
- 백엔드뿐 아니라 프론트 영역에서도 위와 같이 사용하는 것이 필요
    - 비록 앞단의 개발이지만 전역, 지역, 서버 데이터별 역할 관리가 있기 때문


