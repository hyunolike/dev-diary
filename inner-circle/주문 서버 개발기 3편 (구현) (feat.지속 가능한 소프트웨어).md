## 주문 서버 개발기 3편 (구현)
> 작성날짜: 24.09.30

### 📚 Table of Contents
해당 포스팅은 아래의 시리즈로 구성되어 있습니다. 시리즈대로 포스팅을 읽어주세요 🧑🏼‍🌾
1. [주문 서버 개발기 1편 (도메인)](https://github.com/hyunolike/dev-diary/blob/develop/inner-circle/%EC%A3%BC%EB%AC%B8%20%EC%84%9C%EB%B2%84%20%EA%B0%9C%EB%B0%9C%EA%B8%B0%201%ED%8E%B8%20(%EB%8F%84%EB%A9%94%EC%9D%B8).md)
2. [주문 서버 개발기 2편 (설계)](https://github.com/hyunolike/dev-diary/blob/develop/inner-circle/%EC%A3%BC%EB%AC%B8%20%EC%84%9C%EB%B2%84%20%EA%B0%9C%EB%B0%9C%EA%B8%B0%202%ED%8E%B8%20(%EC%84%A4%EA%B3%84).md)
3. [주문 서버 개발기 3편 (구현) (feat.지속 가능한 소프트웨어)](#)
---

### 지속 가능한 소프트웨어에 맞게 주문 생성 API를 구현해보자 
#### 1. 먼저 지속 가능 소프트웨어의 대략적인 구성을 살펴보자
<img width="539" alt="image" src="https://github.com/user-attachments/assets/0820352d-7033-4e1a-941b-c2ade2736c38">


- 최종적으로 구현체는 비즈니스 레이어로 가게끔!

#### 2. 그렇다면 주문 생성 API는 어떻게 만들까?
> 이전 [예측 가능하고 제어하기 쉬운 소프트웨어에 대해 알아보자 (feat. 지속 성장 가능한 소프트웨어를 만들어가는 방법)](https://github.com/hyunolike/dev-diary/blob/develop/inner-circle/%EC%98%88%EC%B8%A1%20%EA%B0%80%EB%8A%A5%ED%95%98%EA%B3%A0%20%EC%A0%9C%EC%96%B4%ED%95%98%EA%B8%B0%20%EC%89%AC%EC%9A%B4%20%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%EC%97%90%20%EB%8C%80%ED%95%B4%20%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90%20(feat.%20%EC%A7%80%EC%86%8D%20%EC%84%B1%EC%9E%A5%20%EA%B0%80%EB%8A%A5%ED%95%9C%20%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%EB%A5%BC%20%EB%A7%8C%EB%93%A4%EC%96%B4%EA%B0%80%EB%8A%94%20%EB%B0%A9%EB%B2%95).md) 참고해서 설계해보자!

<img width="951" alt="image" src="https://github.com/user-attachments/assets/9ffcfff4-544e-4002-872f-0cc2bcc107a5">

#### 3. 전체 구조는??
> 현재 핀테크 서비스, 배송 서비스 외부 연동은 할 수 없는 상황

<img width="958" alt="image" src="https://github.com/user-attachments/assets/3e704d06-b30a-45eb-8d82-4f655ac3681f">


- `implement layer`로 구현체를 만들고 모든 구현체는 비즈니스 로직으로 향하도록 설계!
##### 3-1. 이렇게 흐르게 된다!
<img width="403" alt="image" src="https://github.com/user-attachments/assets/47b84559-bea4-49f6-9dc4-eae23f875a5a">

### 이제부터는 일반적인 주문 생성 프로세스를 살펴보자
> 장기 트랜잭션으로 묶을수도 있고 개별 트랜잭선을 조합해서 개발을 해볼 있는 상황

![image](https://github.com/user-attachments/assets/9b6241f9-747d-4e3d-bbff-e10679dd52a2)

- 주의할 점은. 동시성 처리, 보상 트랜잭션, 비동기 처리 등으로 `데이터 정합성`을 맞춰야 한다.

#### 주요 주문생성 API 단계

1. 상품 처리
    1. 상품 정보 확인
    2. 재고 확인
2. 배송 처리
    1. 배송 정보 처리 (테이블 추가 필요)
3. 결제 처리
    1. 결제 정보 처리
    2. 재고 정보 처리
    3. 배송 요청 (외부 택배사)

### 위를 토대로 본격적으로 주문 프로세스를 설계해보자
#### 1. 먼저 대략적인 구조를 만들자
<img width="467" alt="image" src="https://github.com/user-attachments/assets/faf8f33f-244e-4efc-9c32-a25df7fdd5f2">

#### 2. 각 주요 처리 부분의 상세 설계를 해보자
<img width="638" alt="image" src="https://github.com/user-attachments/assets/bef176a1-92d5-4d00-a35a-0d20dad096e0">

#### 3. 여기에 스프링 컨테이너 프로세스를 추가해보자
<img width="544" alt="image" src="https://github.com/user-attachments/assets/050b8144-267e-4ac4-ae2c-dd54b410170c">

#### 4. 마지막으로 이걸 DIP도 같이 살펴보면?
<img width="1190" alt="image" src="https://github.com/user-attachments/assets/d404e657-67ca-42a1-ab42-04bf182dc376">

### 최종적으로 `지속 성장 가능한 코드를 만들어가는 방법` 모범 사례를 참고해서 비교해보자
|모범 사례|이너서클 1기 주문생성 API 예상 로직|
|-|-|
|![image](https://github.com/user-attachments/assets/45103335-e6be-48fd-af45-881b617b9682)|![image](https://github.com/user-attachments/assets/b3905738-2c2d-439a-84c2-3ff384600613)|


<img width="1079" alt="image" src="https://github.com/user-attachments/assets/ce8f2eda-ac7a-42de-8203-1110b283a15d">

#### 추가. `토스 컨퍼런스 자료` 지속 성장 가능한 코드 만들어가는 방법 중 패키지 구조 개선 건
> 기존 component 패키지에서 좀 더 도메인을 명확히 하기 위해 `domain` 패키지로 변경하다!

<img width="873" alt="image" src="https://github.com/user-attachments/assets/9991fbf9-3f84-44b6-9909-8ef998fe995d">

### 회고 
- 지속 가능한 소프트웨어 설계를 위해서는 누구나 읽기 쉬운 비즈니스 규칙(유비쿼터스 언어)로 작성 해야된다는 점에서 인상깊었다.
- 단지 비즈니스 구현에 집중하는 것이 아닌 비즈니스 (도메인) 언어라는 새로운 관점에서 설계를 해보는 경험이였다.
