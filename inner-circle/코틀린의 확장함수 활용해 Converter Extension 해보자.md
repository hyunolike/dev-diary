## 코틀린의 확장함수 활용해 Converter Extension 해보자 
> 작성날짜: 24.09.17

### 상황
- 자바와 달리 코틀린에서 보다 쉽게 Converter Extention을 하고 싶었음


### 코틀린의 확장함수를 사용하다
#### 코틀린 확장함수란?
- 기존 클래스에 새로운 함수를 추가할 수 있는 기능
- 원본 소스 코드를 수정하지 않고도 클래스의 기능 확장 가능


```kotlin
// 확장함수 사용 예
fun String.addExclamation(): String = this + "!"
val result = "Hello".addExclamation()

// 기존 자바 사용 예
String result = StringUtils.addExclamation("Hello");
```

#### 자바와의 차이점
| 특성 | 코틀린 확장 함수 | 자바 유사 기능 |
|------|------------------|----------------|
| 구문 | `fun String.addExclamation(): String = this + "!"` | `public static String addExclamation(String str) { return str + "!"; }` |
| 호출 방식 | `"Hello".addExclamation()` | `StringUtils.addExclamation("Hello")` |
| 정의 위치 | 클래스 외부에서 정의 가능 | 별도의 유틸리티 클래스 내에서 정의 |
| 가시성 | 정의된 파일 내에서만 사용 가능 (import 필요) | 일반적으로 public static 메서드로 전역적 사용 가능 |
| 오버라이딩 | 불가능 (가상 메서드가 아님) | 가능 (인스턴스 메서드의 경우) |
| null 안전성 | 컴파일 시점에서 null 체크 제공 | 기본적으로 제공되지 않음 |
| 리시버 | `this`가 확장되는 객체를 가리킴 | 해당 개념 없음 |
| 타입 추론 | 지원 | 제한적 지원 (Java 10 이상에서 var 키워드 사용 시) |
| 인라인화 | 가능 (`inline` 키워드 사용) | 불가능 (JVM 최적화에 의존) |
| 프로퍼티 확장 | 지원 | 해당 개념 없음 |


#### 이제부터 사용해보자
> 타 프로젝트 사용 구조를 살펴보자

<img width="843" alt="image" src="https://github.com/user-attachments/assets/829b4051-77c1-4795-ba62-7f637ab73ca4">

#### 좀 더 자세히 살펴볼까?
![image](https://github.com/user-attachments/assets/6025bdd1-a8d2-4991-82dc-f16075bb4afd)


- 대략적으로 이 정도 흐름으로 파악하고 실제 도입을 시도!

### 실제 적용된 주문서비스 내 코드
<img width="463" alt="image" src="https://github.com/user-attachments/assets/350119aa-97dd-411f-896c-75fe80651029">


```kotlin
fun OrderProduct.toOrderProducts(): OrderProduct {
    return OrderProduct(
        id = this.id,
        orderId = this.orderId,
        productId = this.productId,
        quantity = this.quantity,
        price = this.price,
        discountedPrice = this.discountedPrice,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

...

orderProducts = this.orderProducts.map { it.toOrderProducts() }
```

### 도입 효과는?
#### 1. 관심사의 분리:
- 데이터 변환 로직을 별도의 함수로 분리함으로써 코드의 구조가 더 깔끔
- 각 객체(User, UserDTO, CreateUserRequest)는 자신의 책임에만 집중 가능
#### 2. 코드 재사용성:
- 이러한 변환 함수들은 애플리케이션의 여러 부분에서 재사용 가능
- 예를 들어, 사용자 생성, 수정, 조회 등 여러 API에서 동일한 변환 로직 사용 가능
#### 3. 유지보수성 향상:
- 변환 로직이 한 곳에 집중되어 있어 수정이 필요할 때 쉽게 찾고 변경 가능.
- 새로운 필드가 추가되거나 변경될 때, 변환 함수만 수정
#### 4. 타입 안정성:
- Kotlin의 강력한 타입 시스템을 활용하여 컴파일 시점에 많은 오류를 잡을 수 있음
- 잘못된 타입의 데이터가 전달되는 것을 방지
#### 5. 계층 간 데이터 흐름 명확화:
- 예를 들어, 클라이언트 요청(CreateUserRequest) → 도메인 객체(User) → DTO(UserDTO) 등의 데이터 흐름을 명확하게 표현
#### 6. 보안 강화:
- DTO를 사용함으로써 클라이언트에 노출되지 않아야 할 민감한 정보를 숨길 수 있음
#### 7. 테스트 용이성:
변환 함수들은 독립적이고 순수한 함수이므로 단위 테스트를 작성하기 쉬움
#### 8. 확장성:
- 새로운 요구사항이 생겼을 때 기존 코드를 크게 수정하지 않고도 새로운 변환 함수를 쉽게 추가 가능
#### 9. API 버전 관리:
- 다른 버전의 API를 위해 다른 DTO를 사용해야 할 때, 새로운 변환 함수를 쉽게 추가 가능

### 회고
- 사용하는 언어의 장점을 살려 코드 작성하는 부분은 중요

---
#### 참고문헌
- [kotlin-spring-boot-example](https://github.com/gurkanucar/kotlin-spring-boot-example)
