---
title: "Java의 Record Class (feat. Kotlin의 Data Class)"
slug: java의-record-class-feat-kotlin의-data-class
date: "2024-10-27"
category: 개인
tags: ["Java", "Kotlin"]
summary: "자바 Record를 코틀린 Data Class와 나란히 놓고, 계층 사이 데이터 전달(DTO) 지점에서 두 언어가 같은 문제를 어떻게 푸는지 비교한 정리."
featured: false
---
## Java의 Record Class (feat. Kotlin의 Data Class)
> 작성날짜: 24.10.27

### 새롭게 등장한 Record Class 
#### 먼저 구체적으로 알아보기 전에 Kotlin Data Class 랑 비교해보자
<img width="555" alt="image" src="https://github.com/user-attachments/assets/c8b3bc87-9fe8-4d16-ae8e-0b0d4d38fa99">

- 자바에서 새롭게 등장한 Record Class를 딱 보자마자 생각이 든거는 코틀린의 Data Class랑 유사하다는 점이다

#### 공통점은? `Record Class` `Data Class`
- 자동 생성된 toString(), equals(), hashCode() 메서드 제공
- 주로 Dto(Data Transfer Object) 용도로 사용
- 간결한 문법으로 데이터 믈래스 정의 가능

#### 그렇다면 레이어 구조 관점에서 살펴보자
<img width="760" alt="image" src="https://github.com/user-attachments/assets/f513f8a1-d0c7-408c-bf4d-349315ce8fce">

- 각각 데이터 객체 전달하는 시점 (`Dto`) 에 사용하는 걸 볼 수 있다


#### 그렇다면 `Dto` 의 개념에 대해 정확히 알아보자 `Dto(Data Transfer Object)` 패턴
1. 계층 간 명확한 데이터 전달
    - 각 계층별로 필요한 데이터만 포함
    - 계층 간 의존성 최소화
2. 불변성 보장
    - Record/Data Class는 불변 객체로 처리되어 데이터 일관성 유지
    - 부수 효과 방지
3. 변환 로직의 캡슐화
    - from() 메서드를 통한 객체 변환 로직 집중화
    - 반복적인 매핑 코드 제거
4. 명확한 책임 분리
    - Request/Response: API 계약 관리
    - Command: 비즈니스 요청 캡슐화
    - DTO: 계층 간 데이터 전달
    - Entity: 영속성 관리
5. 유지보수성 향상
    - 각 객체의 역할이 명확해 코드 이해도 증가
    - 변경 사항 적용이 용이

#### 이제는 일반 클래스과 비교해보자 
<img width="576" alt="image" src="https://github.com/user-attachments/assets/a831ecd8-e58a-4a0b-beb8-17fad146204a">

#### 일반클래스와의 주요 차이점은?
<img width="530" alt="image" src="https://github.com/user-attachments/assets/a93cfd36-2d14-4588-90dd-2ba6125e1373">

#### 각각 어떻게 사용하면 좋을까?
<img width="280" alt="image" src="https://github.com/user-attachments/assets/96f491a3-e5b5-4179-94df-2253c22a7a15">

### Java Record Class에 대해 좀 더 살펴보자
<img width="557" alt="image" src="https://github.com/user-attachments/assets/ab37c599-4470-47e3-aa3c-896c96c90e17">

```java
// Java Record 버전
[🚩 Request Obj]
public record CreateUserRequestRecord(
 
    String name,
    String email,
    Integer age
) {}

[🚩 Command Obj]
public record CreateUserCommandRecord(
    String name,
    String email,
    Integer age
) {
    public static CreateUserCommandRecord from(CreateUserRequestRecord request) {
        return new CreateUserCommandRecord(
            request.name(),
            request.email(),
            request.age()
        );
    }
}

[🚩 Dto Obj]
public record UserDtoRecord(
    Long id,
    String name,
    String email,
    Integer age
) {
    public static UserDtoRecord from(UserEntity entity) {
        return new UserDtoRecord(
            entity.getId(),
            entity.getName(),
            entity.getEmail(),
            entity.getAge()
        );
    }
}

[🚩 Response Obj]
public record UserResponseRecord(
    Long id,
    String name,
    String email,
    Integer age
) {
    public static UserResponseRecord from(UserDtoRecord dto) {
        return new UserResponseRecord(
            dto.id(),
            dto.name(),
            dto.email(),
            dto.age()
        );
    }
}
```

### 자바의 Record Class vs 코틀린의 Data Class 사용 사례를 비교해보자
#### 코틀린의 Data Class
```kotlin
// Kotlin Data Class Version - 더 간결하고 기능적인 버전
data class CreateUserCommand(
    val name: String,
    val email: String,
    val age: Int
) {
    // 유효성 검사를 위한 init 블록
    init {
        require(name.isNotBlank()) { "Name cannot be blank" }
        require(email.matches(Regex("^[A-Za-z0-9+_.-]+@(.+)$"))) { "Invalid email format" }
        require(age in 0..150) { "Age must be between 0 and 150" }
    }

    companion object {
        // Type-safe builder pattern
        fun builder() = Builder()

        // from 함수에 검증 로직 포함
        fun from(request: CreateUserRequest) = CreateUserCommand(
            name = request.name.trim(),
            email = request.email.toLowerCase(),
            age = request.age
        )
    }

    // Builder 패턴 (선택적)
    class Builder {
        private var name: String = ""
        private var email: String = ""
        private var age: Int = 0

        fun name(name: String) = apply { this.name = name }
        fun email(email: String) = apply { this.email = email }
        fun age(age: Int) = apply { this.age = age }
        fun build() = CreateUserCommand(name, email, age)
    }

    // Kotlin의 확장 함수를 활용한 유틸리티 메서드
    fun toLog(): String = "CreateUserCommand(name=$name, email=$email)"
    
    // 부분 업데이트를 위한 copy 확장
    fun withUpdatedEmail(newEmail: String) = copy(email = newEmail)
}
```

#### 자바의 Record Class
```java
// Java Record Version - 불변성과 명확한 API를 강조
public record CreateUserCommandRecord(
    String name,
    String email,
    Integer age
) {
    // Compact constructor for validation
    public CreateUserCommandRecord {
        Objects.requireNonNull(name, "Name cannot be null");
        Objects.requireNonNull(email, "Email cannot be null");
        Objects.requireNonNull(age, "Age cannot be null");
        
        if (name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Age must be between 0 and 150");
        }
    }

    // Static factory method
    public static CreateUserCommandRecord from(CreateUserRequestRecord request) {
        return new CreateUserCommandRecord(
            request.name().trim(),
            request.email().toLowerCase(),
            request.age()
        );
    }

    // Custom getter with additional logic
    public String getNameUpperCase() {
        return name.toUpperCase();
    }

    // Utility method using Java 17+ features
    public boolean isAdult() {
        return age >= 18;
    }

    // Factory method for partial updates
    public CreateUserCommandRecord withUpdatedEmail(String newEmail) {
        return new CreateUserCommandRecord(this.name, newEmail, this.age);
    }

    // toString override for logging
    @Override
    public String toString() {
        return String.format("CreateUserCommand[name=%s, email=%s]", name, email);
    }
}
```

### 회고 
- 현재 코틀린 Data Class를 사용한것처럼 자바에서도 Record Class 기능의 활용으로 자바 언어 개발 시 유용할 거 같다.
- 실무에서 자바 언어 개발 시, 해당 Record Class 도입을 추진해봐도 좋을 거 같다.
