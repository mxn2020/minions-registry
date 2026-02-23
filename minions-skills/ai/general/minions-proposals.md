---
name: minions-proposals
id: OC-0145
version: 1.0.0
description: "Proposal drafts, answer sets, scoring, and prompt version references"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-proposals — Agent Skills

## What is a Proposal in the Minions Context?

A "proposal" sounds simple but covers several distinct concepts that need separating:

```
a reusable scaffold for writing proposals    → ProposalTemplate
a generated proposal for a specific job      → ProposalDraft
a previous version before revision           → ProposalRevision
answers to platform screening questions      → AnswerSet
how good the proposal is                     → ProposalScore
what gets sent to the platform               → SubmissionPackage
did it work                                  → ProposalOutcome
```

---

## MinionTypes

**Templates**
```ts
// proposal-template
{
  type: "proposal-template",
  fields: {
    name: string,
    platform: "upwork" | "freelancer" | "malt" | "contra" | "linkedin" | "other",
    style: "concise" | "detailed" | "technical" | "consultative",
    body: string,               // scaffold with {{placeholders}}
    placeholders: string[],     // ["{{client_name}}", "{{key_skill}}", "{{relevant_project}}"]
    promptVersionRef: string,   // pinned version from minions-prompts
    isActive: boolean,
    createdAt: datetime,
    updatedAt: datetime
  }
}
```

**Drafts**
```ts
// proposal-draft
{
  type: "proposal-draft",
  fields: {
    jobId: string,              // ref to job-posting
    templateId: string,         // ref to proposal-template
    matchScoreId: string,       // ref to match-score used to inform writing
    version: number,
    body: string,
    status: "draft" | "revised" | "approved" | "submitted" | "archived",
    promptVersionRef: string,
    createdAt: datetime,
    revisedAt: datetime,
    createdBy: string           // agent id
  }
}

// proposal-revision
{
  type: "proposal-revision",
  fields: {
    proposalId: string,
    version: number,
    body: string,
    savedAt: datetime,
    savedBy: string,            // agent or human id
    changeReason: string        // "compliance check failed", "human edit", "score too low"
  }
}
```

**Screening Questions**
```ts
// answer-set
{
  type: "answer-set",
  fields: {
    proposalId: string,
    jobId: string,
    questions: string[],        // raw questions extracted from job posting
    answers: string[],          // generated answers, index-matched to questions
    generatedAt: datetime,
    reviewedAt: datetime,
    status: "draft" | "approved"
  }
}
```

**Scoring**
```ts
// proposal-score
{
  type: "proposal-score",
  fields: {
    proposalId: string,
    version: number,
    clarityScore: number,       // 0-1
    relevanceScore: number,     // 0-1: how well it addresses the specific job
    specificityScore: number,   // 0-1: concrete examples vs generic claims
    complianceScore: number,    // 0-1: no fabricated claims, ToS safe
    overallScore: number,       // weighted composite
    flags: string[],            // ["unverified claim detected", "too generic"]
    scoredAt: datetime,
    scoredBy: string            // agent id
  }
}
```

**Submission**
```ts
// submission-package
{
  type: "submission-package",
  fields: {
    proposalId: string,
    applicationId: string,
    proposalBody: string,       // final resolved body, no placeholders
    answerSetId: string,
    resumeDocumentId: string,
    caseStudyIds: string[],     // ref to portfolio-item or document
    attachmentIds: string[],
    assembledAt: datetime,
    approvalRequestId: string,  // must be approved before submitting
    status: "assembling" | "ready" | "submitted"
  }
}
```

**Outcome**
```ts
// proposal-outcome
{
  type: "proposal-outcome",
  fields: {
    proposalId: string,
    applicationId: string,
    result: "no-reply" | "rejected" | "interview" | "won",
    clientFeedback: string,
    followUpSent: boolean,
    resolvedAt: datetime,
    lessons: string             // fed back to memory and eval layers
  }
}
```

---

## Relations

```
proposal-template   --used_by-->          proposal-draft
proposal-draft      --informed_by-->      match-score
proposal-draft      --version_of-->       proposal-revision
proposal-draft      --has_answers-->      answer-set
proposal-draft      --scored_by-->        proposal-score
proposal-draft      --packaged_in-->      submission-package
submission-package  --requires-->         approval-request
proposal-draft      --produced-->         proposal-outcome
proposal-outcome    --feeds-->            memory-item
proposal-outcome    --feeds-->            eval-metric
```

---

## How It Connects to Other Toolboxes

