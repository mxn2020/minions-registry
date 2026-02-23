---
name: minions-component-evals
id: OC-0113
version: 1.0.0
description: "Pipeline-level benchmarks for RAG, routing, and classification"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-component-evals — Agent Skills

## What is a Component Eval in the Minions Context?

```
a benchmark for a pipeline component      → ComponentBenchmark
a result from running a benchmark         → BenchmarkResult
```

Evaluates isolated components: RAG correctness, routing accuracy, classification F1.

## MinionTypes
```ts
// component-benchmark — component type, target, dataset, threshold
// benchmark-result — score, metric breakdown, pass/fail, prompt version
```

## Agent SKILLS
```markdown
# EvalAgent Skills
## Skill: Run Benchmark — execute against isolated component
## Hard Rules — benchmarks must use versioned datasets for reproducibility
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-component-evals/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
component-evals types list
component-evals types show <type-slug>
```

### CRUD

```bash
component-evals create <type> -t "Title" -s "status"
component-evals list <type>
component-evals show <id>
component-evals update <id> --data '{ "status": "active" }'
component-evals delete <id>
component-evals search "query"
```

### Stats & Validation

```bash
component-evals stats
component-evals validate ./my-minion.json
```