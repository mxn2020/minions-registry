## What is an Application in the Minions Context?

"Application" could mean several different things that need to be separated:

```
the act of applying to a job         → Application
everything packaged to submit        → SubmissionBundle
what happened after submitting       → ApplicationEvent
the current state in the process     → tracked via pipeline-entry
a reply or response from the client  → tracked via minions-comms
```

---

## MinionTypes

**Core**

```ts
// application
{
  type: "application",
  fields: {
    jobId: string,               // ref to job-posting
    proposalId: string,          // ref to proposal-draft
    platform: string,            // "upwork" | "freelancer" | "malt" | "contra" | "linkedin"
    status: string,              // "planned" | "bundled" | "pending-approval" | "submitted" | "withdrawn" | "expired"
    submittedAt: datetime,
    submittedBy: string,         // agentId or userId
    platformReceipt: string,     // confirmation ID or URL from platform
    approvalRequestId: string,   // ref to approval-request in minions-approvals
    bidAmount: number,           // what was quoted
    bidCurrency: string,
    coverLetterSent: boolean,
    attachmentsSent: boolean,
    notes: string
  }
}
```

**Submission Bundle**

```ts
// submission-bundle
{
  type: "submission-bundle",
  fields: {
    applicationId: string,
    proposalId: string,
    resumeDocumentId: string,    // ref to document in minions-documents
    caseStudyIds: string[],      // ref to portfolio-items in minions-profile
    answerSetId: string,         // ref to answer-set in minions-proposals
    attachmentIds: string[],     // ref to attachments in minions-documents
    assembledAt: datetime,
    assembledBy: string,         // agentId
    status: string,              // "assembling" | "ready" | "submitted" | "stale"
    validUntil: datetime         // bundles can go stale if job changes
  }
}
```

**Events**

```ts
// application-event
{
  type: "application-event",
  fields: {
    applicationId: string,
    eventType: string,           // "submitted" | "viewed" | "shortlisted" | "rejected" | "interview-requested" | "offer-made" | "withdrawn"
    occurredAt: datetime,
    notes: string,
    triggeredBy: string,         // agentId or "platform" or userId
    isInbound: boolean           // true = platform told us, false = we triggered it
  }
}

// application-status-change
{
  type: "application-status-change",
  fields: {
    applicationId: string,
    fromStatus: string,
    toStatus: string,
    changedAt: datetime,
    changedBy: string,
    reason: string
  }
}
```

**Platform Context**

```ts
// platform-submission-rule
{
  type: "platform-submission-rule",
  fields: {
    platform: string,
    maxApplicationsPerDay: number,
    maxApplicationsPerWeek: number,
    requiresConnects: boolean,     // Upwork-style credits
    connectsCost: number,
    forbiddenActions: string[],    // e.g. "auto-submit without review"
    requiredFields: string[],      // fields platform mandates
    notes: string,
    lastVerifiedAt: datetime
  }
}

// platform-quota
{
  type: "platform-quota",
  fields: {
    platform: string,
    quotaType: string,             // "connects" | "bids" | "applications"
    total: number,
    used: number,
    remaining: number,
    resetsAt: datetime,
    lastCheckedAt: datetime
  }
}
```

**Outcome**

```ts
// application-outcome
{
  type: "application-outcome",
  fields: {
    applicationId: string,
    result: string,                // "won" | "lost" | "no-response" | "withdrawn"
    decidedAt: datetime,
    clientFeedback: string,
    lostReason: string,            // "price" | "experience" | "timing" | "unknown"
    contractId: string,            // ref to minions-contracts if won
    lessons: string                // fed back to minions-memory
  }
}
```

---

## Relations

```
application          --requires-->          submission-bundle
application          --triggered-->         application-event
application          --changed_via-->       application-status-change
application          --governed_by-->       platform-submission-rule
application          --consumes-->          platform-quota
application          --resulted_in-->       application-outcome
application          --approved_via-->      approval-request (minions-approvals)
submission-bundle    --contains-->          proposal-draft (minions-proposals)
submission-bundle    --contains-->          document (minions-documents)
submission-bundle    --references-->        portfolio-item (minions-profile)
application-outcome  --produced-->          contract (minions-contracts)
application-outcome  --feeds-->             memory-item (minions-memory)
application          --tracked_in-->        pipeline-entry (minions-pipeline)
```

---

## How It Connects to Other Toolboxes

```
minions-jobs          → provides the job-posting the application targets
minions-proposals     → provides the proposal-draft and answer-set
minions-profile       → provides portfolio-items and resume for the bundle
minions-documents     → provides the assembled resume document
minions-approvals     → gates every submission behind a human decision
minions-pipeline      → tracks the application through funnel stages
minions-comms         → captures all inbound/outbound messages post-submission
minions-contracts     → created when application-outcome result is "won"
minions-memory        → receives lessons from application-outcome for learning loop
minions-costs         → logs connect/bid costs from platform-quota consumption
```

