## What is an Evaluation in the Minions Context?

Before defining types, it's worth being precise. "Evaluation" can mean very different things depending on who is asking:

```
is this agent output good enough?          → TestCase + TestRun
how does this prompt version compare?      → Benchmark + EvalMetric
what quality dimensions matter here?       → Rubric + RubricCriterion
how has quality changed over time?         → EvalTrend
who or what decided this passed?           → EvalJudgment
```

The core purpose of `minions-evals` is to give the system a **memory of quality** — so agents don't just run, they improve. Every skill, every prompt version, every agent behavior can be measured, compared, and iterated on.

---

## MinionTypes

**Test Definition**
```ts
// test-case
{
  type: "test-case",
  fields: {
    name: string,
    description: string,
    agentId: string,
    skillId: string,
    promptVersionRef: string,      // links to minions-prompts version
    inputs: Record<string, any>,   // what goes in
    expectedOutputs: Record<string, any>, // what should come out
    rubricId: string,              // how to judge the output
    tags: string[],
    status: "active" | "draft" | "deprecated",
    createdAt: datetime,
    createdBy: string
  }
}

// rubric
{
  type: "rubric",
  fields: {
    name: string,
    description: string,
    criteriaIds: string[],         // ordered list of rubric-criterion ids
    passingThreshold: number,      // minimum weighted score to pass
    version: number,
    isActive: boolean
  }
}

// rubric-criterion
{
  type: "rubric-criterion",
  fields: {
    rubricId: string,
    name: string,                  // e.g. "Relevance", "Factual Accuracy"
    description: string,           // what does good look like for this criterion
    weight: number,                // relative importance 0–1
    scoringGuide: string,          // instructions for the judge
    minScore: number,
    maxScore: number
  }
}
```

**Execution**
```ts
// test-run
{
  type: "test-run",
  fields: {
    testCaseId: string,
    agentRunId: string,            // links to minions-agents agent-run
    promptVersionRef: string,
    actualOutput: Record<string, any>,
    passed: boolean,
    totalScore: number,
    maxPossibleScore: number,
    ranAt: datetime,
    durationMs: number,
    judgeType: "llm" | "human" | "heuristic"
  }
}

// eval-judgment
{
  type: "eval-judgment",
  fields: {
    testRunId: string,
    criterionId: string,
    score: number,
    maxScore: number,
    rationale: string,             // why this score was given
    judgedBy: string,              // agent id or human id
    judgedByType: "llm" | "human" | "heuristic",
    judgedAt: datetime,
    confidence: number             // how confident is the judge 0–1
  }
}
```

**Benchmarking**
```ts
// benchmark
{
  type: "benchmark",
  fields: {
    name: string,
    description: string,
    testCaseIds: string[],
    dimension: string,             // "proposal quality", "job scoring accuracy"
    passingThreshold: number,
    ownerId: string,
    lastRunAt: datetime,
    lastScore: number,
    status: "active" | "retired"
  }
}

// benchmark-run
{
  type: "benchmark-run",
  fields: {
    benchmarkId: string,
    testRunIds: string[],
    overallScore: number,
    passRate: number,              // % of test cases passed
    ranAt: datetime,
    triggeredBy: string,           // agent id, human, or schedule id
    notes: string
  }
}
```

**Trend & Comparison**
```ts
// eval-trend
{
  type: "eval-trend",
  fields: {
    benchmarkId: string,
    dimension: string,
    dataPoints: string,            // serialized { date, score }[]
    direction: "improving" | "degrading" | "stable",
    lastComputedAt: datetime
  }
}

// prompt-comparison
{
  type: "prompt-comparison",
  fields: {
    benchmarkId: string,
    promptVersionA: string,
    promptVersionB: string,
    scoreA: number,
    scoreB: number,
    winner: string,                // version ref of winner
    sampleSize: number,
    comparedAt: datetime,
    notes: string
  }
}
```

**Failure Analysis**
```ts
// eval-failure
{
  type: "eval-failure",
  fields: {
    testRunId: string,
    failureType: "wrong-output" | "hallucination" | "format-error" | "timeout" | "refusal",
    description: string,
    affectedCriterionIds: string[],
    severity: "critical" | "major" | "minor",
    rootCause: string,
    resolvedAt: datetime,
    resolutionNotes: string
  }
}
```

---

## Relations

