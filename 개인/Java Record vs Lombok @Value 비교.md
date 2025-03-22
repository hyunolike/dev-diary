## Java Record vs Lombok @Value 비교
> 작성날짜: 25.03.22

<img width="672" alt="image" src="https://github.com/user-attachments/assets/7570216f-e3e3-49c9-a847-fe234a69bde4" />


### 공통점
- 둘 다 불변(immutable) 객체를 생성하는 데 사용됨
- 빌드 과정에서 일반 자바 코드로 변환됨
- 둘 다 일종의 '문법 설탕'(syntactic sugar) 역할

### 차이점
#### 상속 관련
- **@Value**: 클래스 상속 가능
- **Record**: 다른 클래스 상속 불가능 (enum과 유사), 하지만 인터페이스 구현은 가능

#### 접근자(getter) 설정
- **@Value**: `@Getter(AccessLevel.NONE)`으로 기본 getter를 완전히 제거 가능
- **Record**: 기본 접근자 재정의 가능 (컴포넌트와 리턴 타입이 일치하고 throws를 선언하지 않아야 함)

#### 구조적 특징
- **Record**:
  - 코틀린의 primary constructor와 유사한 레코드 헤더에 컴포넌트 목록 선언
  - 이를 통해 private 필드와 간단한 접근자 메소드가 자동 생성됨

#### 생성자 유형
- **Record**: 두 가지 canonical 생성자 지원
  - Normal canonical constructor: 일반 클래스 생성자와 유사
  - Compact canonical constructor: 파라미터 목록 불필요, 필드 할당 작업 수행하지 않음
  - 값 검증, 초기화, 가공 작업에 활용 가능 (예시 코드 참조)
- **@Value**: 값 검증을 위해서는 일반 생성자를 직접 구현해야 함

### 결론
Record 사용이 권장됨 (표준 Java 기능이며 더 간결한 문법과 유연한 생성자 옵션 제공)

## 예시 코드
```java
record User(String id, String name) {
    User {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("id must not be null or blank");
        }
        
        name = name.toLowerCase();
    }
}
```


### Java Record 사용 예시
#### 1. 간결한 DTO
```java
// 기존 방식 (without record)
public class Person {
    private final String name;
    private final int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() { return name; }
    public int getAge() { return age; }
    
    @Override
    public boolean equals(Object o) { /* 생략 */ }
    
    @Override
    public int hashCode() { /* 생략 */ }
    
    @Override
    public String toString() { /* 생략 */ }
}

// Record 사용
public record Person(String name, int age) {}

public class Main {
    public static void main(String[] args) {
        // Record 생성
        Person person = new Person("홍길동", 30);
        
        // 자동 생성된 getter 사용
        System.out.println("이름: " + person.name());
        System.out.println("나이: " + person.age());
        
        // 자동 생성된 toString() 사용
        System.out.println(person); // Person[name=홍길동, age=30]
        
        // equals() 메소드 테스트
        Person person2 = new Person("홍길동", 30);
        System.out.println("동일 객체 확인: " + person.equals(person2)); // true
    }
}

```

#### 2. Compact Constructor로 유효성 검증
> 파라미터 목록 불필요, 필드 할당 작업 수행하지 않음

```java
public class Main {
    public static void main(String[] args) {
        try {
            // 유효한 값으로 생성
            Rectangle rectangle = new Rectangle(5.0, 3.0);
            System.out.println("직사각형 면적: " + rectangle.area());
            
            // 자동 생성된 toString() 사용
            System.out.println(rectangle); // Rectangle[width=5.0, height=3.0]
            
            // 예외 발생 케이스
            Rectangle invalidRectangle = new Rectangle(-1.0, 3.0);
            // 실행되지 않음 (예외 발생)
        } catch (IllegalArgumentException e) {
            System.out.println("예외 발생: " + e.getMessage());
        }
    }
}

record Rectangle(double width, double height) {
    // Compact constructor
    public Rectangle {
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Width and height must be positive");
        }
    }
    
    public double area() {
        return width * height;
    }
}
```

#### 3. 중첩 Record와 불변 데이터 구조
```java
public record Customer(String id, String name, Address address) {
    // 중첩 record 정의
    public record Address(String street, String city, String zipCode) {}
}

// 사용 예시
var address = new Customer.Address("123 Main St", "Seoul", "12345");
var customer = new Customer("C100", "Kim", address);
```


#### 4. 제네릭 활용
```java
public record Pair<K, V>(K key, V value) {}

// 사용 예시
var stringIntPair = new Pair<>("count", 42);
var userRolePair = new Pair<>(user, Role.ADMIN);
```


#### 5. 패턴 매칭과 함께 사용 (Java 21+)
```java
public sealed interface Shape permits Circle, Rectangle {}
public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}

// 패턴 매칭 사용
double area = switch (shape) {
    case Circle(var r) -> Math.PI * r * r;
    case Rectangle(var w, var h) -> w * h;
};
```

#### 6. Stream API와 함께 활용
```java
public record Employee(String id, String name, String department, double salary) {}

// 부서별 평균 급여 계산
Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.averagingDouble(Employee::salary)
    ));
```


### Record 주요 장점
```
간결성: 보일러플레이트 코드 제거
불변성: 항상 불변 객체로 생성되어 스레드 안전성 향상
자동 메소드: equals(), hashCode(), toString() 자동 구현
명확한 의도: 단순 데이터 전달 목적임을 코드로 명확히 표현
패턴 매칭과의 시너지: 구조적 패턴 매칭과 잘 어울림
직렬화 용이: JSON 변환 등에 적합
```
