---
name: minions-releases
id: OC-0152
version: 1.0.0
description: "Release planning, version bumps, changelog generation, and publish targets"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-releases — Agent Skills

## What is a Release in the Minions Context?

```
a planned release with version target       → ReleasePlan
a version bump event                        → VersionBump
a registry or platform to publish to        → PublishTarget
a confirmation of successful publish        → ReleaseReceipt
```

---

## MinionTypes

```ts
// release-plan
{
  type: "release-plan",
  fields: {
    repoDefinitionId: string,
    version: string,                 // "1.2.0"
    releaseType: "major" | "minor" | "patch" | "prerelease",
    featureTaskIds: string[],        // agent-tasks included in this release
    changelog: string,               // generated from task results
    scheduledAt: datetime,
    status: "planned" | "ready" | "released" | "cancelled",
    createdAt: datetime
  }
}

// version-bump — from/to versions with tag references
// publish-target — npm, PyPI, GitHub Releases, etc.
// release-receipt — confirmation per target with published URL
```

---

## Relations

```
release-plan       --targets-->          repo-definition (minions-repos)
release-plan       --includes-->         agent-task (minions-agent-tasks)
release-plan       --bumps-->            version-bump
release-plan       --published_to-->     publish-target
publish-target     --confirmed_by-->     release-receipt
```

---

## How It Connects to Other Toolboxes

```
minions-repos          → releases scoped to repos
minions-agent-tasks    → completed tasks feed into release plans
minions-approvals      → release approval gates
minions-scheduler      → scheduled releases
minions-comms          → release notifications
```

---

## Agent SKILLS for `minions-releases`

```markdown
# ReleaseAgent Skills

## Context
You manage the release lifecycle. You plan releases from completed
agent-task batches, generate changelogs, bump versions, tag, and publish.

## Skill: Plan Release
1. Collect merged agent-tasks since last release
2. Determine version bump type from task types (feature=minor, fix=patch)
3. Generate changelog from task-results
4. Create release-plan Minion

## Skill: Execute Release
1. Bump version in package.json / pyproject.toml
2. Create version-bump Minion
3. Run `gh release create v<version> --generate-notes`
4. For each publish-target: run publish command
5. Create release-receipt Minions

## Hard Rules
- Releases require all included tasks to be merged
- Version bumps follow semver strictly
- Every release must have a changelog
- Failed publishes create retry tasks
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-releases/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
releases types list
releases types show <type-slug>
```

### CRUD

```bash
releases create <type> -t "Title" -s "status"
releases list <type>
releases show <id>
releases update <id> --data '{ "status": "active" }'
releases delete <id>
releases search "query"
```

### Stats & Validation

```bash
releases stats
releases validate ./my-minion.json
```