# Versioning

## Policy

Ion Engine follows [Semantic Versioning 2.0.0](https://semver.org/).

```
MAJOR.MINOR.PATCH
```

### When to bump

| Part | When | Example |
|------|------|---------|
| **MAJOR** | Breaking API changes | Removing a public method, changing a constructor signature |
| **MINOR** | New features, backwards-compatible | Adding a new component type, new system, new adapter |
| **PATCH** | Bug fixes, backwards-compatible | Fixing a render glitch, fixing entity recycling |

### Pre-release

Pre-release versions use the format:

```
MAJOR.MINOR.PATCH-alpha.<number>
MAJOR.MINOR.PATCH-beta.<number>
MAJOR.MINOR.PATCH-rc.<number>
```

Example progression:

```
0.1.0-alpha.1 → 0.1.0-alpha.2 → 0.1.0-beta.1 → 0.1.0-rc.1 → 0.1.0
```

### 0.x.x Range

While the major version is `0`, the API is considered **unstable**. Minor version bumps may include breaking changes. Once `1.0.0` is released, full semver guarantees apply.

## Changelog

Every release includes a changelog entry in the following format:

```markdown
## [x.y.z] - YYYY-MM-DD

### Added
- feat(scope): description

### Changed
- refactor(scope): description

### Fixed
- fix(scope): description

### Removed
- (if applicable)
```

## Git Tags

Each release is tagged:

```bash
git tag -a v0.1.0 -m "v0.1.0 - Initial release"
git push origin v0.1.0
```

## npm Publishing

```bash
# Dry run
npm publish --dry-run

# Publish
npm publish

# Publish pre-release
npm publish --tag beta
```
