---
title: "Git 이미 커밋(푸시)된 일부 파일 제외하는 방법"
slug: git-이미-커밋푸시된-일부-파일-제외하는-방법
date: "2025-08-14"
category: 개인
tags: ["Git", "트러블슈팅"]
summary: "이미 원격까지 올라간 .gradle·build 디렉터리를 되돌리려고 git rm --cached로 인덱스에서만 걷어내고 commit --amend로 마무리한 기록. 마지막 커밋·과거 커밋·이력 완전 삭제까지 상황별 명령을 표로 갈라 두었다."
featured: false
---
## Git 이미 커밋(푸시)된 일부 파일 제외하는 방법
> 작성날짜: 25.08.14

### 현재 상황
- 불필요한 `.gradle`, `build` 폴더가 존재

<img width="369"  alt="image" src="https://github.com/user-attachments/assets/d2074f86-c26f-45cd-b93f-c9b76c85797b" />


### 해결
```
git rm --cached <파일명>
git commit --amend
```


- --cached : Git 인덱스(스테이징)에서만 삭제, 로컬 파일은 남김
- --amend : 방금 전 커밋을 수정


### 정리
| 상황         | 방법                                          |
| ---------- | ------------------------------------------- |
| 마지막 커밋 전   | `git rm --cached` + `git commit --amend`    |
| 과거 커밋 수정   | `git rebase -i` + `git rm --cached` + amend |
| 기록에서 완전 제거 | `git filter-repo` 또는 `git filter-branch`    |
