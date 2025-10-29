# macOS + zsh 환경 설정 완벽 가이드 (.zprofile vs .zshrc)

## 🧭 한 문장 요약

**.zprofile**은 "로그인할 때 한 번 실행"되고,
**.zshrc**는 "터미널을 열 때마다 실행"된다.

---

## 🧠 개념 정리

| 구분 | .zprofile | .zshrc |
|------|-----------|---------|
| **언제 실행됨** | 로그인 시 한 번 (login shell) | 터미널 창 열릴 때마다 (interactive shell) |
| **실행 주체** | macOS 로그인 / iTerm 첫 실행 | IntelliJ, VSCode, iTerm 새 탭, etc |
| **역할** | "환경 변수 설정" 중심 | "셸 사용자 설정" 중심 |
| **IntelliJ 터미널에서 읽힘** | ❌ 안 읽힘 | ✅ 읽힘 |
| **macOS 기본 터미널에서 읽힘** | ✅ 읽힘 | ✅ 읽힘 |
| **대표 설정 예시** | PATH, JAVA_HOME, NVM, PYENV | alias, prompt, tmux, export PS1 등 |
| **호출 관계** | .zprofile → .zshrc (원하면 수동 호출 가능) | 독립 실행 |

---

## 📘 실제 예시

### 🩵 .zprofile (로그인 셸)

macOS 로그인할 때, 시스템 전역 환경을 한 번 세팅

```bash
# 시스템 PATH 설정 (Homebrew, Java 등)
export PATH="/opt/homebrew/bin:$PATH"
export JAVA_HOME=$(/usr/libexec/java_home)

# Node Version Manager 초기화
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

> 💡 macOS에서는 GUI 앱들도 이 환경을 상속하기 때문에,
> 여기 설정이 없으면 IntelliJ·VSCode 같은 앱이 brew, node를 못 찾을 수 있어요.

---

### 💜 .zshrc (인터랙티브 셸)

터미널 새로 열릴 때마다 적용되는 설정

```bash
# 터미널 인터랙션용 설정
alias ll='ls -al'
alias gs='git status'

# 프롬프트, 테마
export PS1="%n@%m %1~ %# "

# IntelliJ에서 환경이 안 잡히면 아래처럼 중복 선언도 가능
export PATH="/opt/homebrew/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

> 💡 IntelliJ 터미널은 "비로그인 zsh"로 열리기 때문에
> .zprofile은 안 읽고 .zshrc만 읽습니다.

---

## ⚙️ 실무 팁

| 상황 | 실행되는 파일 |
|------|---------------|
| macOS 로그인 후 첫 터미널 실행 | .zprofile → .zshrc |
| 새 터미널 탭 열기 | .zshrc만 |
| IntelliJ, VSCode 터미널 | .zshrc만 |
| GUI 앱 (IntelliJ, PyCharm 등) 실행 | .zprofile만 (로그인 셸 환경 상속) |

---

## ✅ 정리 요약

| 항목 | .zprofile | .zshrc |
|------|-----------|---------|
| **실행 시점** | 로그인 시 (1회) | 터미널 열 때마다 |
| **IntelliJ 터미널에서 읽힘** | ❌ | ✅ |
| **macOS 기본 터미널** | ✅ | ✅ |
| **PATH / NVM / PYENV 설정** | ✅ | ✅ (IDE용 복사 필요) |
| **alias, prompt 등** | ❌ | ✅ |

---

## 💡 가장 좋은 방법

```bash
# ~/.zshrc 맨 위에 추가
if [ -f ~/.zprofile ]; then
  source ~/.zprofile
fi
```

👉 이렇게 하면 IntelliJ 터미널에서도 .zprofile 설정이 함께 불립니다.
(즉, 한쪽만 관리해도 됨)

---

## 🎯 핵심 포인트

1. **로그인 셸 (Login Shell)**
   - `.zprofile` 실행
   - 시스템 전역 환경 변수 설정
   - GUI 앱들이 이 환경을 상속

2. **인터랙티브 셸 (Interactive Shell)**
   - `.zshrc` 실행
   - 터미널 사용자 설정 (alias, prompt 등)
   - IDE 터미널들은 대부분 이 방식

3. **권장 구조**
   - 환경 변수 → `.zprofile`
   - 터미널 설정 → `.zshrc`
   - IDE 터미널 호환성 → `.zshrc`에서 `.zprofile` source

---

## 📚 참고사항

- macOS는 로그인 시 login shell을 실행하므로 `.zprofile`이 먼저 읽힘
- 일반적인 터미널 탭은 interactive shell이므로 `.zshrc`만 읽힘
- IntelliJ, VSCode 등의 IDE 터미널은 interactive non-login shell로 열림
- 따라서 IDE 터미널에서 PATH가 안 잡히는 문제는 `.zshrc`에 PATH 설정을 추가하거나 `.zprofile`을 source하면 해결됨
