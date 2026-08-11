---
title: "rebase 도중 untracked 파일 충돌 원인과 해결 방법"
slug: rebase-도중-untracked-파일-충돌-원인과-해결-방법
date: "2025-09-16"
category: 개인
tags: ["Git", "트러블슈팅"]
summary: "rebase가 미추적 파일을 덮어쓸까 봐 멈추는 이유를 워킹 트리 보호 원칙으로 짚고, squash로는 왜 풀리지 않는지와 stash -u로 치운 뒤 이어가는 해결 순서를 정리했다."
featured: false
---
## rebase 도중 untracked 파일 충돌 원인과 해결 방법
> 작성날짜: 25.09.16

### ⚡ 상황 발생
- git rebase 중
  - → 미추적(untracked) 파일 docs/API 명세서.pdf 가 작업 디렉토리에 있어서, rebase 과정에서 덮어쓸 위험 때문에 에러 발생.
 
```
error: 병합 때문에 추적하지 않는 ... 파일을 덮어씁니다
```


<img width="988" height="376" alt="image" src="https://github.com/user-attachments/assets/5106b8a6-4e11-47eb-9238-3d476165d2fb" />

### 🛠️ 문제 원인
- Git은 작업 디렉토리 보호 원칙 때문에, rebase 과정에서 체크아웃할 커밋에 동일 경로의 파일이 있으면 덮어쓰기를 차단.
- squash 여부와 무관 → squash만으로는 해결 안 됨.

#### 왜 squash로는 안 풀리나?
- 에러의 본질은 “워킹 트리 보호(미추적 파일 덮어쓰기 금지)”입니다.
- 커밋을 합치든 말든, 해당 경로로 체크아웃하는 순간 미추적 파일이 있으면 동일하게 막힙니다.
- 따라서 워킹 트리를 깨끗하게(stash/이동/삭제/추가 중 하나) 만든 뒤 리베이스를 이어가야 합니다.

### 🔑 해결 방법
#### 1. (원하면) 현재 rebase 중단
```
git rebase --abort
```

#### 2. 문제의 미추적 파일을 임시로 치워두기
```
🔥 스태시(미추적 포함)로 보관:
git stash push -u -m "temp: move untracked doc"

🔥 또는 물리적으로 이동:
mkdir -p /tmp/backup-docs
mv "docs/API 명세서.pdf" /tmp/backup-docs/
```

#### 3. 다시(또는 이어서) 리베이스
```
# 새로 시작하는 경우
git rebase -i <base-commit>
# 중단된 상태였다면
git rebase --continue
```

### 🎉 최종 결과
> git rebase --continue 성공 →


```
Successfully rebased and updated refs/heads/main.

이제 히스토리 반영을 위해 git push --force-with-lease origin main 실행.
```