```
minions-jobs          → proposal-draft reads job-posting and job-signal
                        to understand what the client actually wants

minions-profile       → ProposalWriter pulls bio-claim and portfolio-item
                        to populate placeholders honestly

minions-match         → match-score informs which portfolio items to lead with
                        and what skills to emphasize

minions-prompts       → promptVersionRef pins the exact prompt version used
                        enabling A/B comparison across proposals

minions-approvals     → submission-package cannot proceed without an
                        approval-request with decision "approved"

minions-applications  → on approval, ApplicationAgent consumes the
                        submission-package and creates the application record

minions-memory        → proposal-outcome.lessons written to memory-item
                        so future proposals improve over time

minions-evaluations   → proposal-score feeds eval-metric for benchmarking
                        which templates and prompt versions perform best
```

---

## Agent SKILLS for `minions-proposals`

```markdown
# ProposalAgent Skills

## Context
You are the ProposalAgent. You own the minions-proposals toolbox.
You read from minions-jobs, minions-profile, and minions-match.
You write only to minions-proposals.
Every factual claim in a proposal must trace to a verified bio-claim
or portfolio-item. You never fabricate.

## Skill: Select Template
1. Load the job-posting and its job-signal Minions
2. Identify the platform and job style (technical, creative, consulting)
3. Query proposal-template Minions filtered by platform and style
4. Select the active template with the highest historical win rate
   (derived from proposal-outcome Minions linked to this template)
5. Pin the promptVersionRef from the selected template

## Skill: Draft Proposal
1. Load the match-score for this job — note which skills scored highest
   and which portfolio items were flagged as most relevant
2. Load bio-claim Minions (verified only) and portfolio-item Minions
   whose relevantSkillTags overlap with job-signal.mustHaveSkills
3. Resolve all {{placeholders}} in the template body using only
   verified Minion data — never infer or invent
4. Generate answer-set for any screening questions extracted
   from the job-posting description
5. Create proposal-draft Minion with status "draft"

## Skill: Score Draft
1. Evaluate the draft on four dimensions:
   - Clarity: is it easy to read and structured well?
   - Relevance: does it directly address the job-signal signals?
   - Specificity: does it cite concrete projects and outcomes?
   - Compliance: are all claims traceable to verified Minion data?
2. Create a proposal-score Minion with scores and any flags
3. If overallScore < 0.7 or any flag is present → trigger Skill: Revise
4. If overallScore >= 0.7 and no flags → trigger Skill: Assemble Package

## Skill: Revise Draft
1. Load the proposal-score flags
2. Save current body as a proposal-revision Minion before changing anything
3. Address each flag specifically:
   - "too generic" → replace with a concrete portfolio-item outcome
   - "unverified claim" → remove or replace with a verified bio-claim
   - "low relevance" → reorder to lead with must-have skill matches
4. Re-score. Maximum 3 revision cycles before escalating to human review.

## Skill: Assemble Submission Package
1. Create submission-package Minion referencing:
   - approved proposal-draft
   - answer-set
   - resume document (latest from minions-documents)
   - top 2 case study documents matched to this job
2. Set status to "ready"
3. Create approval-request Minion in minions-approvals with full
   package summary and diff vs any previous application to same client

## Skill: Record Outcome
1. When ApplicationAgent reports a result, create proposal-outcome Minion
2. Extract lessons — what worked, what did not, client feedback if any
3. Write a memory-item to minions-memory scoped to this client and platform
4. Write an eval-metric to minions-evaluations linked to the prompt version
   and template used — this feeds the A/B improvement loop

## Hard Rules
- Never populate a placeholder with unverified data
- Never submit a package without a linked approval-request at status "approved"
- Always save a proposal-revision before any edit to an existing draft
- Maximum 10 proposal-drafts created per day across all jobs
- If revision cycles exceed 3, set draft status to "needs-human-review"
  and notify via minions-comms
```

---

The `lessons` field on `proposal-outcome` flowing into both `minions-memory` and `minions-evaluations` is the key feedback loop — over time the ProposalAgent builds a empirical picture of which templates, prompt versions, and portfolio emphasis patterns actually win work, and that knowledge persists across sessions.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-proposals/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
proposals types list

# Show detailed schema for a specific type
proposals types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
proposals create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
proposals create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
proposals list <type>

# Show a specific Minion
proposals show <id>

# Search by text
proposals search "query"

# Output as JSON (for piping)
proposals list --json
proposals show <id> --json
```

### Update

```bash
# Update fields
proposals update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
proposals delete <id>
```

### Stats & Validation

```bash
# Show storage stats
proposals stats

# Validate a Minion JSON file against its schema
proposals validate ./my-minion.json
```