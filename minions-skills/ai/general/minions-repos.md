---
name: minions-repos
id: OC-0153
version: 1.0.0
description: "GitHub repo definitions, workflow templates, label sets, and branch protection rules"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-repos — Agent Skills

## What is a Repo in the Minions Context?

```
a GitHub repository to be created           → RepoDefinition
a reusable GitHub Actions workflow          → WorkflowTemplate
a curated set of issue/PR labels            → LabelSet
branch protection and merge rules           → BranchRule
```

---

## MinionTypes

```ts
// repo-definition
{
  type: "repo-definition",
  fields: {
    name: string,                   // "my-awesome-app"
    description: string,
    visibility: "public" | "private",
    defaultBranch: string,          // "main"
    template: string,               // scaffold template to use
    org: string,                    // "mxn2020"
    status: "planned" | "created" | "configured" | "archived",
    createdAt: datetime,
    repoUrl: string                 // "https://github.com/mxn2020/my-awesome-app"
  }
}

// workflow-template — reusable CI/CD YAML templates
// label-set — predefined label collections (e.g. "standard", "agile")
// branch-rule — protection policies per branch
```

See TOML for full field definitions.

---

## Relations

```
repo-definition    --uses_template-->    scaffold-template (minions-scaffolds)
repo-definition    --has_workflows-->    workflow-template
repo-definition    --has_labels-->       label-set
repo-definition    --has_rules-->        branch-rule
repo-definition    --receives_tasks-->   agent-task (minions-agent-tasks)
repo-definition    --has_releases-->     release-plan (minions-releases)
```

---

## How It Connects to Other Toolboxes

```
minions-scaffolds      → scaffold selected at repo creation time
minions-agent-tasks    → agent-tasks reference repoDefinitionId
minions-releases       → release plans and publish targets scoped to repo
minions-tasks          → repo configuration issues create tasks
minions-costs          → GitHub Actions minutes can be tracked
```

---

## Agent SKILLS for `minions-repos`

```markdown
# RepoAgent Skills

## Context
You create and configure GitHub repositories using the `gh` CLI.
You ensure every repo has proper CI/CD workflows, labels, and
branch protection from day one.

## Skill: Create Repository
1. Load repo-definition with name, description, visibility
2. Run `gh repo create <org>/<name> --public --description "…"`
3. Apply workflow-templates: write YAML files to `.github/workflows/`
4. Apply label-set: create labels via `gh label create <name> --color <hex>`
5. Apply branch-rules: configure via `gh api repos/{owner}/{repo}/branches/{branch}/protection`
6. Update repo-definition status to "configured"

## Skill: Apply Workflow Template
1. Load workflow-template content
2. Write to `.github/workflows/<filename>` in the repo
3. Commit and push

## Hard Rules
- Every repo must have at least CI and release workflows
- Branch protection on main is mandatory for public repos
- Never delete repos — archive them
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-repos/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
repos types list
repos types show <type-slug>
```

### CRUD

```bash
repos create <type> -t "Title" -s "status"
repos list <type>
repos show <id>
repos update <id> --data '{ "status": "active" }'
repos delete <id>
repos search "query"
```

### Stats & Validation

```bash
repos stats
repos validate ./my-minion.json
```