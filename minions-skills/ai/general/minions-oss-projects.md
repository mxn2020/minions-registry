---
name: minions-oss-projects
id: OC-0138
version: 1.0.0
description: "Project definitions, repos, version history, and health status"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-oss-projects — Agent Skills

## What is an OSS Project in the Minions Context?

```
an active open-source project             → OssProject
a periodic health snapshot                 → ProjectMetric
```

## MinionTypes
```ts
// oss-project — name, repo URL, package name, version, health, stars, downloads
// project-metric — periodic snapshot of stars, forks, issues, downloads
```

## Relations
```
oss-project       --born_from-->         oss-idea (minions-oss-ideas)
oss-project       --has_feature-->       feature (minions-oss-features)
oss-project       --has_release-->       release (minions-oss-releases)
oss-project       --tracked_by-->        project-metric
```

## Agent SKILLS
```markdown
# ProjectAgent Skills
## Skill: Initialize Project — create repo, scaffold, first commit
## Skill: Track Health — periodic project-metric snapshots
## Hard Rules — every project must trace to an oss-idea
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-oss-projects/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
oss-projects types list
oss-projects types show <type-slug>
```

### CRUD

```bash
oss-projects create <type> -t "Title" -s "status"
oss-projects list <type>
oss-projects show <id>
oss-projects update <id> --data '{ "status": "active" }'
oss-projects delete <id>
oss-projects search "query"
```

### Stats & Validation

```bash
oss-projects stats
oss-projects validate ./my-minion.json
```