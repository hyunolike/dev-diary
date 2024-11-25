## RabbitMQ Local Hands-on
> 작성날짜: 24.11.25

### RabbitMQ를 로컬에서 테스트해보자
#### Docker 환경 내 준비사항
- rabbitmq:3-management

### docker-compose setting
```bash
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: local-rabbitmq
    ports:
      - "5672:5672"    # AMQP protocol port
      - "15672:15672"  # Management UI port
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - rabbitmq_log:/var/log/rabbitmq
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=adminpassword
      # Optional: Enable plugins
      - RABBITMQ_PLUGINS=rabbitmq_management,rabbitmq_prometheus
    healthcheck:
      test: ["CMD", "rabbitmqctl", "status"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - rabbitmq_network
    restart: unless-stopped

volumes:
  rabbitmq_data:
    driver: local
  rabbitmq_log:
    driver: local

networks:
  rabbitmq_network:
    driver: bridge
```

### 간단한 RabbitMQ 테스트 위한 단계별 가이드
#### 0. 먼저 브라우저에서 관리자 UI에 접속합니다:
![image](https://github.com/user-attachments/assets/63ee30c5-3508-46f6-a332-674818557e2a)

- URL: http://localhost:15672
- 아이디: admin
- 비밀번호: adminpassword

#### 1. 상단 메뉴에서 "Queues and Streams" 탭 클릭
#### 2. "Add a new queue" 버튼을 클릭하여 테스트용 큐 생성
- Name: test_queue
- 나머지는 기본값으로 두고 "Add queue" 클릭
#### 3. 생성된 큐를 클릭한 후:
- "Publish message" 탭에서 메시지 발송 테스트
- Message에 원하는 내용 입력 (예: {"message": "test"})
- "Publish message" 버튼 클릭
#### 4. "Get messages" 탭에서:
- "Get Message(s)" 버튼을 클릭하면 큐에 있는 메시지를 확인할 수 있습니다

### RabbitMQ 구조를 살펴보자
<img width="675" alt="image" src="https://github.com/user-attachments/assets/79170aee-7250-4349-8ae0-2158395fb5c5">

#### 메시지 흐름
```
Producer → Exchange → Queue → Consumer
```

#### 주요 특징
- Message Acknowledgment: 메시지 처리 보장
- Persistence: 메시지와 큐의 영속성
- Clustering: 고가용성을 위한 클러스터링
- Multiple Protocol 지원: AMQP, MQTT, STOMP 등

#### 관리 기능
- Virtual Hosts: 논리적 브로커 분리
- 사용자 관리 및 접근 제어
- 모니터링 및 통계
- 플러그인 시스템

#### 장점
- 높은 신뢰성
- 유연한 라우팅
- 비동기 처리
- 시스템 간 결합도 감소 를 제공합니다.

### 회고
- 레빗엠큐, 카프카아의 차이를 알고 적절히 사용 필요!
