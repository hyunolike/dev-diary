---
title: "실무에서 자주 사용하는 데이터베이스 & API 패턴 완전 정리"
slug: 실무에서-자주-사용하는-데이터베이스-api-패턴-완전-정리
date: "2025-07-19"
category: 개인
tags: ["MySQL", "아키텍처"]
summary: "마스터-디테일, 다대다 해소, 이력 관리, 소프트 삭제 같은 테이블 패턴과 페이징·배치·비동기 API 패턴을 예제 SQL과 함께 모아, 어떤 문제에 어떤 패턴을 고를지 기준을 세운 정리."
featured: false
---
## 실무에서 자주 사용하는 데이터베이스 & API 패턴 완전 정리
> 작성날짜: 25.07.19


```
중요한 것은 무작정 복잡한 패턴을 사용하는 것이 아니라, 현재 해결하고자 하는 문제에 적합한 패턴을 선택하는 것
```

### 📊 데이터베이스 테이블 패턴
#### 1. Master-Detail 패턴
> [!NOTE]
> 회사와 직원, 주문과 주문상세처럼 1:N 관계를 표현하는 가장 기본적인 패턴입니다.


```sql
-- 주문 마스터 테이블
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2)
);

-- 주문 상세 테이블
CREATE TABLE order_details (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

- 사용 사례
  - 주문 시스템 (주문 ↔ 주문상세)
  - 게시판 (게시글 ↔ 댓글)
  - 송장 관리 (송장 ↔ 송장상세)
 
#### 2. Many-to-Many 해결 패턴
> [!NOTE]
> 학생과 수업처럼 다대다 관계를 연결 테이블로 해결하는 패턴입니다.

```sql
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL
);

-- 연결 테이블 (Junction Table)
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade INT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE KEY unique_enrollment (student_id, course_id)
);
```

- 사용 사례
  - 사용자 ↔ 권한 관리
  - 상품 ↔ 카테고리
  - 태그 시스템
 
#### 3.  계층구조 패턴
> [!NOTE]
> 조직도나 댓글의 대댓글처럼 자기 참조 관계를 표현하는 패턴입니다.

```sql
CREATE TABLE employees (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_emp_id INT NULL,
    position VARCHAR(50),
    FOREIGN KEY (parent_emp_id) REFERENCES employees(emp_id)
);

-- 데이터 예시
INSERT INTO employees VALUES 
(1, '김사장', NULL, 'CEO'),
(2, '이부장', 1, '부장'),
(3, '박과장', 2, '과장'),
(4, '최사원', 3, '사원');
```

#### 4. 이력관리 패턴
> [!NOTE]
> 금융이나 중요한 비즈니스 데이터에서 모든 변경사항을 추적하는 패턴입니다.

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL
);

-- 이력 테이블 (절대 DELETE 금지!)
CREATE TABLE user_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    changed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INT NOT NULL,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### 5. 소프트 삭제 패턴
> [!NOTE]
> 데이터를 물리적으로 삭제하지 않고 논리적으로 삭제하는 패턴입니다.

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL,
    deleted_at DATETIME NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_not_deleted (is_deleted, deleted_at)
);

-- 활성 사용자만 조회
SELECT * FROM users WHERE is_deleted = FALSE;

-- 소프트 삭제 실행
UPDATE users 
SET is_deleted = TRUE, deleted_at = NOW() 
WHERE user_id = 123;
```

---

