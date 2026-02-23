## What is a Match in the Minions Context?

Before defining types, it's worth being precise. "Matching" covers several distinct concepts:

```
evaluating a job against your profile     → MatchScore
rules that disqualify regardless of score → HardGate
user preferences that bias scoring        → MatchPreference
a curated selection of top results        → Shortlist
explaining why something scored how it did → MatchExplanation
tracking score changes over time          → ScoreHistory
```

---

## MinionTypes

**Core**
```ts
// match-score
{
  type: "match-score",
  fields: {
    jobId: string,                    // ref to job-posting
    profileId: string,                // ref to candidate profile
    overallScore: number,             // 0.0 - 1.0
    skillOverlapScore: number,
    budgetFitScore: number,
    timezoneFitScore: number,
    clientReputationScore: number,    // based on client-profile history
    competitionScore: number,         // estimated competition level
    hardGateFailed: boolean,
    hardGateReasons: string[],
    scoredAt: datetime,
    scoredByAgentId: string,
    version: number                   // increments if re-scored
  }
}
```

**Explanation layer** — makes scores auditable, not just numbers
```ts
// match-explanation
{
  type: "match-explanation",
  fields: {
    matchScoreId: string,
    dimension: string,               // "skillOverlap", "budgetFit", etc.
    score: number,
    reasoning: string,               // human-readable explanation
    evidenceIds: string[],           // bio-claim or portfolio-item ids used
    confidence: "high" | "medium" | "low"
  }
}
```

**Hard Gates** — absolute disqualifiers
```ts
// hard-gate
{
  type: "hard-gate",
  fields: {
    name: string,
    condition: string,               // e.g. "budgetAmount < rateCard.hourlyMin * 10"
    reason: string,                  // shown in explanation
    severity: "block" | "warn",      // block = never apply, warn = flag but allow
    isActive: boolean,
    appliesTo: string[]              // platforms this gate applies to, empty = all
  }
}

// hard-gate-result
{
  type: "hard-gate-result",
  fields: {
    matchScoreId: string,
    gateId: string,
    triggered: boolean,
    evaluatedValue: string,          // what the actual value was
    evaluatedAt: datetime
  }
}
```

**Preferences** — soft biases that shift scoring weight
```ts
// match-preference
{
  type: "match-preference",
  fields: {
    name: string,
    field: string,                   // which job-posting field this affects
    direction: "prefer" | "avoid",
    weight: number,                  // 0.0 - 1.0, how much it shifts score
    value: string,                   // what value to prefer or avoid
    isActive: boolean
  }
}
```

**Shortlist** — the output of a scoring cycle
```ts
// shortlist
{
  type: "shortlist",
  fields: {
    name: string,
    createdAt: datetime,
    createdByAgentId: string,
    jobIds: string[],
    matchScoreIds: string[],
    rationale: string,               // why these were selected
    status: "pending" | "reviewed" | "actioned" | "expired",
    reviewedBy: string,
    reviewedAt: datetime
  }
}
```

**Score History** — tracks re-scoring over time
```ts
// score-history-entry
{
  type: "score-history-entry",
  fields: {
    jobId: string,
    matchScoreId: string,
    overallScore: number,
    recordedAt: datetime,
    changeReason: string             // "profile updated", "job edited", "re-scored"
  }
}
```

---

## Relations

```
match-score         --explains_via-->       match-explanation
match-score         --evaluated_by-->       hard-gate-result
match-score         --belongs_to-->         shortlist
match-score         --references-->         job-posting
match-score         --references-->         bio-claim
match-score         --references-->         portfolio-item
hard-gate           --produces-->           hard-gate-result
match-preference    --influences-->         match-score
score-history-entry --tracks-->             match-score
shortlist           --triggers-->           task (propose for these jobs)
```

---

## How It Connects to Other Toolboxes

`minions-match` sits between discovery and action — it reads from several toolboxes and feeds into others:

