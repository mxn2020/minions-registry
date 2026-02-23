---
name: minions-oss-ideas
id: OC-0137
version: 1.0.0
description: "Idea brainstorms, feasibility scores, tech stack picks, and market gaps"
category: cloud
subcategory: oss
tags: ["minion", "cloud", "oss"]
comments:
---

# minions-oss-ideas — Agent Skills

## What is an OSS Idea in the Minions Context?

```
a brainstormed open-source project idea   → OssIdea
a structured evaluation of an idea        → IdeaEvaluation
```

## MinionTypes
```ts
// oss-idea — title, problem statement, market gap, feasibility/novelty scores, tech stack
// idea-evaluation — per-criterion scoring with reasoning
```

## Relations
```
oss-idea          --evaluated_by-->      idea-evaluation
oss-idea          --becomes-->           oss-project (minions-oss-projects)
```

## Agent SKILLS
```markdown
# IdeaAgent Skills
## Skill: Brainstorm — generate ideas based on trends, gaps, skills
## Skill: Evaluate — score ideas on feasibility, novelty, market fit
## Hard Rules — ideas must have problem statements before evaluation
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-oss-ideas/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
oss-ideas types list
oss-ideas types show <type-slug>
```

### CRUD

```bash
oss-ideas create <type> -t "Title" -s "status"
oss-ideas list <type>
oss-ideas show <id>
oss-ideas update <id> --data '{ "status": "active" }'
oss-ideas delete <id>
oss-ideas search "query"
```

### Stats & Validation

```bash
oss-ideas stats
oss-ideas validate ./my-minion.json
```