---
title: "오픈소스 기여를 위한 Commit 정리"
slug: 오픈소스-기여를-위한-commit-정리
date: "2025-05-18"
category: oss
tags: ["Git", "오픈소스"]
series: gstreamer-oss
seriesOrder: 3
summary: "의미 없는 `.` 커밋이 원격까지 올라간 상태에서 기여용 PR을 내기 위해, interactive rebase로 커밋을 squash하고 amend로 메시지를 다듬어 이력을 정리한 기록."
featured: false
---
## 오픈소스 기여를 위한 Commit 정리
> 작성날짜: 25.05.18

### 현상황
- 오픈소스 기여를 위한 다수의 의미없는 `.` 커밋 메시지가 원격 저장소까지 push된 상태

### 해결
#### 1. Git Rebase 사용
![image](https://github.com/user-attachments/assets/f6ed3811-07bc-48dc-8aa7-d862809c47cc)

##### 1-1. 현재 상태 확인
```
git log --oneline

// 결과
abc1234 Fix typo in README
def5678 Add Python tutorial
ghi9101 Update installation instructions
jkl1121 Initial commit
```

##### 1-2. Interactive Rebase 사용
```
// 최근 3개의 커밋 합치기
git rebase -i HEAD~3

// 특정 커밋 해시 기준 전까지 합치기
git rebase -i jkl1121
```

##### 1-3. 커밋 합치기
- 에디터 나오게 된다.
- 에디터를 수정하자 (아래와 같이)

```
[수정 전]
pick ghi9101 Update installation instructions
pick def5678 Add Python tutorial
pick abc1234 Fix typo in README

[수정 후] 첫 번째 커밋은 pick으로 두고 나머지는 squash로 변경
pick ghi9101 Update installation instructions
squash def5678 Add Python tutorial
squash abc1234 Fix typo in README
```

##### 1-4. 커밋 메시지 작성
- 이전 단계 저장하게되면 새로운 에디터 창 노출
- 해당 에디터 창에서 합쳐진 커밋의 메시지 작성

##### 1-5. 강제 푸시 (중요)
```
git push --force
```

- 나중에 문제가 생기면 언제든지 이 백업 브랜치로 돌아갈 수 있음
##### (추가)
###### 1. 작업전 브랜치
- git branch backup-branch
- 
###### 2. 특정 브랜치에서만 작업
- 메인 브랜치가 아닌 별도의 작업 브랜치에서 이 작업을 수행하고, 이후에 깔끔한 PR을 만드는 것도 좋은 방법
###### 3. 팀에 알리기
- 이미 푸시된 커밋을 변경한 경우, 같은 브랜치를 사용하는 팀원들에게 알려서 git pull --rebase를 사용하도록 안내

#### 2. Git --ammend 
> 이미 푸시된 커밋의 메시지만 변경


```
// 1. 커밋 메시지 수정
git commit --amend

// 2. 변경사항 강제 푸시
git push --force
```

