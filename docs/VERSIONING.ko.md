# 버전 관리

## 정책

Ion Engine은 [시맨틱 버전 2.0.0](https://semver.org/lang/ko/)을 따릅니다.

```
MAJOR.MINOR.PATCH
```

### 버전 업 기준

| 부분 | 시점 | 예시 |
|------|------|------|
| **MAJOR** | 호환성을 깨는 API 변경 | 공개 메서드 제거, 생성자 시그니처 변경 |
| **MINOR** | 새로운 기능, 하위 호환 | 새 컴포넌트 타입, 새 시스템, 새 어댑터 |
| **PATCH** | 버그 수정, 하위 호환 | 렌더링 글리치 수정, 엔티티 재활용 수정 |

### 사전 릴리즈

사전 릴리즈 버전 형식:

```
MAJOR.MINOR.PATCH-alpha.<number>
MAJOR.MINOR.PATCH-beta.<number>
MAJOR.MINOR.PATCH-rc.<number>
```

릴리즈 진행 예시:

```
0.1.0-alpha.1 → 0.1.0-alpha.2 → 0.1.0-beta.1 → 0.1.0-rc.1 → 0.1.0
```

### 0.x.x 대역

메이저 버전이 `0`인 동안 API는 **불안정**합니다. 마이너 버전 업에 호환성을 깨는 변경이 포함될 수 있습니다. `1.0.0`이 릴리즈되면 완전한 시맨틱 버전 보장이 적용됩니다.

## 변경 로그

모든 릴리즈에는 다음 형식의 변경 로그 항목이 포함됩니다:

```markdown
## [x.y.z] - YYYY-MM-DD

### Added
- feat(scope): 설명

### Changed
- refactor(scope): 설명

### Fixed
- fix(scope): 설명

### Removed
- (해당하는 경우)
```

## Git 태그

각 릴리즈에 태그:

```bash
git tag -a v0.1.0 -m "v0.1.0 - 초기 릴리즈"
git push origin v0.1.0
```

## npm 퍼블리시

```bash
# 드라이 런
npm publish --dry-run

# 퍼블리시
npm publish

# 사전 릴리즈 퍼블리시
npm publish --tag beta
```
