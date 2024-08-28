## API 문서 자동화 적용 (Spring REST Docs & Swagger UI) feat. OAS 기반 API 문서화
> 작성날짜: 24.08.28

### 상황
- API 문서 프론트엔드 팀 전달 필요
- API 문서 자동화
    - 테스트 강제화 > Spring REST Docs
    - UI > Swagger UI
- 2개의 장점 활용하고 싶음

### 시도
- Swagger UI + Spring REST Docs 2개 개발 문서 작업 진행

#### 현재 문서 자동화 요약
<img width="383" alt="image" src="https://github.com/user-attachments/assets/0c863661-5c87-4c66-8832-472527002518">

#### 문서 접속 방법 요약
<img width="936" alt="image" src="https://github.com/user-attachments/assets/b82b085e-2517-4e39-b79b-d0b610221d2b">


### 추후 개발 여유가 되면 문서 2개 통합 시도 예정 (아래 내용 참고)
- 오픈소스 `Spring REST Docs API Specification Integration` 활용한 OAS 기반 API 문서화 자동 가능
- 아쉬운 점. 오픈소스이기에 커스텀 어렵고 이슈 발생 대응 어려움

#### OAS 기반 API 문서 자동화 프로세스 기본 설계
<img width="760" alt="image" src="https://github.com/user-attachments/assets/010f83c6-831f-4ce0-98a5-a91074612647">

#### OAS 기반 API 문서 자동화 프로세스 이너서클 커머스 관리자 프로젝트 적용 설계
<img width="751" alt="image" src="https://github.com/user-attachments/assets/c0b5a23f-2f14-435b-8fa0-aea93b65958a">

---
#### 참고문헌
- [카카오페이/OpenAPI Specification을 이용한 더욱 효과적인 API 문서화](https://tech.kakaopay.com/post/openapi-documentation/)
- [Swagger와 Spring rest docs, 두마리 토끼 잡기!🐰](https://yummy0102.tistory.com/666)
