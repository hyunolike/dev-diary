## JPA Entity 연관관계 (feat. 제미니의 개발실무)
> 작성날짜: 24.09.29

### JPA 엔티티와 도메인 객체의 설계
- 연관관계를 잘 안건다 (거의)
- id 매핑 (FK 미사용)


### 연관관계 사용 지침 (정답은 아니다!)
#### 1. 안거는 지침
> id로만 걸어놓으면 그 다음 전략이 쉬움

<img width="682" alt="image" src="https://github.com/user-attachments/assets/e0b509b5-19cb-466f-a338-7d4385c377a8">

- 양방향 걸지 않는다
- 단방향만!
- 단방향도 왠만하면 `oneToMany` 안건다
- `oneTonOne`도 안건다
- 양방향 + Entity 도메인 사용 > 이 조합 최악의 수
#### 2. 거는 지침
> `r.m`으로 떡칠해놓으면 답이 없다

<img width="396" alt="image" src="https://github.com/user-attachments/assets/c7ea313b-9c16-4164-935e-9ca22e3a84b3">


- 라이프사이클(생명주기)가 완전히 같다면 `고민`
    - 리뷰가 있다고해서 이미지가 꼭 있는가? (정책)
- 고민 후 단방향 `manyToOne`을 보통 건다

### 실제 코드는 어떻게 적용할까?
#### 엔티티 & 도메인 "엔티티랑 도메인은 1대1이 아니다!"
##### 질문, 답변 - 엔티티, 도메인 객체
<img width="480" alt="image" src="https://github.com/user-attachments/assets/b9815c72-7a4d-4043-8bff-73d88a70e32d">
<img width="536" alt="image" src="https://github.com/user-attachments/assets/088cf394-f3ed-4dfd-b848-457f7f74d6a6">

##### 리뷰, 리뷰(이미지포함) - 도메인 객체
<img width="736" alt="image" src="https://github.com/user-attachments/assets/33faefe9-8c30-46aa-9bb1-15ef76e40e91">

---
#### 참고문헌
- [JPA Entity 연관관계 어떻게 걸까요? + 엔티티 연관관계 PTSD](https://youtu.be/vgNHW_nb2mg?si=4CEmryxW0Nx19iaC)
