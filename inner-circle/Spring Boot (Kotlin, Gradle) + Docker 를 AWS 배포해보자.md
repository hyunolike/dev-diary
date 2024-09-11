## Spring Boot (Kotlin, Gradle) + Docker 를 AWS 배포해보자 
> 작성날짜: 24.08.29 (업데이트 날짜: 24.09.11)

### 상황
- 커머스 서비스와 동일하게 Fargate 이용한 배포 진행
- 가격 효율

### 컨테이너 서버 비교
<img width="692" alt="image" src="https://github.com/user-attachments/assets/2b597c9d-3315-44d7-b895-8702e63fdd4c">


### 배포 자동화 초기 설계 (커머스 관리자 서비스 기준)
> 담당 서버 개발 파트가 관리자이기에 관리자 기준으로만 생각 (관리자 서비스는 별도 배포 구축)


<img width="802" alt="image" src="https://github.com/user-attachments/assets/62e6fe56-93a8-44a7-85ad-59c59bad8749">

### 추가 구성 필요 
- AWS CloudWatch
- 배포 완료 알림 구축

🚚... 이어서

### 클라우드 구조를 설계해보자
> 커머스 팀프로젝트와 별개로 개인적으로 관심있어 설계를 진행했습니다! 🔥

#### 1. 커머스 프로젝트의 요청 프로세스를 살펴보자
<img width="823" alt="image" src="https://github.com/user-attachments/assets/2233424e-a29c-471b-9272-c9f65d92f6c5">

- 여기서 인증 요청 처리는? 클라우드 기술로만으로 해결 시도
- 인증 이외에도 CSRF 키 처리도 가능

#### 2. 본격적으로 설계해보자
<img width="843" alt="image" src="https://github.com/user-attachments/assets/72b77719-27a3-47bd-9691-b4ce97b4b31c">

- 뭔가 부족하다. 단순히 JWT 검증만 진행?
- 별도의 캐시 데이터로 처리하고 싶음
- 추가로 내부 서비스가 외부 서비스와의 통신이 필요한 경우는?

#### 3. 캐시, 외부 통신 구조를 더해보자
<img width="906" alt="image" src="https://github.com/user-attachments/assets/42ae5394-8d5b-4617-85a1-e478ce49712b">

- 이렇게 되면 토큰 검증은 레디스
- 외부 통신은 NAT 를 이용해 하게 됨
- 프로젝트에서 이미지 관리도 필요! 다시 설계해보자

#### 4. 이미지 관리 기능을 더하다
<img width="920" alt="image" src="https://github.com/user-attachments/assets/717bdf19-1bd0-4c46-befd-a90c5b12288b">

- 정답은 없지만, CDN 역할과 정적 컨텐츠 관리를 추가
- 이미지 URL을 위한 도메인 설정까지 진행

#### 5. 내부 서비스의 상태를 알고 싶다
<img width="1128" alt="image" src="https://github.com/user-attachments/assets/d84ffe21-87fe-4045-b35a-345b5de5ed9c">

- CloudWatch를 이용해보자

### 회고
- 설계에는 정답이 없지만 기본적인 AWS 기능을 최대한 공부해서 설계를 진행
- 설계하는 과정에서 시스템 구조 전반적인 인프라 지식을 획득 할 수 있었음
- 다음에는 실제 클라우드 상 설계한 구조로 배포를 해보자

---
#### 참고문헌
- [AWS Fargate와 Docker를 활용한 Auto Scale Serverless 개발하기: Intro](https://medium.com/@yangga0070/aws-fargate%EC%99%80-docker%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-auto-scale-serverless-%EA%B0%9C%EB%B0%9C%ED%95%98%EA%B8%B0-1-426b0d87e9d)

