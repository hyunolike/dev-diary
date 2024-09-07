## Jasypt 이용해 민감한 정보 암호화 작업 
> 작성날짜: 24.09.07

### 상황
- aws 데이터베이스 정보 원격 레포지토리 올려야되는 상황
- 보안 이슈 발생

### 시도
- `Jasypt` 라이브러리 이용

### 적용 순서
#### 1. `build.gradle` 파일 🤩 `Jasypt` 의존성 추가
```kotlin
implementation 'com.github.ulisesbocchio:jasypt-spring-boot-starter:3.0.5'
```

#### 2. application.yml 암호화할 속성 설정
```yml
spring:
  datasource:
    url: ENC(암호화된_URL)
    username: ENC(암호화된_사용자명)
    password: ENC(암호화된_비밀번호)

# 기본설정
jasypt:
  encryptor:
    algorithm: PBEWITHHMACSHA512ANDAES_256
    iv-generator-classname: org.jasypt.iv.RandomIvGenerator
```


#### 3. 암호화 생성을 위한 간단한 테스트 클래스 생성
```kotlin
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor
import org.jasypt.iv.RandomIvGenerator
import org.junit.jupiter.api.Test

class JasyptTest {

    @Test
    fun encryptProperties() {
        val encryptor = StandardPBEStringEncryptor().apply {
            setAlgorithm("PBEWITHHMACSHA512ANDAES_256")
            setPassword("your_secret_key") // JASYPT_ENCRYPTOR_PASSWORD
            setIvGenerator(RandomIvGenerator())
        }

        val url = encryptor.encrypt("jdbc:h2:mem:testdb")
        val username = encryptor.encrypt("sa")
        val password = encryptor.encrypt("yourpassword")

        println("url: $url")
        println("username: $username")
        println("password: $password")
    }
}
```

- 테스트 실행 후 암호화된 값 application.yml 파일에 적용
#### 4. (선택) Jasypt 설정을 위한 설정 클래스 생성
> 커스터마이징 가능 (세밀한 동작 + 특정 알고리즘, IV 생성기 사용하고 싶을 때 사용)

```kotlin
import org.jasypt.encryption.StringEncryptor
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor
import org.jasypt.iv.RandomIvGenerator
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JasyptConfig {

    @Bean("jasyptStringEncryptor")
    fun stringEncryptor(): StringEncryptor {
        return StandardPBEStringEncryptor().apply {
            setAlgorithm("PBEWITHHMACSHA512ANDAES_256")
            setPassword(System.getenv("JASYPT_ENCRYPTOR_PASSWORD"))
            setIvGenerator(RandomIvGenerator())
        }
    }
}
```

#### 5. (추가) intellij 이용해 환경변수 설정
<img width="629" alt="image" src="https://github.com/user-attachments/assets/1fc59213-c916-4b8c-a545-3c8c42394558">

### 실제 적용된 코드
```yml

# Database configuration for MySQL
# 암호화
spring:
  datasource:
      url: ENC(yddkldjrangZGGzGaAaEx2VaEI34o7RSEr8Sl8cY5wlj0VDz+DaOnq6Fh/01XKbgPULh5diRx5oYtvti2fGqDNKfD90ncykyp/28aO9azoQ4iLuTuQxCE0sMxQN7TkAMupQvUhhnLyJ7hobt5dw8Y63WNf2pcwRedvql7NuGAJo=)
      username: ENC(ijo4Jc/UZcp0vqbAo3zcYCFx4XXslvVNAJ8ydo2157fcmujzA7tz/rVy8Xmyp+ZS)
      password: ENC(3eqf88zhi8cUIRZ8JpTMv/De/uoQkFwD01xQa/5Bu5SjX52W9/EKFq412vqZZXXZdLxRP+nuP2pxXnq6akoZHQ==)
      driver-class-name: com.mysql.cj.jdbc.Driver
  sql:
    init:
      mode: never
...
```
