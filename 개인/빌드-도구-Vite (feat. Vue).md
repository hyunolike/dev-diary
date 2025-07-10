## 빌드 도구 Vite(비트) 
> 작성날짜: 25.07.11

### Vite
- 기존의 Webpack 등보다 훨씬 빠른 개발 서버 구동과 최적화된 빌드 성능을 제공
- 

### Vue 프로젝트 시작하기
#### 🚀 creat-vue
> [공식 레포](https://github.com/vuejs/create-vue) <br/>
> The recommended way to start a Vite-powered Vue project

- Vite 기반
  - `Vue CLI` 는 webpack 기반 / `create-vue` Vite 기반
- 스캐폴딩 도구


### 빌드
> 스프링부트와 비교 설명


```
[Vue, React 등]
↓ (vite build)
dist/
├── index.html
├── app.[hash].js

[Spring Boot 서버]
↓ (REST API 제공)
build/libs/myapp.jar

⇒ 프론트: 정적 웹 서버(Nginx)
⇒ 백엔드: API 서버(Spring Boot)
```

#### 👨‍🌾 스프링부트 내 묶어서 함께 빌드하기
```
my-app/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/...
│   │       └── resources/
│   │           └── static/ ← 여기로 Vite 결과물을 복사
│   └── build.gradle
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
```


