---
name: minions-qa-suites
id: OC-0151
version: 1.0.0
description: "Test suite definitions, test cases, and assertions for validating clawspace toolboxes"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-qa-suites — Agent Skills

## What is a QA Suite in the Minions Context?

```
a suite of tests targeting a clawspace/toolbox    → TestSuite
a single test with assertions                     → TestCase
a reusable assertion rule                         → AssertionRule
a registered clawspace with expected structure    → ClawspaceManifest
```

---

## MinionTypes

```ts
// test-suite — groups test cases by clawspace or toolbox
{
  type: "test-suite",
  fields: {
    name: string,                    // "WiesnTracker Full Suite"
    clawspace: string,               // "WiesnTracker"
    toolboxId: string,               // optional: scope to one toolbox
    testCaseIds: string[],
    schedule: "on-push" | "daily" | "weekly" | "manual",
    isActive: boolean,
    lastRunAt: datetime
  }
}

// test-case — individual checks
{
  type: "test-case",
  fields: {
    suiteId: string,
    name: string,                    // "TOML schema is valid"
    category: "schema" | "build" | "cli" | "integration" | "structure" | "consistency",
    command: string,                 // actual command to run
    expectedOutcome: string,
    assertions: AssertionRule[],
    timeout: number,                 // ms
    severity: "critical" | "major" | "minor"
  }
}

// clawspace-manifest — what we expect each clawspace to look like
{
  type: "clawspace-manifest",
  fields: {
    clawspaceName: string,
    toolboxNames: string[],
    expectedToolboxCount: number,
    expectedFilePatterns: string[],   // ["SKILLS.md", "packages/cli/**", "packages/core/**"]
    healthBaseline: object            // known-good health-score snapshot
  }
}
```

### What Gets Tested

| Category | What it checks |
|----------|----------------|
| `schema` | TOML configs parse correctly, MinionTypes have valid fields |
| `build` | `pnpm install && pnpm build` succeeds |
| `cli` | CLI commands run without errors (`types list`, `stats`) |
| `structure` | Required files exist (SKILLS.md, README, CI workflows) |
| `consistency` | Cross-toolbox relations reference valid targets |
| `integration` | End-to-end workflows across toolboxes produce expected results |

---

## Relations

```
test-suite         --contains-->         test-case
test-case          --uses-->             assertion-rule
test-suite         --validates-->        clawspace-manifest
test-suite         --produces-->         qa-run (minions-qa-runs)
clawspace-manifest --describes-->        clawspace (minions-orchestration)
```

---

## Agent SKILLS for `minions-qa-suites`

```markdown
# SuiteAgent Skills

## Context
You define and maintain test suites for every clawspace in the ecosystem.
You ensure comprehensive coverage — every toolbox is tested for schema
validity, build health, CLI functionality, and structural compliance.

## Skill: Register Clawspace
1. Create clawspace-manifest from CLAWSPACES.md
2. Generate default test-suites for each toolbox:
   - Schema validation suite
   - Build health suite
   - Structure compliance suite
3. Set schedule based on priority (active clawspaces = daily)

## Skill: Create Test Case
1. Define the command to execute
2. Write assertions with expected outcomes
3. Set severity (critical = blocks health, minor = advisory)
4. Add to appropriate test-suite

## Skill: Auto-Generate Suites
1. Scan _claws/<Clawspace>/ for TOML files
2. For each TOML: create schema validation + CLI test cases
3. Check for SKILLS.md, README, .github/workflows/
4. Create structure compliance test cases

## Hard Rules
- Every clawspace must have at least one test-suite
- Critical test cases must have a timeout < 60s
- Assertion rules are reusable — never duplicate logic
```


---

## CLI Reference

```bash
pnpm add -g @minions-qa-suites/cli
```

### Commands

```bash
qa-suites types list
qa-suites types show <type-slug>
qa-suites create <type> -t "Title" -s "status"
qa-suites list <type>
qa-suites show <id>
qa-suites update <id> --data '{ "field": "value" }'
qa-suites delete <id>
qa-suites search "query"
qa-suites stats
```