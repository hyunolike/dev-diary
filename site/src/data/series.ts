export const SERIES = {
  'order-server': {
    name: '주문 서버 개발기',
    description:
      '6개 도메인이 얽힌 커머스 주문을 멀티모듈로 분리하고, 내부/외부 통신과 트랜잭션 경계를 설계해 구현하기까지의 3부작',
  },
  'gstreamer-oss': {
    name: '오픈소스 GStreamer 기여기',
    description: '듀얼부팅 환경 준비부터 로컬 빌드, 기여를 위한 커밋 정리까지의 기록',
  },
  svn: {
    name: 'SVN 실무 정리',
    description: '레거시 형상관리 도구를 실무에서 다루며 정리한 개념·프로세스·충돌 해결',
  },
  k8s: {
    name: 'Kubernetes 운영 기록',
    description: 'CNI 플러그인 장애, Pod 네트워크 권한 문제, Finalizer 교착의 진단과 해소',
  },
} as const;

export type SeriesSlug = keyof typeof SERIES;
