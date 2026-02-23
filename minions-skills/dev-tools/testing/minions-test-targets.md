---
name: minions-test-targets
id: OC-0170
version: 1.0.0
description: "Agent-under-test definitions, endpoints, capabilities, and auth configs"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-test-targets — Agent Skills

## What is a Test Target in the Minions Context?

```
an AI agent registered for testing        → TestTarget
a declared capability of that agent       → TargetCapability
```

## MinionTypes
```ts
// test-target — name, endpoint, protocol (http/ws/grpc), framework, auth
// target-capability — tool names, expected behavior descriptions
```

## Relations
```
test-target       --has_capability-->    target-capability
test-target       --tested_by-->         test-scenario (minions-test-scenarios)
test-target       --traced_by-->         test-trace (minions-test-observability)
```

## Agent SKILLS
```markdown
# TargetAgent Skills
## Skill: Register Target — define endpoint, capabilities, auth
## Hard Rules — every target must declare its capabilities before testing
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-test-targets/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
test-targets types list
test-targets types show <type-slug>
```

### CRUD

```bash
test-targets create <type> -t "Title" -s "status"
test-targets list <type>
test-targets show <id>
test-targets update <id> --data '{ "status": "active" }'
test-targets delete <id>
test-targets search "query"
```

### Stats & Validation

```bash
test-targets stats
test-targets validate ./my-minion.json
```