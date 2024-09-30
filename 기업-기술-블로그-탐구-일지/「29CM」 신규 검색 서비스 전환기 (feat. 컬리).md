## 「29CM」 신규 검색 서비스 전환기 (feat. 컬리)
> 📅 탐구 일자: 2024-09-30

### 🔗 분석한 블로그 포스트
- 제목: "신규 검색 서비스 전환기"
- 링크: [https://cloud.google.com/blog/products/storage-data-transfer/advanced-caching-techniques](https://medium.com/29cm/%EC%8B%A0%EA%B7%9C-%EA%B2%80%EC%83%89-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%A0%84%ED%99%98%EA%B8%B0-b9dfc7290357)
- 작성자: 이하윤

### 🏷️ 주요 키워드
- 데이터 관리, 검색, Spring Boot, Elasticsearch

### 📚 핵심 내용 요약
- ES 접근 서비스 관리 파편화, 원천 데이터의 타 도메인 강한 의존성 해결을 위한 검색 인덱싱 파이프라인 구축

### 💡 주요 기술적 인사이트
1. Spring Data Elastic 이용한 검색 인덱싱(리인덱싱) 작업
2. 카프카 (메시지큐)를 활용 (변경된 데이터 및 원천 데이터 관리)

### 🤔 개인적인 견해 및 분석
- 검색 서비스는 `카프카`, 오픈소스 검색(Elsasticsearch) 또는 AWS OpenSearch Service의 조합으로 기업들에서 사용한다는 점을 알 수 있다.
- 검색 서비스에서 중요한 점은 원천데이터와 변경된 데이터를 어떻게 관리하냐이다.

### 🛠️ 실제 적용 사례 또는 구현 방법
#### 컬리 vs 29cm
> 비슷한 기술과 구조로 검색 서비스를 구축한 걸 살펴 볼 수 있다.

<img width="1014" alt="image" src="https://github.com/user-attachments/assets/00ff71e2-3a1d-402a-a592-bd636a5fd4d6">

#### 검색 서비스 개선 점 주요 문제점 2가지
> 결국에는 데이터 관리를 중점으로 검색 서비스를 구축한다.

<img width="515" alt="image" src="https://github.com/user-attachments/assets/5121b80f-5e47-45cb-8ce9-54425814e54d">

#### 29cm의 검색 인덱싱 파이프라인 주요 프로세스
> 메시지큐의 발행 & 구독이 핵심! 데이터 전달

<img width="991" alt="image" src="https://github.com/user-attachments/assets/40166545-4242-4de2-9b5e-a200655a5cea">

### 🏆 핵심 takeaways 
1. 카프카를 이용한 발행, 구독 기능으로 검색엔진의 데이터를 축적한다.
2. 검색 서비스는 검색엔진 기술이 필수적이다.

### 💬 추가 의견 / 질문
- 카프카 + 검색엔진기술 조합이외에 다른 패턴이 있을까?
- 카프카말고도 다른 기술을 이용해 데이터를 검색엔진에 인덱싱 할 수 있을까?
