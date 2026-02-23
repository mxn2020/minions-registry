---
name: minions-qa-runs
id: OC-0150
version: 1.0.0
description: "Test execution records, assertion results, and pass/fail tracking across clawspaces"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-qa-runs — Agent Skills

## What is a QA Run in the Minions Context?

```
an execution of a test suite               → QaRun
the result of a single test case           → TestResult
the result of a single assertion           → AssertionResult
```

---

## MinionTypes

```ts
// qa-run — one execution of a suite
{
  type: "qa-run",
  fields: {
    suiteId: string,
    clawspace: string,
    status: "running" | "passed" | "failed" | "error",
    totalTests: number,
    passed: number,
    failed: number,
    skipped: number,
    durationMs: number,
    triggeredBy: "schedule" | "manual" | "push" | "pr"
  }
}

// test-result — per-test outcome with stdout/stderr capture
{
  type: "test-result",
  fields: {
    runId: string,
    testCaseId: string,
    status: "passed" | "failed" | "error" | "skipped",
    actualOutcome: string,
    errorMessage: string,
    durationMs: number,
    stdout: string,              // captured for debugging
    stderr: string
  }
}

// assertion-result — granular pass/fail per assertion
{
  type: "assertion-result",
  fields: {
    testResultId: string,
    passed: boolean,
    actualValue: string,
    expectedValue: string,
    errorDetail: string
  }
}
```

---

## Relations

```
qa-run             --belongs_to-->       test-suite (minions-qa-suites)
qa-run             --contains-->         test-result
test-result        --contains-->         assertion-result
qa-run             --aggregated_in-->    qa-report (minions-qa-reports)
```

---

## Agent SKILLS for `minions-qa-runs`

```markdown
# RunnerAgent Skills

## Context
You execute test suites against clawspaces. You run commands, capture
output, evaluate assertions, and record results. You never modify code
— you only observe and report.

## Skill: Execute Suite
1. Load test-suite and its test-cases
2. For each test-case (in order):
   a. Run command with timeout
   b. Capture stdout + stderr
   c. Evaluate each assertion-rule against output
   d. Create test-result + assertion-result Minions
3. Compute totals (passed/failed/skipped)
4. Create qa-run Minion with final status

## Skill: Run All Suites
1. Load all active test-suites
2. Execute each suite (parallelizable across clawspaces)
3. Report aggregate pass/fail to QAReportAgent

## Skill: Handle Failures
1. On test failure: capture full error context
2. If severity = critical: create alert in minions-alerts (if available)
3. Create investigation task in minions-tasks

## Hard Rules
- Never skip a test silently — always record skip reason
- Capture stdout + stderr for every test, even passing ones
- Respect timeouts — kill long-running tests gracefully
- Results are immutable after creation
```


---

## CLI Reference

```bash
pnpm add -g @minions-qa-runs/cli
```

### Commands

```bash
qa-runs types list
qa-runs types show <type-slug>
qa-runs create <type> -t "Title" -s "status"
qa-runs list <type>
qa-runs show <id>
qa-runs update <id> --data '{ "field": "value" }'
qa-runs delete <id>
qa-runs search "query"
qa-runs stats
```