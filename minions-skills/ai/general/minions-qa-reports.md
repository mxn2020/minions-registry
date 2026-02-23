---
name: minions-qa-reports
id: OC-0148
version: 1.0.0
description: "Aggregated test reports, health dashboards, trend analysis, and regression alerts"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-qa-reports — Agent Skills

## What are QA Reports in the Minions Context?

```
an aggregated report across QA runs       → QaReport
a health score per clawspace/toolbox      → HealthScore
a detected quality regression             → RegressionAlert
a trend snapshot over time                → TrendSnapshot
```

Reports are the primary output of ClawspaceQA — concise but detailed.

---

## MinionTypes

```ts
// qa-report — human-readable aggregation with recommendations
{
  type: "qa-report",
  fields: {
    name: string,
    clawspace: string,              // or "all" for ecosystem-wide
    periodStart: datetime,
    periodEnd: datetime,
    totalRuns: number,
    overallPassRate: number,
    failedSuites: string[],
    regressions: string[],
    recommendations: string[],
    generatedAt: datetime
  }
}

// health-score — A/B/C/D/F grading per target
{
  type: "health-score",
  fields: {
    targetType: "clawspace" | "toolbox" | "ecosystem",
    targetName: string,
    score: number,                  // 0-100
    grade: "A" | "B" | "C" | "D" | "F",
    breakdown: {                    // per-category scores
      schema: number,
      build: number,
      cli: number,
      structure: number,
      consistency: number
    },
    previousScore: number,
    trend: "improving" | "stable" | "declining",
    computedAt: datetime
  }
}

// regression-alert — automatic when scores drop
// trend-snapshot — periodic captures for dashboards
```

### Report Format

Reports are structured for quick scanning:
```
┌─────────────────────────────────────────────┐
│  ClawspaceQA Report — WiesnTracker          │
│  Period: 2026-02-20 → 2026-02-23            │
│  Health: A (96/100) ▲ +2                    │
├─────────────────────────────────────────────┤
│  ✅ minions-venues        100%  (12/12)     │
│  ✅ minions-availability   92%  (11/12)     │
│  ⚠️  minions-alerts        83%  (10/12)     │
├─────────────────────────────────────────────┤
│  Failures:                                  │
│  • minions-alerts: CLI `stats` missing flag │
│  • minions-alerts: SKILLS.md outdated       │
│                                             │
│  Recommendations:                           │
│  • Update SKILLS.md to match TOML schema    │
│  • Add --json flag to CLI stats command     │
└─────────────────────────────────────────────┘
```

---

## Relations

```
qa-report          --aggregates-->       qa-run (minions-qa-runs)
qa-report          --produces-->         health-score
qa-report          --detects-->          regression-alert
health-score       --tracked_in-->       trend-snapshot
regression-alert   --triggers-->         task (minions-tasks)
```

---

## Agent SKILLS for `minions-qa-reports`

```markdown
# ReportAgent Skills

## Context
You generate concise, actionable reports from QA run data. Your reports
must be scannable in seconds but contain all detail needed to act on
failures. You track health trends and surface regressions immediately.

## Skill: Generate Report
1. Aggregate qa-runs for the period and target
2. Compute pass rate per suite and per clawspace
3. Identify failed test cases and their error details
4. Write concise recommendations for each failure
5. Create qa-report Minion

## Skill: Compute Health Score
1. Weight category scores: schema (30%), build (25%), structure (20%), cli (15%), consistency (10%)
2. Convert to letter grade (A=90+, B=80+, C=70+, D=60+, F=<60)
3. Compare to previous score for trend detection
4. Create health-score Minion

## Skill: Detect Regressions
1. Compare current health-score to previous
2. If any category drops >10 points: create regression-alert
3. If overall grade drops: create high-severity alert
4. Create investigation task in minions-tasks

## Skill: Ecosystem Report
1. Generate per-clawspace reports
2. Aggregate into ecosystem-wide summary
3. Rank clawspaces by health: best to worst
4. Surface systemic issues (e.g. "5 clawspaces have outdated SKILLS.md")

## Hard Rules
- Reports must be concise — no filler text
- Every failure must have a recommendation
- Health scores use consistent weighting across all targets
- Regressions always create tasks — never ignored
```


---

## CLI Reference

```bash
pnpm add -g @minions-qa-reports/cli
```

### Commands

```bash
qa-reports types list
qa-reports types show <type-slug>
qa-reports create <type> -t "Title" -s "status"
qa-reports list <type>
qa-reports show <id>
qa-reports update <id> --data '{ "field": "value" }'
qa-reports delete <id>
qa-reports search "query"
qa-reports stats
```