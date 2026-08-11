export const TAGS = [
  'Kotlin', 'Java', 'JavaScript',
  'Spring Boot', 'Spring Security', 'JPA', 'Vue',
  'Kubernetes', 'Docker', 'AWS', 'Linux',
  'Redis', 'Kafka', 'RabbitMQ', 'Oracle', 'MySQL', 'MongoDB', 'SQLite',
  'DDD', '멀티모듈', '트랜잭션', '동시성', '아키텍처',
  '테스트', 'API 문서화', '리팩터링', '트러블슈팅',
  'Git', 'SVN', 'Gradle', 'CI/CD',
  '오픈소스',
] as const;

export type TagName = (typeof TAGS)[number];
