## Spring Boot (Kotlin, Gradle) + Docker 를 AWS 배포해보자 
> 작성날짜: 24.08.29

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


... 추후 구축 완료까지 작성

---
#### 참고문헌
- [AWS Fargate와 Docker를 활용한 Auto Scale Serverless 개발하기: Intro](https://medium.com/@yangga0070/aws-fargate%EC%99%80-docker%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-auto-scale-serverless-%EA%B0%9C%EB%B0%9C%ED%95%98%EA%B8%B0-1-426b0d87e9d)