### 🚀 API 설계 패턴
#### 1. RESTful 패턴
> [!NOTE]
> HTTP 메서드를 의미있게 사용하는 표준 REST API 패턴입니다.

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping                    // GET /api/users
    public List<User> getUsers() { /* 목록 조회 */ }
    
    @GetMapping("/{id}")          // GET /api/users/123
    public User getUser(@PathVariable Long id) { /* 단건 조회 */ }
    
    @PostMapping                  // POST /api/users
    public User createUser(@RequestBody User user) { /* 생성 */ }
    
    @PutMapping("/{id}")         // PUT /api/users/123
    public User updateUser(@PathVariable Long id, @RequestBody User user) { /* 전체 수정 */ }
    
    @PatchMapping("/{id}")       // PATCH /api/users/123
    public User patchUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) { /* 부분 수정 */ }
    
    @DeleteMapping("/{id}")      // DELETE /api/users/123
    public void deleteUser(@PathVariable Long id) { /* 삭제 */ }
}
```

#### 2. 배치 처리 패턴
> [!NOTE]
> 여러 작업을 한 번에 처리하여 성능을 최적화하는 패턴입니다.

```java
@PostMapping("/api/orders/batch")
public ResponseEntity<BatchResponse> processBatchOrders(@RequestBody BatchOrderRequest request) {
    
    BatchResponse response = new BatchResponse();
    
    try {
        // 트랜잭션으로 묶어서 처리
        transactionTemplate.execute(status -> {
            for (OrderRequest orderReq : request.getOrders()) {
                try {
                    Order order = orderService.createOrder(orderReq);
                    response.addSuccess(order.getId());
                } catch (Exception e) {
                    response.addError(orderReq.getCustomerId(), e.getMessage());
                }
            }
            return null;
        });
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        return ResponseEntity.status(500).body(response);
    }
}

@Data
public class BatchOrderRequest {
    private List<OrderRequest> orders;
}

@Data
public class BatchResponse {
    private List<Long> successIds = new ArrayList<>();
    private List<ErrorDetail> errors = new ArrayList<>();
    
    public void addSuccess(Long orderId) {
        successIds.add(orderId);
    }
    
    public void addError(Long customerId, String message) {
        errors.add(new ErrorDetail(customerId, message));
    }
}
```

#### 3. 페이징 패턴
> [!NOTE]
> 대용량 데이터를 효율적으로 조회하는 패턴입니다.

```java
@GetMapping("/api/products")
public ResponseEntity<PageResponse<Product>> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir) {
    
    // Spring Data JPA 페이징
    Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
    Pageable pageable = PageRequest.of(page, size, sort);
    Page<Product> productPage = productRepository.findAll(pageable);
    
    PageResponse<Product> response = PageResponse.<Product>builder()
        .content(productPage.getContent())
        .page(page)
        .size(size)
        .totalElements(productPage.getTotalElements())
        .totalPages(productPage.getTotalPages())
        .first(productPage.isFirst())
        .last(productPage.isLast())
        .build();
    
    return ResponseEntity.ok(response);
}

// 커서 기반 페이징 (대용량 데이터에 효율적)
@GetMapping("/api/products/cursor")
public ResponseEntity<CursorResponse<Product>> getProductsByCursor(
        @RequestParam(required = false) String cursor,
        @RequestParam(defaultValue = "20") int limit) {
    
    List<Product> products;
    if (cursor == null) {
        products = productRepository.findTopNOrderById(limit + 1);
    } else {
        Long cursorId = Long.parseLong(new String(Base64.getDecoder().decode(cursor)));
        products = productRepository.findTopNAfterIdOrderById(cursorId, limit + 1);
    }
    
    boolean hasNext = products.size() > limit;
    if (hasNext) {
        products = products.subList(0, limit);
    }
    
    String nextCursor = null;
    if (hasNext && !products.isEmpty()) {
        Long lastId = products.get(products.size() - 1).getId();
        nextCursor = Base64.getEncoder().encodeToString(lastId.toString().getBytes());
    }
    
    CursorResponse<Product> response = CursorResponse.<Product>builder()
        .data(products)
        .nextCursor(nextCursor)
        .hasNext(hasNext)
        .build();
    
    return ResponseEntity.ok(response);
}
```

#### 4. 상태 관리 패턴
> [!NOTE]
> 주문이나 승인 프로세스의 상태 전이를 관리하는 패턴입니다.

```java
public enum OrderStatus {
    PENDING("대기중"),
    PAID("결제완료"), 
    SHIPPED("배송중"),
    DELIVERED("배송완료"),
    CANCELLED("취소됨");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
}

