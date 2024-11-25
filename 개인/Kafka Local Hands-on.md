## Kafka Local Hands-on
> 작성날짜: 24.11.25

### 카프카를 로컬에서 테스트해보자
#### 1. Cloud 서버 내 준비사항
1. Java (카프카는 자바 오픈소스!)
2. Zookeeper (최근에는 Kraft 카프카 자체 메타관리 도구 존재)
3. Kafka

#### 2. Docker 환경 내 준비사항 `🔥 여기서 실습할 내용`
1. Zookeeper (최근에는 Kraft 카프카 자체 메타관리 도구 존재)
2. Kafka

### 카프카를 간단하게 소개하자면?
> [!TIP]
> 분산 스트리밍 플랫폼이자 대용량 실시간 데이터 처리 가능

- 높은 처리량, 확장성, 내구성 제공
- pub/sub (발행/구독) 메시징 모델 기반

### docker-compose setting
> [!NOTE]
> 크게 2가지 zookeeper, kafka 필요

```yml
version: '3'
 ✅ Docker Compose 파일 형식 버전
services:
  ✅ 실행할 컨테이너 서비스들을 정의
  zookeeper:
    container_name: local-zookeeper
  ✅ 컨테이너 이름 지정
    image: confluentinc/cp-zookeeper:latest
  ✅ 사용할 도커 이미지 
    ports:
      - "2181:2181"
 ✅ 호스트:컨테이너 포트 매핑
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
 ✅ Zookeeper 클라이언트 포트 설정
      ZOOKEEPER_TICK_TIME: 2000
 ✅ Zookeeper의 기본 시간 단위 (밀리초)
  kafka:
    container_name: local-kafka
 
    image: confluentinc/cp-kafka:latest 
    depends_on:
      - zookeeper
  ✅ Zookeeper 서비스가 먼저 시작된 후 실행
    ports:
      - "9092:9092"
 ✅ 호스트:컨테이너 포트 매핑
    environment:
      KAFKA_BROKER_ID: 1
 ✅ 카프카 브로커의 고유 ID
      
      ✅ Zooker 연결 설정
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      
      ✅ Kakfa 리스터 설정
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092  # 더 명확한 리스너 설정
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      
      ✅ 복제 팩터 설정 (단일 브로커 환경이므로 1)
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

### 간단한 Kakfa 테스트 위한 단계별 가이드
#### 1. Kafka 컨테이너 접속
```bash
docker exec -it local-kafka bash
```

#### 2. 테스트용 토픽 생성
```bash
kafka-topics --create \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
```

#### 3. 생성된 토픽 목록 확인
```bash
kafka-topics --list --bootstrap-server localhost:9092
```

#### 4. 새로운 터미널을 열어 컨슈머(Consumer) 실행 (실행 후 아무 변화 없는게 정상!)
```bash
docker exec -it local-kafka kafka-console-consumer \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

#### 5. 또 다른 새로운 터미널 열어 프로듀서(Producer) 실행
```bash
docker exec -it local-kafka kafka-console-producer \
  --topic test-topic \
  --bootstrap-server localhost:9092
```

#### 6. 프로듀서 터미널에서 메시지 입력
```bash
> Hello Kafka!
> This is a test message
> 테스트 메시지입니다

(각 메시지 입력 후 엔터를 누르면 `컨슈머 터미널`에서 메시지가 수신되는 것을 확인할 수 있습니다)
```

### 카프카 구조에 대해 알아보자
<img width="650" alt="image" src="https://github.com/user-attachments/assets/cfba359f-54a3-4b92-9df0-49c1a57094a9">

- 대표적인 카프카의 간략한 구조이다.
- 여기서 실습한 구조는 아래와 같다!

<img width="1000" alt="image" src="https://github.com/user-attachments/assets/f623cfef-a08e-41e3-8a9a-527714d53661">

### 동작 프로세스를 간략히 보자
#### 구조
![image](https://github.com/user-attachments/assets/245a7261-5560-41d5-a107-d030594a9b2b)
#### 동작 프로세스
1. 게임 서버(프로듀서)가 "플레이어 A가 로그인했습니다" 메시지 생성
   → 편지를 쓴다
2. 메시지를 GameLog 토픽으로 전송
   → 게임 관련 분류함에 편지를 넣는다
3. 카프카 클러스터가 메시지를 저장하고 관리
   → 우체국이 편지를 안전하게 보관
4. 주키퍼가 전체 시스템 감독
   → 관리자가 모든 과정이 원활한지 확인
5. 분석 서버(컨슈머)가 GameLog 토픽의 메시지를 가져감
   → 수신자가 자신의 편지를 수령

#### 장점
- 안전성: 여러 우체국 지점이 있어 한 곳이 문제가 생겨도 계속 운영 가능
- 확장성: 필요하면 새로운 지점을 추가할 수 있음
- 효율성: 많은 양의 편지(메시지)를 동시에 처리 가능
- 신뢰성: 감독관(주키퍼)이 계속 모니터링하여 문제 발생 시 즉시 조치

### 대표적인 메시지 큐인 RabbitMQ와 비교해보자
<img width="625" alt="image" src="https://github.com/user-attachments/assets/b987c6e4-a3ff-484f-8cb8-958fad16c84f">

### 회고
-  `Bounded Context` 간 의존성 개념과 연결된다 (아래 그림 참고)

<img width="476" alt="image" src="https://github.com/user-attachments/assets/ca1ddaa5-f02f-4ea5-8b7a-02d4424bf47c">


---
#### 참고문헌
- [로컬에 Docker 기반 Kafka 서버 구축하고 테스트](https://dev-youngjun.tistory.com/259)
