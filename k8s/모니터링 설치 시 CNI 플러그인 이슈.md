---
title: "모니터링 설치 시 CNI 플러그인 이슈"
slug: 모니터링-설치-시-cni-플러그인-이슈
date: "2025-06-07"
category: k8s
tags: ["Kubernetes", "Linux", "트러블슈팅"]
series: k8s
seriesOrder: 2
summary: "프로메테우스와 Loki를 올렸는데 Pod가 READY 1/1이 되지 않고 멈춘 원인이 CNI 플러그인 부재였음을 확인하고, Calico를 설치해 Pod IP 할당부터 되살린 기록."
featured: false
---
## 모니터링 설치 시 CNI 플러그인 이슈
> 작성날짜: 25.06.07
### 요약
<img width="832" alt="image" src="https://github.com/user-attachments/assets/e4829bbc-c0ae-45e5-a56e-d1a1b0b39684" />

<img width="874" alt="image" src="https://github.com/user-attachments/assets/bdd0e14c-e160-44c4-baf0-e5237641a5ff" />

### 문제 
- READY 상태가 1/1이 아니라 → Pod 내부 컨테이너가 제대로 시작되지 않음
- 아래 명령어 실행 시, 무한 대기 문제


```
kubectl apply -f ground/k8s-1.27/prometheus-2.44.0/manifests/setup
kubectl apply -f ground/k8s-1.27/prometheus-2.44.0/manifests
kubectl apply -f ground/k8s-1.27/loki-stack-2.6.1
```

### 발생 이유
#### 1️⃣ CNI 플러그인 누락/고장
```
# CNI 상태 확인
kubectl get pods -n kube-system | grep calico
# 또는
kubectl get pods -n kube-system | grep flannel
```


#### 2️⃣ 네트워크 초기화 실패
- Pod 생성 시 IP 할당 실패
- 컨테이너 간 통신 불가
- DNS 해석 실패

### 해결 방법
#### 1단계: CNI 플러그인 상태 확인
```
kubectl get pods -n kube-system
```


#### 2단계: CNI 플러그인 설치 (없다면)
```
# Calico 설치
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/tigera-operator.yaml
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/custom-resources.yaml

# 또는 Flannel 설치
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```


#### 3단계: 설치 후 확인 
```
# CNI Pod들이 Running 되는지 확인
kubectl get pods -n kube-system

# 기존 문제 Pod들 재시작
kubectl delete pod -n monitoring --all
kubectl delete pod -n loki-stack --all
```

### 왜 ?? 이렇게 되는가
#### Pod 생성 과정
1. kubelet이 Pod 생성 요청 받음
2. CNI가 네트워크 설정 ← 여기서 실패!
3. 컨테이너 이미지 다운로드
4. 컨테이너 시작

🚀 CNI가 없으면 2번 단계에서 멈춰서 컨테이너가 아예 시작되지 않아요.
