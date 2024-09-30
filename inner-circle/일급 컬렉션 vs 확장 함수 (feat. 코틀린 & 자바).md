## 일급 컬렉션 vs 확장 함수 (feat. 코틀린 & 자바)
> 작성날짜: 24.09.30

### 일급 컬렉션?
-  OOP 에서 컬렉션을 래핑하여 그 자체를 하나의 클래스로 만드는 것 (Collection -> Wrapping)
-  🔥컬렉션 래핑에 중점을 두자!!

#### 장점은?
- 비즈니스 로직을 한 곳에 모아 관리할 수 있습니다.
- 컬렉션의 불변성을 보장합니다.
- 상태와 행위를 한 곳에서 관리할 수 있어 객체지향적인 설계가 가능합니다.

### 자바에서의 사용 예시
> 로또 검증

<img width="943" alt="image" src="https://github.com/user-attachments/assets/03b2334c-402b-4ab3-a9a7-47d67154551f">

### 다시 구조로 정리하자면
<img width="565" alt="image" src="https://github.com/user-attachments/assets/3ced37f1-7c53-414f-bf5a-780bc5f312be">

### 코틀린에서는 어떻게 사용해? (feat. 확장 함수)
#### 1. 일반적 구성
<img width="326" alt="image" src="https://github.com/user-attachments/assets/46978e3b-6cab-4b96-95b2-e0d93a3a21c3">

#### 2. 일급 컬렉션 구성 
<img width="418" alt="image" src="https://github.com/user-attachments/assets/e71a2271-3fd4-418b-9ca6-d01a87ca4f54">

#### 3. 일급 컬렉션 구성 (확장 함수)
<img width="603" alt="image" src="https://github.com/user-attachments/assets/4873493d-c920-4630-971b-a97815cc6d81">

### 이걸 지속 가능한 소프트웨어 개발과 접목 한다면?
#### 대략적인 구조
<img width="526" alt="image" src="https://github.com/user-attachments/assets/5ca469b7-510d-46ee-acf3-965004628640">

#### 레이어로 묶어보자
<img width="644" alt="image" src="https://github.com/user-attachments/assets/abb3c142-6805-4293-ad81-96185f3feab6">



### 회고
- 일급 컬렉션 (확장함수)를 활용해 코드를 보다 가독성있게 개발이 가능해진다. (추상화를 높인다)
