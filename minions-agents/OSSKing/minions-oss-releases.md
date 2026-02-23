## What is an Release in the Minions Context?

```
a versioned release                       → Release
a package registry publish confirmation   → PublishReceipt
```

## MinionTypes
```ts
// release — version, changelog, feature IDs, published-to registries
// publish-receipt — registry (npm/pypi), package URL, status
```

## Relations
```
release           --belongs_to-->        oss-project (minions-oss-projects)
release           --includes-->          feature (minions-oss-features)
release           --gated_by-->          quality-gate (minions-oss-quality)
release           --confirmed_by-->      publish-receipt
release           --announced_via-->     release-post (minions-oss-content)
```

## Agent SKILLS
```markdown
# ReleaseAgent Skills
## Skill: Cut Release — version bump, changelog, tag, publish
## Skill: Verify Publish — confirm receipt from all registries
## Hard Rules — all quality gates must pass before release
```
