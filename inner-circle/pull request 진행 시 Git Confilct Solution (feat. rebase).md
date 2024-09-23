## pull request 진행 시 Git Confilct Solution (feat. rebase)
> 작성날짜: 24.09.23

```
👨‍🌾 충돌 생기면 rebase 사용해보자
```

### 상황
- 코드리뷰 완료 후 메인 브랜치와의 충돌
- 팀장(호준님)이 알려준 충돌 해결 방법

### 먼저! GitHub Merge pull request 종류에 대해 알아보자
<img width="362" alt="image" src="https://github.com/user-attachments/assets/4ce68ce2-8856-4f28-87eb-f1c892cd98b7">

#### 3가지에 대해 좀 더 알아보자
<img width="959" alt="image" src="https://github.com/user-attachments/assets/2e7c13aa-34d5-43b5-afc4-636e1c25c467">

### 각 상황별 해결 방법 정리
#### 1. Create a merge commit
<img width="288" alt="image" src="https://github.com/user-attachments/assets/55fe80ac-3be2-49b8-8014-34792548b60d">

#### 2. Squash and merge
<img width="403" alt="image" src="https://github.com/user-attachments/assets/9bc1ab03-b582-4436-b0a5-624bb41dfcf5">

#### 3. Rebase and merge
<img width="415" alt="image" src="https://github.com/user-attachments/assets/d6f347bd-5869-4305-bbed-01fb348860ee">

### 여기서 `rebase`는 왜 사용할까?
<img width="594" alt="image" src="https://github.com/user-attachments/assets/a0bddc60-fc60-42c8-a9eb-4d66207ff159">

