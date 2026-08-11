---
title: "네트워크 권한 문제로 인한 Pod 연결 장애"
slug: 네트워크-권한-문제로-인한-pod-연결-장애
date: "2025-06-07"
category: k8s
tags: ["Kubernetes", "Linux", "트러블슈팅"]
series: k8s
seriesOrder: 3
summary: "Loki와 Grafana가 통신하지 못하는 장애를 거슬러 올라가니 Calico ServiceAccount에 RBAC 권한이 없어 CNI가 아예 동작하지 못한 것이었고, ClusterRoleBinding으로 권한을 주자 아래 서비스들이 연쇄로 복구된 진단 기록."
featured: true
---
## 네트워크 권한 문제로 인한 Pod 연결 장애
> 작성날짜: 25.06.07

### 요약 설명
>  Kubernetes에서는 하나의 권한 문제가 전체 클러스터의 네트워크 인프라에 영향을 미치며, 근본 원인(RBAC)을 해결하면 모든 연결된 서비스가 연쇄적으로 복구됩니다! 🎯

<img width="648" alt="image" src="https://github.com/user-attachments/assets/dc89d741-abf6-40f0-9b13-a770408792f9" />


```mermaid
graph TB
    subgraph "🏢 Kubernetes Cluster"
        subgraph "Control Plane"
            API[🔧 API Server]
            ETCD[🗂️ etcd]
            SCHED[📋 Scheduler]
            CTRL[🎛️ Controller Manager]
        end
        
        subgraph "RBAC 권한 시스템"
            RBAC{🔐 RBAC<br/>권한 검증}
        end
        
        subgraph "Worker Node 1"
            GRAFANA[📊 Grafana Pod]
            CALICO_NODE[🌐 Calico Node Pod]
            KUBELET1[⚙️ kubelet]
            KPROXY1[🔄 kube-proxy]
        end
        
        subgraph "Worker Node 2"
            LOKI[📝 Loki Pod]
            KUBELET2[⚙️ kubelet]
            KPROXY2[🔄 kube-proxy]
        end
        
        subgraph "kube-system Namespace"
            CNI_PLUGIN[🔌 Calico CNI Plugin]
            SA_CNI[👤 calico-cni-plugin<br/>ServiceAccount]
            SA_NODE[👤 calico-node<br/>ServiceAccount]
        end
    end
    
    %% 문제 상황 연결 (빨간색)
    API -.->|❌ 권한 거부| RBAC
    RBAC -.->|❌ 접근 차단| SA_CNI
    RBAC -.->|❌ 접근 차단| SA_NODE
    SA_CNI -.->|❌ 실행 불가| CNI_PLUGIN
    SA_NODE -.->|❌ 실행 불가| CALICO_NODE
    CNI_PLUGIN -.->|❌ 네트워크 설정 실패| LOKI
    CALICO_NODE -.->|❌ 네트워크 불가| LOKI
    LOKI -.->|❌ 연결 실패| GRAFANA
    
    %% 정상 연결 (파란색) - 해결 후
    API ==>|✅ 권한 승인| RBAC
    RBAC ==>|✅ 접근 허용| SA_CNI
    RBAC ==>|✅ 접근 허용| SA_NODE
    SA_CNI ==>|✅ 정상 실행| CNI_PLUGIN
    SA_NODE ==>|✅ 정상 실행| CALICO_NODE
    CNI_PLUGIN ==>|✅ IP 할당| LOKI
    CALICO_NODE ==>|✅ 네트워크 정책| LOKI
    LOKI ==>|✅ 로그 전송| GRAFANA
    
    %% 스타일링
    classDef errorNode fill:#ff6b6b,stroke:#e74c3c,stroke-width:3px,color:#fff
    classDef successNode fill:#2ecc71,stroke:#27ae60,stroke-width:3px,color:#fff
    classDef warningNode fill:#f39c12,stroke:#e67e22,stroke-width:3px,color:#fff
    classDef normalNode fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    classDef rbacNode fill:#9b59b6,stroke:#8e44ad,stroke-width:3px,color:#fff
    
    class GRAFANA,LOKI,CALICO_NODE,CNI_PLUGIN errorNode
    class API,ETCD,SCHED,CTRL,KUBELET1,KUBELET2,KPROXY1,KPROXY2 normalNode
    class RBAC rbacNode
    class SA_CNI,SA_NODE warningNode
```

### 문제 상황
- Calico(네트워크 관리자)가 신분증은 있지만 출입 권한이 없었음
- 권한 없이는 다른 Pod들에게 네트워크를 제공할 수 없음
- 결과적으로 Loki가 격리된 상태가 되어 Grafana와 통신 불가

### 왜 발생?
- Calico 설치 시 RBAC 설정이 누락되었거나
- 클러스터가 보안 강화 모드(--authorization-mode=RBAC)로 설정되어 있어서
- 기본적으로 모든 권한이 차단된 상태

### 해결 방법
- ClusterRoleBinding으로 필요한 권한을 명시적으로 부여
- Calico가 정상 작동하면서 모든 Pod의 네트워크 연결성 복구
- 연쇄적으로 Loki-Grafana 연결도 정상화

<img width="650" alt="image" src="https://github.com/user-attachments/assets/79ec6aec-1e10-421f-b5df-a179f91564de" />


