---
title: "JUnit 5 & Mockito 정리"
slug: junit-5-mockito-정리
date: "2025-08-17"
category: 개인
tags: ["테스트", "Java"]
summary: "JUnit 5 애노테이션과 Assertion부터 Mockito의 스터빙·호출 검증·ArgumentCaptor, 테스트 더블 다섯 종류까지 실제로 쓰는 문법만 예제로 모아둔 장문의 레퍼런스다."
featured: false
---
## JUnit 5 & Mockito 정리
> 작성날짜: 25.08.17

### 1. JUnit 5 기본 문법
#### 1.1 기본 애노테이션
```java
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)  // Mockito 확장 활성화
@DisplayName("클래스 설명")
class MyTest {
    
    @BeforeAll
    static void beforeAll() {
        // 모든 테스트 실행 전 1번만 실행 (static 메서드)
    }
    
    @BeforeEach
    void beforeEach() {
        // 각 테스트 실행 전마다 실행
    }
    
    @Test
    @DisplayName("테스트 설명")
    void testMethod() {
        // 테스트 로직
    }
    
    @AfterEach
    void afterEach() {
        // 각 테스트 실행 후마다 실행
    }
    
    @AfterAll
    static void afterAll() {
        // 모든 테스트 실행 후 1번만 실행 (static 메서드)
    }
}
```

#### 1.2 테스트 그룹화 (@Nested)
```java
@Nested
@DisplayName("사용자 생성 테스트")
class UserCreationTest {
    
    @Nested
    @DisplayName("유효한 입력값")
    class ValidInput {
        @Test
        void shouldCreateUserWithValidName() {}
    }
    
    @Nested
    @DisplayName("유효하지 않은 입력값")
    class InvalidInput {
        @Test
        void shouldThrowExceptionWithNullName() {}
    }
}
```

#### 1.3 조건부 테스트
```java
@Test
@EnabledOnOs(OS.LINUX)          // Linux에서만 실행
void onlyOnLinux() {}

@Test
@DisabledOnOs(OS.WINDOWS)       // Windows에서는 실행 안함
void notOnWindows() {}

@Test
@EnabledOnJre(JRE.JAVA_11)      // Java 11에서만 실행
void onlyOnJava11() {}

@Test
@EnabledIfSystemProperty(named = "os.arch", matches = ".*64.*")
void only64Bit() {}

@Test
@EnabledIfEnvironmentVariable(named = "ENV", matches = "local")
void onlyInLocalEnv() {}
```


#### 1.4 반복 테스트
```java
@RepeatedTest(5)
@DisplayName("5번 반복 테스트")
void repeatedTest(RepetitionInfo repetitionInfo) {
    System.out.println("실행 횟수: " + repetitionInfo.getCurrentRepetition());
}

@ParameterizedTest
@ValueSource(strings = {"apple", "banana", "cherry"})
void testWithValueSource(String fruit) {
    assertNotNull(fruit);
}

@ParameterizedTest
@CsvSource({
    "1, apple",
    "2, banana", 
    "3, cherry"
})
void testWithCsvSource(int id, String name) {
    assertTrue(id > 0);
    assertNotNull(name);
}

@ParameterizedTest
@MethodSource("stringProvider")
void testWithMethodSource(String argument) {
    assertNotNull(argument);
}

static Stream<String> stringProvider() {
    return Stream.of("apple", "banana");
}
```

#### 1.5 테스트 비활성화
```java
@Test
@Disabled("아직 구현되지 않음")
void disabledTest() {}

@Test
@DisabledIf("java.time.LocalDate.now().getDayOfWeek().toString().equals('SUNDAY')")
void notOnSunday() {}
```

### 2. JUnit 5 Assertions
#### 2.1 기본 Assertions
```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void basicAssertions() {
    // 기본 검증
    assertTrue(condition);
    assertFalse(condition);
    assertNull(object);
    assertNotNull(object);
    
    // 값 비교
    assertEquals(expected, actual);
    assertEquals(expected, actual, "실패 시 메시지");
    assertNotEquals(unexpected, actual);
    
    // 참조 비교
    assertSame(expected, actual);      // 같은 객체 참조
    assertNotSame(unexpected, actual); // 다른 객체 참조
    
    // 배열/컬렉션
    assertArrayEquals(expectedArray, actualArray);
    assertIterableEquals(expectedList, actualList);
    
    // 문자열
    assertEquals("Hello", actual);
    assertTrue(actual.contains("substring"));
    assertTrue(actual.startsWith("prefix"));
    
    // 숫자 (부동소수점)
    assertEquals(3.14, actual, 0.01);  // delta 허용 오차
    
    // 타입 검증
    assertInstanceOf(String.class, object);
}
```

