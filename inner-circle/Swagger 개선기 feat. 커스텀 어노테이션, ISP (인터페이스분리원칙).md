## Swagger 개선기 feat. 커스텀 어노테이션, ISP (인터페이스분리원칙)
> 작성날짜: 24.08.30

### 상황
- 기존 `spring rest doc` `swagger ui` 적용된 상황
- 하지만, 컨트롤러내 스웨거 코드가 서버 코드와 혼재되어 있어 유지보수 및 개발 어려움

### 개선 방향
- 스웨거 유지보수 및 개발 편하게 별도 분리

### 개선된 전체 구조
<img width="648" alt="image" src="https://github.com/user-attachments/assets/9c1e01ac-5b91-4701-8d04-bcc9d8d843c9">

#### 특징1. 인터페이스 분리 원칙
<img width="710" alt="image" src="https://github.com/user-attachments/assets/df0bd9a2-d8e3-4583-933f-5d4d99254791">

#### 특징2. 단일 책임의 원칙
<img width="661" alt="image" src="https://github.com/user-attachments/assets/0f763467-4993-44ae-998b-a27f4c109b85">

#### 특징3. 커스텀 어노테이션
<img width="778" alt="image" src="https://github.com/user-attachments/assets/d069b1d1-0c1d-4acf-96c5-d99cfa90fbfa">

### 개선 회고
- 코드 가독성 향상
- 유지보수 용이성
- 개발 일관성
