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
