## 🧰 Pod 문제 해결을 위한 명령어 모음
> 작성날짜: 25.06.07

### ✅ 1. Pod 상태 확인'
```
# 특정 네임스페이스 내 Pod 상태 확인
kubectl get pods -n kube-system
kubectl get pods -n monitoring
kubectl get pods -n loki-stack


# CNI 관련 Pod만 필터링해서 확인
kubectl get pods -n kube-system | grep calico
kubectl get pods -n kube-system | grep flannel
```

### ✅ 2. 문제 원인 진단
```
# 특정 Pod의 이벤트 상세 확인
kubectl describe pod <pod-name> -n <namespace>

# Pod 내부 로그 확인
kubectl logs <pod-name> -n <namespace>
```

#### 예. 이벤트 상세 확인
<img width="1216" alt="image" src="https://github.com/user-attachments/assets/3b3d5ab3-4f73-4c20-ad65-fbad9e17e7d0" />


### ✅ 5. 문제 Pod 재시작 (문제 해결 후)
```
# 모든 Loki/Prometheus 관련 Pod 삭제하여 재생성 유도
kubectl delete pod -n monitoring --all
kubectl delete pod -n loki-stack --all

# calico-node만 재시작 (전체 네트워크 초기화)
kubectl delete pod -n kube-system -l k8s-app=calico-node
```


### ✅ 6. 상태 재확인
```
kubectl get pods -n kube-system
kubectl get pods -n monitoring
kubectl get pods -n loki-stack

```

