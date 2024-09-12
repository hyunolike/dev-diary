## DB와의 상호작용이 필요한 테스트코드는 어떻게 작성할까
> 작성날짜: 24.09.12

### 상황
- 주문 생성 API 에서 데이터 상태값 검증 필요
  - ex. 재고 수량 업데이트, 배송 상태 ...
- 상용 데이터베이스와 별개로 테스트를 진행하고 싶음

### `Database Rider` 라이브러리를 사용해보자
<img width="1005" alt="image" src="https://github.com/user-attachments/assets/2afa6e03-2ca9-41f7-b161-057d329d9ed4">

- 준비한 데이터를 기반으로 서비스 검증 가능
- 인메모리 데이터베이스 사용

#### 특징
1. 데이터셋 관리: YAML, JSON, XML 등 다양한 형식으로 테스트 데이터 정의
2. 데이터베이스 시딩: 테스트 실행 전에 데이터베이스에 필요한 데이터를 쉽게 삽입
3. 데이터 검증: 테스트 후 데이터베이스 상태를 쉽게 확인
4. JUnit 통합: JUnit과 원활하게 통합되어 테스트 프로세스를 자동화
5. 다양한 데이터베이스 지원: 여러 종류의 관계형 데이터베이스와 호환
6. 트랜잭션 관리: 테스트 간 데이터 격리를 보장

#### 테스트 데이터셋 준비하기
<img width="684" alt="image" src="https://github.com/user-attachments/assets/69de42d1-2056-4921-872c-d2717a2359f1">

- 테스트 기능 위에 준비된 파일 어노테이션 준비

#### 준비한 테스트 데이터셋으로 테스트하기
<img width="560" alt="image" src="https://github.com/user-attachments/assets/62421166-f048-4890-bd90-f69a94472218">

- 테스트 데이터 셋은 데이터베이스에 자동 준비
- 기대값 데이터 셋은 변경된 데이터베이스 내 데이터와 비교 검증 진행

#### 예시 코드
```kotlin
@DbUnit(driver = "org.h2.Driver", url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")
@ExtendWith(DBUnitExtension::class)
@SpringBootTest
class OrderServiceIntegrationTest {

    @Autowired
    lateinit var orderService: OrderService

    @Test
    @DataSet("datasets/orders.yml")
    @ExpectedDataSet("datasets/expected-orders.yml")
    fun `주문 처리 후 상태가 변경되어야 한다`() {
        val result = orderService.processOrder(1L)
        assertEquals("PROCESSED", result.status)
    }

    @Test
    @DataSet("datasets/orders.yml")
    fun `존재하지 않는 주문에 대해 예외가 발생해야 한다`() {
        assertThrows<OrderNotFoundException> {
            orderService.processOrder(999L)
        }
    }
}
```
### 검증 프로세스 요약
1. 데이터베이스 상태 검증 `@ExpectedDataSet`
2. 예상 데이터 셋 이용
3. 데이터베이스 검증 프로세스
  1. 테스트 메소드 실행 전: @DataSet에 정의된 초기 데이터가 데이터베이스에 로드
  2. 테스트 메소드 실행: orderService.processOrder(1L)가 호출되어 주문 상태를 변경
  3. 테스트 메소드 실행 후: Database Rider가 자동으로 데이터베이스의 현재 상태와 @ExpectedDataSet에 정의된 예상 상태를 비교
4. 종합적 검증
5. 검증 범위 선정

### 위와 같은 테스트 진행 이점은?
- 서비스 메소드의 반환값 뿐 아니라 데이터베이스의 실제 상태 변화까지 포괄적 검증 가능
- 데이터의 일관성 + 비즈니스 로직의 정확성 보장!
- 서비스 계층 + 데이터 접근 계층 전체 로직의 정확성 검증 가능

### 회고
- 주문 생성 API 테스트에 사용해보자

---
#### 참고문헌
- [리팩토링을 위한 통합 테스트](https://medium.com/musinsa-tech/%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%86%B5%ED%95%A9-%ED%85%8C%EC%8A%A4%ED%8A%B8-cd23498918a7)