#### 2.2 예외 Assertions
```java
@Test
void exceptionAssertions() {
    // 예외 발생 검증
    assertThrows(IllegalArgumentException.class, () -> {
        throw new IllegalArgumentException("잘못된 인수");
    });
    
    // 예외 발생하지 않음 검증
    assertDoesNotThrow(() -> {
        // 정상 실행되어야 하는 코드
    });
    
    // 예외 객체 자세히 검증
    Exception exception = assertThrows(IllegalArgumentException.class, () -> {
        throw new IllegalArgumentException("특정 메시지");
    });
    assertEquals("특정 메시지", exception.getMessage());
    
    // 특정 시간 내 완료 검증
    assertTimeout(Duration.ofSeconds(2), () -> {
        // 2초 안에 완료되어야 하는 코드
        Thread.sleep(1000);
    });
    
    // 시간 초과 시 즉시 중단
    assertTimeoutPreemptively(Duration.ofSeconds(2), () -> {
        Thread.sleep(1000);
    });
}
```

#### 2.3 그룹 Assertions
```java
@Test
void groupedAssertions() {
    // 모든 assertion을 실행하고 실패한 것들을 모두 보고
    assertAll("사용자 정보 검증",
        () -> assertEquals("John", user.getFirstName()),
        () -> assertEquals("Doe", user.getLastName()),
        () -> assertEquals(30, user.getAge())
    );
}
```

#### 2.4 커스텀 메시지
```java
@Test
void customMessages() {
    // 문자열 메시지
    assertEquals(expected, actual, "값이 일치하지 않습니다");
    
    // Supplier로 지연 계산 (실패할 때만 계산)
    assertEquals(expected, actual, () -> "복잡한 계산: " + expensiveCalculation());
}
```

### 3. Mockito 기본 문법
#### 3.1 Mock 생성
```java
import org.mockito.*;
import static org.mockito.Mockito.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class MockTest {
    // 1. 애노테이션 방식
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private EmailService emailService;
    
    @InjectMocks  // Mock들이 주입될 대상
    private UserService userService;
    
    // 2. 프로그래밍 방식
    @Test
    void programmaticMockCreation() {
        UserRepository mockRepo = mock(UserRepository.class);
        EmailService mockEmail = mock(EmailService.class);
        
        // 또는 타입 안전한 방식
        UserRepository mockRepo2 = Mockito.mock(UserRepository.class);
    }
}
```

#### 3.2 Spy 생성
```java
@Spy
private List<String> spyList = new ArrayList<>();

@Test
void spyExample() {
    // 실제 객체의 일부 메서드만 Mock
    List<String> list = new ArrayList<>();
    List<String> spyList = spy(list);
    
    // 실제 메서드 호출
    spyList.add("one");
    assertEquals(1, spyList.size());  // 실제 동작
    
    // 특정 메서드만 Mock
    when(spyList.size()).thenReturn(100);
    assertEquals(100, spyList.size());  // Mocked 결과
}
```

### 4. Stubbing (when-then 패턴)
#### 4.1 기본 Stubbing
```java
@Test
void basicStubbing() {
    // 기본 when-then
    when(userRepository.findById(1L)).thenReturn(user);
    when(userRepository.findById(2L)).thenReturn(null);
    
    // BDD 스타일 (given-will)
    given(userRepository.findById(1L)).willReturn(user);
    
    // 메서드 체이닝
    when(userRepository.findById(anyLong()))
        .thenReturn(user1)
        .thenReturn(user2)
        .thenThrow(new RuntimeException());
}
```

#### 4.2 다양한 반환 패턴
```java
@Test
void returnPatterns() {
    // 단순 값 반환
    when(userRepository.count()).thenReturn(10L);
    
    // 여러 값 순차 반환
    when(userRepository.findAll())
        .thenReturn(Arrays.asList(user1))
        .thenReturn(Arrays.asList(user1, user2))
        .thenReturn(Collections.emptyList());
    
    // 예외 발생
    when(userRepository.findById(-1L))
        .thenThrow(new IllegalArgumentException("Invalid ID"));
    
    // 여러 예외 타입
    when(userRepository.save(any()))
        .thenThrow(IllegalArgumentException.class)
        .thenThrow(new RuntimeException("DB Error"));
    
    // 콜백 함수 사용
    when(userRepository.findById(anyLong())).thenAnswer(invocation -> {
        Long id = invocation.getArgument(0);
        return id > 0 ? new User(id, "User" + id) : null;
    });
    
    // 실제 메서드 호출
    when(userRepository.findById(anyLong())).thenCallRealMethod();
    
    // void 메서드에 예외 발생
    doThrow(new RuntimeException()).when(emailService).sendEmail(any());
    
    // void 메서드 아무것도 안함
    doNothing().when(emailService).sendEmail(any());
}
```

