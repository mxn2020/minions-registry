---
name: minions-dev-prompts
id: OC-0124
version: 1.0.0
description: "Reusable prompt templates, prompt chains, and prompt versioning for agent-tasks"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-dev-prompts — Agent Skills

## What is a Dev Prompt in the Minions Context?

```
a reusable prompt template for agent-tasks   → PromptTemplate
an ordered sequence of prompts               → PromptChain
a versioned snapshot for auditing            → PromptVersion
```

Prompt quality determines agent-task quality. This toolbox is the prompt library.

---

## MinionTypes

```ts
// prompt-template
{
  type: "prompt-template",
  fields: {
    name: string,                    // "add-rest-api", "setup-auth", "add-tests"
    description: string,
    category: "feature" | "bugfix" | "refactor" | "test" | "docs" | "ci" | "scaffold",
    template: string,                // prompt with {{variables}}
    variables: string[],             // ["framework", "authProvider", "dbType"]
    exampleOutput: string,
    version: number,
    isActive: boolean,
    createdAt: datetime
  }
}

// prompt-chain — ordered prompt sequences for complex features
// e.g. "setup-db" → "add-models" → "add-api" → "add-tests"

// prompt-version — immutable snapshots for auditing and rollback
```

---

## Relations

```
prompt-template    --versioned_in-->     prompt-version
prompt-template    --chained_in-->       prompt-chain
prompt-template    --used_by-->          agent-task (minions-agent-tasks)
prompt-chain       --feeds-->            task-batch (minions-agent-tasks)
```

---

## How It Connects to Other Toolboxes

```
minions-agent-tasks    → prompts are the input to every agent-task
minions-evaluations    → prompt quality can be scored against task-results
minions-memory         → effective prompt patterns stored as agent knowledge
minions-taxonomy       → prompt categories align with taxonomy
```

---

## Agent SKILLS for `minions-dev-prompts`

```markdown
# PromptAgent Skills

## Context
You maintain the prompt library for AIDeveloper. You create, refine,
version, and chain prompts that produce high-quality agent-task output.
You learn from task-results to improve prompts over time.

## Skill: Create Template
1. Define a reusable prompt-template with variables
2. Write example output showing expected behavior
3. Set category and version

## Skill: Build Chain
1. For complex features: compose a sequence of prompt-templates
2. Define execution order and dependencies
3. Create prompt-chain Minion

## Skill: Version Prompt
1. Before modifying a template: create prompt-version snapshot
2. Update template with improvements
3. Increment version number
4. Log change notes

## Skill: Learn from Results
1. After each agent-task completes: assess quality
2. If quality is low: identify prompt weaknesses
3. Refine template and create new version
4. Track which prompt version produced the best results

## Hard Rules
- Prompts are never deleted — only deactivated
- Every modification creates a prompt-version first
- Prompt chains must be tested before use in production
- Variables must be documented with expected values
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-dev-prompts/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
dev-prompts types list
dev-prompts types show <type-slug>
```

### CRUD

```bash
dev-prompts create <type> -t "Title" -s "status"
dev-prompts list <type>
dev-prompts show <id>
dev-prompts update <id> --data '{ "status": "active" }'
dev-prompts delete <id>
dev-prompts search "query"
```

### Stats & Validation

```bash
dev-prompts stats
dev-prompts validate ./my-minion.json
```