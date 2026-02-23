---
name: minions-qa-rules
id: OC-0149
version: 1.0.0
description: "Validation rules, consistency checks, compliance gates, and auto-fix definitions"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-qa-rules — Agent Skills

## What are QA Rules in the Minions Context?

```
a structural/content validation rule       → ValidationRule
a cross-toolbox consistency check          → ConsistencyCheck
a quality gate for clawspace health        → ComplianceGate
an automated fix for known failures        → AutoFix
```

Rules are the brain of ClawspaceQA — they encode what "correct" looks like.

---

## MinionTypes

```ts
// validation-rule — single-toolbox checks
{
  type: "validation-rule",
  fields: {
    name: string,                    // "TOML has valid schema"
    category: "schema" | "structure" | "naming" | "content" | "ci",
    target: "toolbox" | "clawspace" | "ecosystem",
    condition: string,               // machine-readable check
    severity: "critical" | "major" | "minor",
    autoFixable: boolean,
    autoFixCommand: string
  }
}

// consistency-check — cross-toolbox checks
{
  type: "consistency-check",
  fields: {
    name: string,                    // "Relations reference valid toolboxes"
    sourceToolbox: string,
    targetToolbox: string,
    relation: string,                // the relation being checked
    checkQuery: string,              // how to verify
    severity: "critical" | "major"
  }
}

// compliance-gate — pass/fail threshold
{
  type: "compliance-gate",
  fields: {
    name: string,
    clawspace: string,
    metric: string,                  // "overall-pass-rate"
    threshold: number,               // 80 (percent)
    operator: "gte" | "lte" | "eq",
    isPassing: boolean
  }
}

// auto-fix — automated remediation
{
  type: "auto-fix",
  fields: {
    validationRuleId: string,
    command: string,                 // actual fix command
    dryRunCommand: string,           // preview what would change
    appliedCount: number
  }
}
```

### Built-in Validation Rules

| Rule | Category | Severity |
|------|----------|----------|
| TOML files parse without errors | schema | critical |
| Every toolbox has a SKILLS.md | structure | major |
| SKILLS.md frontmatter matches TOML description | consistency | minor |
| GitHub repo exists and is accessible | structure | critical |
| CI workflow file exists in .github/workflows/ | ci | major |
| README.md is not a scaffold default | content | minor |
| MinionType fields have valid types | schema | critical |
| Relations reference existing toolboxes | consistency | major |
| Package name matches toolbox name | naming | major |

---

## Relations

```
validation-rule    --tested_by-->        test-case (minions-qa-suites)
validation-rule    --fixed_by-->         auto-fix
consistency-check  --tested_by-->        test-case (minions-qa-suites)
compliance-gate    --checked_by-->       qa-run (minions-qa-runs)
compliance-gate    --reported_in-->      qa-report (minions-qa-reports)
```

---

## Agent SKILLS for `minions-qa-rules`

```markdown
# RulesAgent Skills

## Context
You define and maintain the validation rules that encode what a
"healthy" clawspace looks like. You also manage auto-fixes for
common failures, reducing manual remediation work.

## Skill: Define Rules
1. Create validation-rules for common patterns
2. Set severity based on impact (schema errors = critical)
3. Mark auto-fixable rules with their fix commands

## Skill: Define Consistency Checks
1. For cross-toolbox relations: create consistency-checks
2. Verify source toolbox fields reference valid targets
3. Check TOML relations match MD reference documentation

## Skill: Manage Compliance Gates
1. Define pass-rate thresholds per clawspace
2. Update isPassing after each QA run
3. Surface non-compliant clawspaces in reports

## Skill: Create Auto-Fixes
1. For auto-fixable validation failures: create auto-fix Minions
2. Always provide a dry-run command first
3. Track applied count for auditing

## Hard Rules
- Rules are versioned — changes are logged
- Auto-fixes must have dry-run commands
- Critical rules can never be deactivated without approval
- Consistency checks must cover all declared relations
```


---

## CLI Reference

```bash
pnpm add -g @minions-qa-rules/cli
```

### Commands

```bash
qa-rules types list
qa-rules types show <type-slug>
qa-rules create <type> -t "Title" -s "status"
qa-rules list <type>
qa-rules show <id>
qa-rules update <id> --data '{ "field": "value" }'
qa-rules delete <id>
qa-rules search "query"
qa-rules stats
```