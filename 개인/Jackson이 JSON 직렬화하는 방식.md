## Jackson이 JSON 직렬화하는 방식
> 작성날짜: 25.07.14

### Jackson이 JSON 직렬화하는 방식
> Spring Boot에서 사용하는 Jackson 라이브러리는 기본적으로 다음 순서로 객체를 JSON으로 변환합니다:

1. Getter 메서드를 우선적으로 사용 🔥
2. Public 필드가 있으면 직접 접근
3. 둘 다 없으면 직렬화 실패


```java
// 1. Getter가 없는 경우 (직렬화 실패)
public class BadExample {
    private String name;
    private int age;
    
    // getter 없음 → Jackson이 JSON으로 변환 불가능
    // 결과: 406 Not Acceptable 또는 빈 JSON {}
}

// 2. Getter가 있는 경우 (직렬화 성공)
public class GoodExample {
    private String name;
    private int age;
    
    // Jackson이 이 getter들을 통해 JSON 생성
    public String getName() { return name; }
    public int getAge() { return age; }
    
    // 결과: {"name":"John","age":25}
}

// 3. Public 필드인 경우 (직렬화 성공)
public class PublicFieldExample {
    public String name;  // public이므로 직접 접근 가능
    public int age;
    
    // getter 없어도 Jackson이 직접 필드에 접근
    // 결과: {"name":"John","age":25}
}

// 4. JsonProperty 어노테이션 사용
public class AnnotationExample {
    @JsonProperty("userName")
    private String name;
    
    @JsonProperty("userAge") 
    private int age;
    
    // getter 없어도 어노테이션으로 직렬화 가능
    // 결과: {"userName":"John","userAge":25}
}
```