```
test-case           --evaluated_by-->       rubric
test-case           --produces-->           test-run
rubric              --composed_of-->        rubric-criterion
test-run            --contains-->           eval-judgment
eval-judgment       --scores-->             rubric-criterion
benchmark           --groups-->             test-case
benchmark           --produces-->           benchmark-run
benchmark-run       --aggregates-->         test-run
benchmark           --tracked_by-->         eval-trend
eval-failure        --originated_from-->    test-run
prompt-comparison   --references-->         benchmark-run
```

---

## How It Connects to Other Toolboxes

`minions-evals` sits downstream of everything — it observes and measures but never initiates:

```
minions-agents      → agent-run is referenced by test-run
                      every agent run can optionally trigger eval

minions-skills      → skill-definition has promptRef
                      evals measure whether a skill meets its quality gates

minions-prompts     → promptVersionRef links test-case and test-run
                      prompt-comparison directly drives A/B decisions here

minions-proposals   → proposal-draft scores feed into rubric-criterion scores
                      "did the proposal pass the relevance criterion?"

minions-memory      → eval-failure and lessons from test-runs feed back
                      as memory-items for long-term agent improvement

minions-tasks       → a failed benchmark-run can spawn a task:
                      "investigate why proposal relevance score dropped"
```

---

## Agent SKILLS for `minions-evals`

```markdown
# EvalAgent Skills

## Context
You are the EvalAgent. You measure quality across the entire fleet.
You do not run jobs, write proposals, or submit applications.
You observe outputs, score them against rubrics, track trends, and
surface regressions before they cause real-world failures.
All data you work with lives in minions-evals.
You read agent-run outputs from minions-agents and prompt versions
from minions-prompts. You write only to minions-evals.

## Skill: Run a Test Case
1. Load the `test-case` Minion and its linked `rubric`
2. Load the `rubric-criterion` Minions for that rubric
3. Retrieve the actual output from the linked `agent-run` in minions-agents
4. For each criterion: score the output using the scoringGuide
   - If judgeType is "llm": call yourself as judge with the criterion description
   - If judgeType is "heuristic": apply rule-based scoring logic
   - If judgeType is "human": create an approval-request in minions-approvals
5. Create one `eval-judgment` Minion per criterion
6. Compute totalScore as weighted sum across all criteria
7. Mark passed = true if totalScore >= rubric.passingThreshold
8. Create the `test-run` Minion with full results

## Skill: Run a Benchmark
1. Load the `benchmark` Minion and its testCaseIds
2. For each test case: execute Skill: Run a Test Case
3. Aggregate all test-run results into a `benchmark-run` Minion
4. Compute overallScore and passRate
5. Update benchmark.lastRunAt and benchmark.lastScore
6. If passRate dropped more than 10% from previous run:
   - Create an eval-failure Minion with severity "critical"
   - Create a task in minions-tasks: "Investigate benchmark regression"
   - Notify Orchestrator via agent-message

## Skill: Detect Trends
1. On each benchmark-run completion, load the `eval-trend` for that benchmark
2. Append the new score as a data point
3. Compute direction over last 5 data points:
   - Improving: consistent upward slope
   - Degrading: consistent downward slope
   - Stable: variance within 5%
4. Update the `eval-trend` Minion
5. If direction is "degrading" for 3 consecutive runs:
   - Escalate to Orchestrator with full trend data

## Skill: Compare Prompt Versions
1. On receiving a "compare-prompts" instruction from Orchestrator:
   - Load benchmark and both prompt version refs
   - Run the full benchmark once per prompt version
   - Create a `prompt-comparison` Minion with both scores
   - Set winner to the higher-scoring version
2. Emit "comparison-complete" to Orchestrator with recommendation

## Skill: Classify Failures
1. For any test-run where passed = false:
   - Analyze the gap between expected and actual output
   - Classify failure type: wrong-output, hallucination, format-error,
     timeout, or refusal
   - Identify which criteria were most affected
   - Estimate root cause from the agent-run toolCallsLog
   - Create an `eval-failure` Minion with full analysis
2. Store key findings as memory-items in minions-memory
   so the relevant agent learns from the failure next session

## Hard Rules
- Never modify agent outputs — only observe and score
- Never approve a prompt version change without a benchmark-run showing improvement
- Always create an eval-failure Minion for any passed = false test-run
- Every judgment must include a rationale — scores without reasoning are invalid
- Surface regressions immediately, do not wait for scheduled runs
```

---

The `eval-judgment` rationale field is the most important detail here — without it you have scores but no insight. An agent that scores a proposal 0.4 on relevance and explains exactly why gives you something actionable. A bare number gives you nothing to iterate on.