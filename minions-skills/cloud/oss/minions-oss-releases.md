---
name: minions-oss-releases
id: OC-0140
version: 1.0.0
description: "Release definitions, changelogs, and publish receipts"
category: cloud
subcategory: oss
tags: ["minion", "cloud", "oss"]
comments:
---

# minions-oss-releases — Agent Skills

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


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-oss-releases/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
oss-releases types list
oss-releases types show <type-slug>
```

### CRUD

```bash
oss-releases create <type> -t "Title" -s "status"
oss-releases list <type>
oss-releases show <id>
oss-releases update <id> --data '{ "status": "active" }'
oss-releases delete <id>
oss-releases search "query"
```

### Stats & Validation

```bash
oss-releases stats
oss-releases validate ./my-minion.json
```