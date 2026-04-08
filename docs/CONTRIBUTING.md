# Contributing

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) with a few additions.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvement |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |
| `style` | Formatting, no logic change |
| `revert` | Revert a previous commit |

### Scopes

| Scope | Module |
|-------|--------|
| `ecs` | Entity, Component, System, World, Archetype |
| `scene` | Scene, SceneManager |
| `view` | Transform2D, Camera2D |
| `renderer` | Renderer, Shader, Sprite, Texture |
| `fs` | IFileSystem, BrowserFileSystem, ElectronFileSystem |
| `input` | InputManager |
| `event` | EventBus |
| `math` | Vec2, Mat3, Rect, Transform |
| `core` | Engine, INativeBridge |
| `electron` | Electron adapter |
| `compute` | IComputeBackend, NoopCompute |

### Examples

```
feat(renderer): add texture atlas support
fix(ecs): resolve entity ID collision on recycle
refactor(scene): simplify entity migration logic
perf(renderer): batch sprites by texture
docs(readme): add Korean documentation
test(math): add Vec2 and Mat3 unit tests
chore(deps): update vite to v6
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes with proper commit messages
4. Ensure all tests pass: `npm test`
5. Ensure type checking passes: `npm run typecheck`
6. Ensure linting passes: `npm run lint`
7. Open a PR with a clear description

## Code Style

- TypeScript strict mode
- No `any` types unless absolutely necessary
- No comments unless explicitly requested
- 2-space indentation
- Single quotes for strings
- Semicolons required