@Service
public class OrderStateMachine {
    
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
        OrderStatus.PENDING, Set.of(OrderStatus.PAID, OrderStatus.CANCELLED),
        OrderStatus.PAID, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
        OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED),
        OrderStatus.DELIVERED, Set.of(),
        OrderStatus.CANCELLED, Set.of()
    );
    
    public void changeOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        OrderStatus currentStatus = order.getStatus();
        
        if (!isTransitionAllowed(currentStatus, newStatus)) {
            throw new IllegalStateTransitionException(
                String.format("%s에서 %s로 상태 변경이 불가능합니다.", 
                currentStatus.getDescription(), newStatus.getDescription()));
        }
        
        order.setStatus(newStatus);
        order.setStatusChangedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        // 상태 변경 이벤트 발행
        eventPublisher.publishEvent(new OrderStatusChangedEvent(orderId, currentStatus, newStatus));
    }
    
    private boolean isTransitionAllowed(OrderStatus from, OrderStatus to) {
        return ALLOWED_TRANSITIONS.get(from).contains(to);
    }
}

@RestController
public class OrderStatusController {
    
    @PostMapping("/api/orders/{orderId}/status")
    public ResponseEntity<String> changeOrderStatus(
            @PathVariable Long orderId,
            @RequestBody ChangeStatusRequest request) {
        
        try {
            orderStateMachine.changeOrderStatus(orderId, request.getNewStatus());
            return ResponseEntity.ok("주문 상태가 변경되었습니다.");
        } catch (IllegalStateTransitionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
```

#### 5. 비동기 처리 패턴
> [!NOTE]
> 시간이 오래 걸리는 작업을 백그라운드에서 처리하는 패턴입니다.

```java
@RestController
public class AsyncJobController {
    
    @Autowired
    private JobService jobService;
    
    @PostMapping("/api/reports/generate")
    public ResponseEntity<JobResponse> generateReport(@RequestBody ReportRequest request) {
        
        // 비동기 작업 시작
        String jobId = jobService.startReportGeneration(request);
        
        JobResponse response = JobResponse.builder()
            .jobId(jobId)
            .status(JobStatus.PROCESSING)
            .message("리포트 생성이 시작되었습니다.")
            .build();
        
        return ResponseEntity.accepted().body(response);
    }
    
    @GetMapping("/api/jobs/{jobId}")
    public ResponseEntity<JobResponse> getJobStatus(@PathVariable String jobId) {
        
        Job job = jobService.getJob(jobId);
        
        JobResponse response = JobResponse.builder()
            .jobId(jobId)
            .status(job.getStatus())
            .progress(job.getProgress())
            .message(job.getMessage())
            .resultUrl(job.getResultUrl())
            .build();
        
        return ResponseEntity.ok(response);
    }
}

@Service
public class JobService {
    
    private final Map<String, Job> jobStore = new ConcurrentHashMap<>();
    
    @Async
    public String startReportGeneration(ReportRequest request) {
        String jobId = UUID.randomUUID().toString();
        
        Job job = Job.builder()
            .id(jobId)
            .status(JobStatus.PROCESSING)
            .progress(0)
            .startTime(LocalDateTime.now())
            .build();
        
        jobStore.put(jobId, job);
        
        // 실제 작업 실행
        CompletableFuture.runAsync(() -> {
            try {
                processReport(job, request);
            } catch (Exception e) {
                job.setStatus(JobStatus.FAILED);
                job.setMessage("리포트 생성 실패: " + e.getMessage());
            }
        });
        
        return jobId;
    }
    
    private void processReport(Job job, ReportRequest request) {
        try {
            // 단계별 처리
            updateProgress(job, 25, "데이터 수집 중...");
            Thread.sleep(2000); // 실제 작업 시뮬레이션
            
            updateProgress(job, 50, "데이터 분석 중...");
            Thread.sleep(3000);
            
            updateProgress(job, 75, "리포트 생성 중...");
            Thread.sleep(2000);
            
            updateProgress(job, 100, "완료");
            job.setStatus(JobStatus.COMPLETED);
            job.setResultUrl("/files/reports/" + job.getId() + ".pdf");
            job.setEndTime(LocalDateTime.now());
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            job.setStatus(JobStatus.FAILED);
            job.setMessage("작업이 중단되었습니다.");
        }
    }
    
    private void updateProgress(Job job, int progress, String message) {
        job.setProgress(progress);
        job.setMessage(message);
        job.setUpdatedAt(LocalDateTime.now());
    }
}
```