#### 4.3 Argument Matchers
```java
@Test
void argumentMatchers() {
    // 기본 matchers
    when(userRepository.findById(any())).thenReturn(user);
    when(userRepository.findById(anyLong())).thenReturn(user);
    when(userRepository.findById(eq(1L))).thenReturn(user);
    
    // 타입별 matchers
    when(service.process(anyString())).thenReturn("result");
    when(service.calculate(anyInt())).thenReturn(100);
    when(service.isValid(anyBoolean())).thenReturn(true);
    when(service.findByEmail(anyCollection())).thenReturn(users);
    when(service.findByIds(anyList())).thenReturn(users);
    when(service.findByMap(anyMap())).thenReturn(user);
    
    // 조건부 matchers
    when(userRepository.findById(argThat(id -> id > 0))).thenReturn(user);
    when(userRepository.findByAge(intThat(age -> age >= 18))).thenReturn(users);
    
    // 문자열 matchers
    when(userRepository.findByName(startsWith("John"))).thenReturn(user);
    when(userRepository.findByName(endsWith("Doe"))).thenReturn(user);
    when(userRepository.findByName(contains("oh"))).thenReturn(user);
    when(userRepository.findByName(matches("J.*n"))).thenReturn(user);
    
    // null 체크
    when(userRepository.findByEmail(isNull())).thenReturn(null);
    when(userRepository.findByEmail(isNotNull())).thenReturn(user);
    
    // varargs
    when(service.concatenate(any(), any(), any())).thenReturn("result");
}
```

### 5. Verification (검증)
#### 5.1 기본 Verification
```java
@Test
void basicVerification() {
    // 서비스 호출
    userService.createUser("John", "john@email.com");
    
    // 메서드 호출 검증
    verify(userRepository).save(any(User.class));
    verify(emailService).sendWelcomeEmail("john@email.com");
    
    // 호출 횟수 검증
    verify(userRepository, times(1)).save(any());
    verify(userRepository, never()).delete(any());
    verify(userRepository, atLeastOnce()).save(any());
    verify(userRepository, atMost(3)).save(any());
    verify(userRepository, atLeast(1)).save(any());
    
    // 정확한 인수로 호출되었는지 검증
    verify(userRepository).save(argThat(user -> 
        "John".equals(user.getName()) && "john@email.com".equals(user.getEmail())
    ));
}
```

#### 5.2 호출 순서 검증 (InOrder)
```java
@Test
void verificationOrder() {
    // 서비스 호출
    userService.createUser("John", "john@email.com");
    
    // 순서 검증
    InOrder inOrder = inOrder(userRepository, emailService);
    inOrder.verify(userRepository).save(any(User.class));
    inOrder.verify(emailService).sendWelcomeEmail("john@email.com");
}
```

#### 5.3 추가 검증
```java
@Test
void additionalVerifications() {
    // 서비스 호출
    userService.findUser(1L);
    
    // 더 이상 상호작용 없음 검증
    verify(userRepository).findById(1L);
    verifyNoMoreInteractions(userRepository);
    
    // 전혀 상호작용 없음 검증
    verifyNoInteractions(emailService);
    
    // 시간 제한 내 호출 검증
    verify(userRepository, timeout(1000)).save(any());
    verify(userRepository, timeout(1000).times(1)).save(any());
}
```

#### 5.4 ArgumentCaptor
```java
@Test
void argumentCaptor() {
    // ArgumentCaptor 생성
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    
    // 서비스 호출
    userService.createUser("John", "john@email.com");
    
    // 인수 캡처 및 검증
    verify(userRepository).save(userCaptor.capture());
    User capturedUser = userCaptor.getValue();
    
    assertEquals("John", capturedUser.getName());
    assertEquals("john@email.com", capturedUser.getEmail());
    
    // 여러 호출 시 모든 인수 캡처
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);
    verify(emailService, times(3)).sendEmail(stringCaptor.capture());
    List<String> allEmails = stringCaptor.getAllValues();
    assertEquals(3, allEmails.size());
}
```

