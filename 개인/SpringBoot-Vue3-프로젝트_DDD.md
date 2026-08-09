---
title: "Spring Boot + Vue3 DDD"
slug: spring-boot-vue3-ddd
date: "2025-07-14"
category: 개인
tags: ["Spring Boot", "Vue", "DDD", "아키텍처"]
summary: "Request에서 Command, Entity를 거쳐 Response로 이어지도록 계층별 객체를 갈라 스프링 부트 패키지 구조를 잡고, 같은 기준으로 Vue 3 쪽 구조와 견줘본 정리."
featured: false
---
## Spring Boot + Vue3 DDD 
> 작성날짜: 25.07.14

### Spring Boot 패키지 구조
> Request → Command → Entity → Response

```
com.example.userapp
├── controller
│   └── UserController.java
├── service
│   └── UserService.java
├── domain
│   └── User.java
├── dto
│   ├── UserRequest.java       // Request DTO (입력값)
│   ├── UserCommand.java       // Command 객체 (서비스 계층)
│   └── UserResponse.java      // Response DTO (출력값)
├── repository
│   └── UserRepository.java
└── exception
    └── GlobalExceptionHandler.java


[요약 흐름]
[Client JSON 요청]
  ↓
UserRequest (Controller)
  → toCommand()
  ↓
UserCommand (Service)
  → User.from(command)
  ↓
User (Entity 저장)
  → UserResponse 로 변환
  ↓
[Client JSON 응답]


```

### ✅ 계층별 객체 분리 (Layered Architecture with Role-specific Objects)
<img width="533" height="223" alt="image" src="https://github.com/user-attachments/assets/8121bdd7-0150-4032-b929-01d0a542413a" />

#### Command 객체
→ 클라이언트로부터 전달된 명령(의도) 를 표현하는 객체. 주로 서비스 계층에서 사용되어 비즈니스 로직의 입력 값으로 전달됨 <br/>
→ CreateUserCommand, UpdateOrderCommand 와 같은 이름으로 쓰임

#### DTO (Data Transfer Object)
→ 계층 간 데이터 전달용 객체. 순수 데이터만 담으며 로직 없음 <br/>
→ UserDto, OrderResponseDto 등

#### Entity / Domain 객체
→ DB 테이블 매핑 객체 또는 도메인 로직을 포함하는 객체

### 예시 코드
#### 1. RequestDTO (UserRequest.java)
```java
public class UserRequest {
  private String name;
  private String email;

  // 생성자, getter
    public UserRequest(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() { return name; }
    public String getEmail() { return email; }

    public UserCommand toCommand() {
      return new UserCommand(name, email);
    }
}
```

#### 2. Command 객체 (UserCommand.java)
```java
public class UserCommand {
    private final String name;
    private final String email;

    public UserCommand(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() { return name; }
    public String getEmail() { return email; }
}
```

#### 3. Entity (User.java)
```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;

    private String name;
    private String email;

    protected User() {} // JPA용

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    public static User from(UserCommand command) {
        return new User(command.getName(), command.getEmail());
    }
}
```

#### 4. Response DTO (UserResponse.java)
```java
public class UserResponse {
    private final Long id;
    private final String name;
    private final String email;

    public UserResponse(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}
```

#### 실제 사용
```java
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse createUser(UserCommand command) {
        User user = User.from(command);
        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getName(), saved.getEmail());
    }
}

```

---
### Vue 3 패키지 구조
```
src/
├── api/                 # 백엔드 API 연동 모듈 (axios 인스턴스 포함)
│   └── userApi.js
├── components/          # 재사용 가능한 컴포넌트
│   └── UserForm.vue
├── pages/               # 페이지 단위 뷰 (라우터와 연결됨)
│   └── UserCreatePage.vue
├── stores/              # Pinia 상태 관리
│   └── userStore.js
├── types/               # 타입 정의 (TypeScript 또는 JS용 인터페이스)
│   └── user.js
├── router/              # Vue Router 설정
│   └── index.js
├── App.vue              # 루트 컴포넌트
└── main.js              # 앱 엔트리포인트



[흐름 요약]
[UserCreatePage.vue]
  ↓ 폼 입력
[UserForm.vue]
  ↓ emit("submit", data)
[Pinia userStore.js]
  → userApi.createUser(data)
  → 성공 시 상태 업데이트
```

---
### 비교 
<img width="401" height="250" alt="image" src="https://github.com/user-attachments/assets/4c9cc870-840f-48a6-b480-78bccd86b8c4" />



