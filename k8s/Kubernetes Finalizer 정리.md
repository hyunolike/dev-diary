## Kubernetes Finalizer 정리
> 작성날짜: 25.06.07

### ✅ Finalizer란?
- Finalizer는 Kubernetes 리소스가 삭제되기 전에 필수적인 정리 작업이 먼저 완료되도록 보장하는 장치입니다.

### 🧱 Finalizer의 동작 구조
```
{
  "metadata": {
    "finalizers": [
      "kubernetes",
      "custom.cleanup.io"
    ]
  }
}

```


- 리소스 삭제 요청 시 즉시 삭제되지 않고 Terminating 상태로 전환됨
- finalizer에 등록된 항목이 정리 작업(cleanup) 을 수행
- 정리 작업이 끝나면 finalizer가 직접 자신을 metadata에서 제거
- 모든 finalizer가 제거되면 Kubernetes가 리소스를 실제로 삭제함

### 왜 사용?
- PVC 삭제 전에 데이터 백업
- 외부 시스템과 동기화 해제
- Custom Resource(CRD) 관련 리소스 정리
- Operator가 만든 리소스를 올바르게 종료 처리

### 🛑 문제가 발생하는 경우
- Finalizer를 처리하는 컨트롤러나 오퍼레이터가 비정상 상태일 경우
- 외부 API 호출 실패 (예: metrics.k8s.io discovery 오류)
- 이 경우 리소스는 계속 Terminating 상태로 남게 됨 🔥 (내가 겪은 문제)
  - 즉 namespace 삭제하려고 해도 삭제가 안되는 경우 !!!

### 🧹 강제로 Finalizer 제거 및 네임스페이스 삭제
#### 1. JSON 파일로 네임스페이스 정보 추출
```
kubectl get namespace monitoring -o json > monitoring.json
```

#### 2. monitoring.json 파일에서 "finalizers" 항목 삭제
#### 3. 강제로 삭제 요청 (실제로 이거까지는 사용안해도됨 !)
```
kubectl replace --raw "/api/v1/namespaces/monitoring/finalize" -f monitoring.json
```

### ⚠️ kubectl delete namespace로는 삭제되지 않는 경우에만 사용해야 하며, 리소스 손실에 주의