```
reads from:
  minions-jobs      → job-posting, job-signal (raw material to score)
  minions-profile   → bio-claim, skill-claim, portfolio-item, rate-card, availability

writes to:
  minions-tasks     → spawns a task per shortlisted job: "generate proposal"
  minions-pipeline  → advances job-posting to "shortlisted" stage
  minions-approvals → if a borderline score needs human judgment before proceeding
  minions-memory    → stores win/loss outcomes to improve future scoring

consumed by:
  minions-proposals → ProposalWriter reads match-explanation to know what to emphasize
  minions-clients   → client-reputation feeds back into clientReputationScore over time
```

The `match-explanation` → `proposal-draft` connection is particularly important. Rather than the ProposalWriter starting from scratch, it reads which `evidenceIds` scored highest in the match and leads the proposal with exactly those portfolio items and bio claims.

---

## Agent SKILLS for `minions-match`

```markdown
# MatchAgent Skills

## Context
You are MatchAgent. You own the minions-match toolbox. You read from
minions-jobs and minions-profile but never write to them. You write
match-score, match-explanation, hard-gate-result, shortlist, and
score-history-entry Minions. You report shortlists to the Orchestrator.

## Skill: Evaluate Hard Gates
1. Load all active `hard-gate` Minions
2. For each new `job-posting`, evaluate every gate condition
3. Create a `hard-gate-result` Minion for each gate evaluated
4. If any gate with severity "block" is triggered:
   - Set hardGateFailed = true on the match-score
   - Stop scoring — do not proceed to soft scoring
   - Update job-posting status to "disqualified"
5. If a "warn" gate triggers, continue scoring but flag in explanations

## Skill: Score a Job
1. Only score jobs where hardGateFailed == false
2. Load all `bio-claim`, `skill-claim`, `portfolio-item`, `rate-card`,
   and `availability` Minions from minions-profile
3. Load `job-signal` for this job-posting
4. Compute each dimension:
   - skillOverlapScore: match mustHaveSkills against skill-claim Minions
   - budgetFitScore: compare budgetAmount against rate-card range
   - timezoneFitScore: compare clientCountry against availability timezone
   - clientReputationScore: check if client-profile exists and its rating
   - competitionScore: infer from platform, budget, and job age
5. Weight dimensions using active `match-preference` Minions
6. Compute overallScore as weighted average
7. Create `match-score` Minion with all dimension scores

## Skill: Explain a Score
1. For each scored dimension, create a `match-explanation` Minion:
   - State the reasoning in plain language
   - List the specific evidenceIds (bio-claim or portfolio-item) used
   - Assign confidence based on how direct the evidence is
2. Explanations must be readable by both humans and the ProposalWriter agent

## Skill: Build Shortlist
1. After scoring a batch of jobs, filter:
   - overallScore >= 0.65
   - hardGateFailed == false
2. Sort by overallScore descending
3. Apply a cap: maximum 10 jobs per shortlist
4. Create a `shortlist` Minion with rationale summarizing why each job made the cut
5. Emit "shortlist-ready" message to Orchestrator with shortlistId

## Skill: Re-score on Profile Change
1. When notified that a bio-claim, skill-claim, or rate-card has changed:
   - Identify all match-score Minions with status "pending" or "shortlisted"
   - Re-score affected jobs
   - Create new score-history-entry Minions recording the change
   - Update shortlist if rankings shift significantly

## Skill: Learn from Outcomes
1. When a job-posting reaches terminal status (won, lost, withdrawn):
   - Record outcome against the match-score
   - Write a memory-item to minions-memory:
     { key: "match-outcome", value: { score, result, platform, skillTags } }
2. Over time this builds a calibration dataset for improving score weights

## Hard Rules
- Never write to minions-jobs or minions-profile
- Never shortlist a job where any "block" hard-gate triggered
- Always create match-explanation Minions before reporting a shortlist —
  the ProposalWriter depends on them
- A match-score without explanations is incomplete and must not be used
```

---

The `clientReputationScore` dimension and the "Learn from Outcomes" skill are worth highlighting — together they mean the MatchAgent gets measurably better over time. Early on it scores purely on profile fit; after a few dozen applications it starts weighting platforms, budget ranges, and skill combinations that historically convert, feeding that signal back through `minions-memory` into future scoring cycles.