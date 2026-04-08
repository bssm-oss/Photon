# 기여하기

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

### 형식

```
<type>(<scope>): <description>

[선택적 본문]

[선택적 푸터]
```

### 타입

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 재구성 |
| `perf` | 성능 개선 |
| `docs` | 문서만 변경 |
| `test` | 테스트 추가/수정 |
| `build` | 빌드 시스템 또는 의존성 변경 |
| `ci` | CI/CD 설정 |
| `chore` | 유지보수 작업 |
| `style` | 포맷팅, 로직 변경 없음 |
| `revert` | 이전 커밋 되돌리기 |

### 스코프

| 스코프 | 모듈 |
|--------|------|
| `ecs` | Entity, Component, System, World, Archetype |
| `scene` | Scene, SceneManager |
| `view` | Transform2D, Camera2D |
| `renderer` | Renderer, Shader, Sprite, Texture |
| `fs` | IFileSystem, BrowserFileSystem, ElectronFileSystem |
| `input` | InputManager |
| `event` | EventBus |
| `math` | Vec2, Mat3, Rect, Transform |
| `core` | Engine, INativeBridge |
| `electron` | Electron 어댑터 |
| `compute` | IComputeBackend, NoopCompute |

### 예시

```
feat(renderer): 텍스처 아틀라스 지원 추가
fix(ecs): 엔티티 ID 재사용 시 충돌 해결
refactor(scene): 엔티티 이동 로직 단순화
perf(renderer): 텍스처별 스프라이트 배치
docs(readme): 한국어 문서 추가
test(math): Vec2 및 Mat3 유닛 테스트 추가
chore(deps): vite v6으로 업데이트
```

## 풀 리퀘스트 절차

1. 리포지토리 포크
2. 피처 브랜치 생성: `git checkout -b feat/my-feature`
3. 올바른 커밋 메시지로 변경
4. 모든 테스트 통과 확인: `npm test`
5. 타입 체크 통과 확인: `npm run typecheck`
6. 린트 통과 확인: `npm run lint`
7. 명확한 설명과 함께 PR 오픈

## 코드 스타일

- TypeScript strict 모드
- `any` 타입 사용 금지 (불가피한 경우 제외)
- 주석 없음 (요청된 경우만)
- 2칸 들여쓰기
- 문자열에 작은따옴표
- 세미콜론 필수