### 6. 고급 Mockito 기능
#### 6.1 Answer 인터페이스
```java
@Test
void customAnswers() {
    // Answer 인터페이스로 복잡한 로직 구현
    when(userRepository.findById(anyLong())).thenAnswer(invocation -> {
        Long id = invocation.getArgument(0);
        if (id <= 0) throw new IllegalArgumentException();
        return new User(id, "User" + id);
    });
    
    // 인수 기반 답변
    when(calculator.add(anyInt(), anyInt())).thenAnswer(invocation -> {
        int a = invocation.getArgument(0);
        int b = invocation.getArgument(1);
        return a + b;
    });
}
```

#### 6.2 Partial Mocking
```java
@Test
void partialMocking() {
    UserService realService = new UserService(userRepository);
    UserService spyService = spy(realService);
    
    // 일부 메서드만 Mock
    doReturn("mocked").when(spyService).generateId();
    
    // 나머지는 실제 메서드 호출
    String result = spyService.createUser("John");
}
```

#### 6.3 Mock 설정
```java
@Test
void mockSettings() {
    // 이름 부여 (디버깅용)
    UserRepository namedMock = mock(UserRepository.class, "UserRepo Mock");
    
    // 기본 답변 설정
    UserRepository mockWithDefaults = mock(UserRepository.class, RETURNS_DEEP_STUBS);
    
    // 엄격한 Mock (불필요한 stubbing 검출)
    UserRepository strictMock = mock(UserRepository.class, withSettings().strictness(Strictness.STRICT_STUBS));
}
```

### 7. BDD 스타일 (BDDMockito)
```java
import static org.mockito.BDDMockito.*;

@Test
void bddStyle() {
    // given (준비)
    given(userRepository.findById(1L)).willReturn(user);
    given(emailService.isValidEmail("test@email.com")).willReturn(true);
    
    // when (실행)
    User result = userService.getUser(1L);
    
    // then (검증)
    then(userRepository).should().findById(1L);
    then(emailService).should(never()).sendEmail(anyString());
    then(userRepository).shouldHaveNoMoreInteractions();
}
```

### 8. 테스트 더블 종류와 특징
#### 8.1 Dummy
```java
// 단순히 인스턴스화만 필요한 객체
User dummy = mock(User.class);  // 메서드 호출 안함
```

#### 8.2 Fake
```java
// 실제 동작하는 구현체 (단순화된 버전)
class FakeUserRepository implements UserRepository {
    private Map<Long, User> users = new HashMap<>();
    
    @Override
    public User save(User user) {
        users.put(user.getId(), user);
        return user;
    }
}
```

#### 8.3 Stub
```java
// 미리 준비된 답변만 제공
when(userRepository.findById(1L)).thenReturn(user);
```

#### 8.4 Mock
```java
// 행위 검증이 주목적
verify(userRepository).save(any(User.class));
```

#### 8.5 Spy
```java
// 실제 객체의 일부분만 Mock
List<String> spyList = spy(new ArrayList<>());
when(spyList.size()).thenReturn(100);
```

### 9. 실무 활용 패턴
#### 9.1 Service Layer 테스트
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;
    @InjectMocks private UserService userService;
    
    @Test
    void shouldCreateUserSuccessfully() {
        // given
        String name = "John";
        String email = "john@test.com";
        User expectedUser = new User(1L, name, email);
        
        given(userRepository.save(any(User.class))).willReturn(expectedUser);
        given(emailService.isValidEmail(email)).willReturn(true);
        
        // when
        User result = userService.createUser(name, email);
        
        // then
        assertThat(result.getName()).isEqualTo(name);
        then(userRepository).should().save(any(User.class));
        then(emailService).should().sendWelcomeEmail(email);
    }
}
```

#### 9.2 통합 테스트와 Mock 조합
```java
@SpringBootTest
class IntegrationTest {
    @Autowired private UserService userService;
    @MockBean private EmailService emailService;  // Spring Boot의 Mock
    
    @Test
    void integrationTestWithMock() {
        // given
        given(emailService.sendEmail(any())).willReturn(true);
        
        // when & then
        userService.registerUser("test@email.com");
        
        verify(emailService).sendEmail(argThat(email -> 
            email.contains("Welcome")));
    }
}
```