The `submission-bundle` is the key aggregation point — it pulls from five different toolboxes into a single packageable unit. Nothing gets submitted unless a bundle exists and an approval has been granted.

---

## Agent SKILLS file (`application-agent.skills.md`)

```markdown
# ApplicationAgent Skills

## Context
You are ApplicationAgent. You own the minions-applications toolbox.
You assemble submission bundles, manage platform quotas, track application
events, and record outcomes. You never submit anything without a logged
approval-request with status "approved" from minions-approvals.
You do not write proposals — that is ProposalAgent's responsibility.
You do not track pipeline stages — that is PipelineAgent's responsibility.

## Skill: Assemble Submission Bundle
1. Receive "assemble-bundle" instruction from Orchestrator with jobId + proposalId
2. Load the approved `proposal-draft` from minions-proposals
3. Load relevant `portfolio-item` Minions from minions-profile
   (match on relevantSkillTags vs job skills)
4. Load the current resume `document` from minions-documents
5. Load the `answer-set` for this proposal from minions-proposals
6. Create a `submission-bundle` Minion with all refs assembled
7. Set status to "ready", set validUntil to 48 hours from now
8. Emit "bundle-ready" to Orchestrator with bundleId

## Skill: Check Platform Quota
1. Before any submission, load the `platform-quota` Minion for the target platform
2. Load the `platform-submission-rule` Minion for the platform
3. If remaining quota = 0 or daily limit reached:
   - Emit "quota-exhausted" to Orchestrator
   - Do not proceed
4. If quota sufficient: proceed and decrement remaining after submission
5. Update `platform-quota` lastCheckedAt and used count

## Skill: Request Submission Approval
1. Create an `approval-request` Minion in minions-approvals:
   - title: "Submit proposal to [job title] on [platform]"
   - payload: full bundle summary (job, proposal body, bid amount, attachments)
   - requiredBy: 24 hours from now
2. Send notification via Orchestrator → CommsAgent with bundle summary
3. Wait for approval-request decision field to become "approved" or "rejected"
4. Never proceed until decision is logged

## Skill: Submit Application
1. Only triggers when approval-request status = "approved"
2. Load the approved `submission-bundle`
3. Check bundle status is "ready" and not past validUntil
   - If stale: emit "bundle-stale" to Orchestrator, request reassembly
4. Create an `application` Minion with status "pending-approval"
5. Execute platform submission via browser tool
6. On success:
   - Record platformReceipt on the application
   - Update application status to "submitted"
   - Create "submitted" `application-event` Minion
   - Log cost entry to minions-costs if platform uses credits
   - Emit "application-submitted" to Orchestrator and PipelineAgent
7. On failure:
   - Update application status to "planned"
   - Create "failed" `application-event` with error notes
   - Emit "submission-failed" to Orchestrator with reason

## Skill: Track Application Events
1. Listen for inbound platform signals (view, shortlist, reject, interview request)
2. For each signal: create an `application-event` Minion
   with isInbound: true and the appropriate eventType
3. Create an `application-status-change` Minion for any status transition
4. Emit event summary to Orchestrator for routing
   - interview-requested → Orchestrator notifies Mehdi directly
   - rejected → record and update pipeline via PipelineAgent
   - offer-made → Orchestrator triggers ContractAgent

## Skill: Record Outcome
1. When an application reaches a terminal event (won, lost, no-response, withdrawn):
2. Create an `application-outcome` Minion with result + lostReason + clientFeedback
3. Write a `memory-item` Minion to minions-memory:
   - key: "outcome-pattern-[platform]-[skillCategory]"
   - value: summary of what worked or didn't
   - confidence: based on how clear the signal was
4. If result = "won": emit "contract-needed" to Orchestrator → ContractAgent
5. Emit "outcome-recorded" to Orchestrator for funnel metrics update

## Skill: Manage Stale Bundles
1. On schedule (daily): scan all submission-bundles with status "ready"
2. If validUntil is past: update status to "stale", notify Orchestrator
3. Orchestrator decides whether to reassemble or abandon

## Hard Rules
- Never submit without approval-request status = "approved"
- Never submit if platform-quota remaining = 0
- Never fabricate a platformReceipt — if submission fails, log it honestly
- Always create an application-event for every status change
- Always write lessons to minions-memory on every terminal outcome
- Max submissions per platform per day governed by platform-submission-rule
```

---

The `platform-quota` and `platform-submission-rule` types are worth highlighting — they make the agent self-governing around platform limits without the Orchestrator needing to track per-platform rules itself. ApplicationAgent owns that knowledge entirely, which keeps the Orchestrator's SKILLS file clean and focused on coordination rather than platform-specific constraints.