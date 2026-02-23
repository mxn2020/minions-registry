## What is Communication in the Minions Context?

Before defining types, it's worth being precise. "Communication" spans several distinct concepts:

```
a single message sent or received        → Message
a grouped conversation                   → Thread
a planned outreach action                → Follow-up
an outbound system alert                 → Notification
a scheduled call or meeting              → Call
a drafted but unsent message             → Message-Draft
```

---

## MinionTypes

**Core**

```ts
// message
{
  type: "message",
  fields: {
    threadId: string,
    authorId: string,
    authorType: "human" | "agent",
    body: string,
    sentAt: datetime,
    platform: "upwork" | "freelancer" | "linkedin" | "email" | "telegram" | "whatsapp" | "other",
    status: "sent" | "delivered" | "read" | "failed",
    isInbound: boolean,         // true = client sent it, false = you/agent sent it
    contextRefType: string,     // what this message is about
    contextRefId: string
  }
}

// thread
{
  type: "thread",
  fields: {
    topic: string,
    platform: string,
    participantIds: string[],   // person or agent ids
    contextRefType: string,     // "application", "contract", "job-posting"
    contextRefId: string,
    status: "active" | "waiting" | "closed" | "archived",
    createdAt: datetime,
    lastMessageAt: datetime,
    sentiment: "positive" | "neutral" | "negative" | "unknown"
  }
}
```

**Drafting**

```ts
// message-draft
{
  type: "message-draft",
  fields: {
    threadId: string,
    authorAgentId: string,
    body: string,
    intent: "reply" | "follow-up" | "introduction" | "closing" | "clarification",
    promptVersionRef: string,   // which prompt generated this
    status: "draft" | "approved" | "sent" | "discarded",
    createdAt: datetime,
    approvalRequestId: string   // links to minions-approvals
  }
}
```

**Follow-ups**

```ts
// follow-up
{
  type: "follow-up",
  fields: {
    threadId: string,
    contextRefType: string,
    contextRefId: string,
    reason: string,             // "no reply after 5 days"
    dueAt: datetime,
    status: "pending" | "sent" | "cancelled" | "snoozed",
    assignedTo: string,
    assigneeType: "human" | "agent",
    snoozeUntil: datetime
  }
}

// follow-up-plan
{
  type: "follow-up-plan",
  fields: {
    contextRefType: string,     // "application", "contract-negotiation"
    contextRefId: string,
    steps: string[],            // ordered follow-up ids
    currentStepIndex: number,
    status: "active" | "completed" | "abandoned",
    createdAt: datetime
  }
}
```

**Notifications**

```ts
// notification
{
  type: "notification",
  fields: {
    recipientId: string,
    channel: "telegram" | "whatsapp" | "email" | "discord" | "slack",
    subject: string,
    body: string,
    sentAt: datetime,
    deliveryStatus: "pending" | "sent" | "delivered" | "failed",
    contextRefType: string,
    contextRefId: string,
    requiresReply: boolean      // true = waiting for human input
  }
}
```

**Calls & Meetings**

```ts
// call-brief
{
  type: "call-brief",
  fields: {
    threadId: string,
    clientId: string,
    scheduledAt: datetime,
    durationMinutes: number,
    agenda: string,             // agent-generated prep notes
    keyQuestions: string[],     // what to ask the client
    contextRefType: string,
    contextRefId: string,
    outcome: string,            // filled in after the call
    recordingUrl: string
  }
}

// call-note
{
  type: "call-note",
  fields: {
    callBriefId: string,
    body: string,               // raw notes during/after call
    actionItems: string[],      // tasks spawned from this call
    takenBy: string,
    takenAt: datetime
  }
}
```

**Analytics**

```ts
// comms-metric
{
  type: "comms-metric",
  fields: {
    periodStart: datetime,
    periodEnd: datetime,
    totalMessagesSent: number,
    totalMessagesReceived: number,
    averageResponseTimeHours: number,
    threadsOpened: number,
    threadsClosed: number,
    followUpsSent: number,
    sentimentBreakdown: string  // serialized positive/neutral/negative counts
  }
}
```

---

## Relations

```
thread            --contains-->          message
thread            --has_draft-->         message-draft
thread            --has_follow_up-->     follow-up
follow-up         --part_of-->           follow-up-plan
thread            --linked_to-->         call-brief
call-brief        --has_notes-->         call-note
message-draft     --pending-->           approval-request  (minions-approvals)
notification      --triggered_by-->      agent-run         (minions-agents)
thread            --belongs_to-->        application       (minions-applications)
thread            --belongs_to-->        client-profile    (minions-clients)
call-note         --spawns-->            task              (minions-tasks)
```

---

## How It Connects to Other Toolboxes

```
minions-applications    → each application can have one or more threads
minions-clients         → threads build client-profile history over time
minions-approvals       → every message-draft routes through an approval-request
                          before sending
minions-agents          → notifications are triggered by agent-runs
minions-tasks           → call-notes spawn tasks, follow-ups create tasks
                          when overdue
minions-pipeline        → a client reply moves a pipeline-entry forward
                          a thread going silent triggers a follow-up-plan
```

The thread `sentiment` field is the key feedback signal — as the CommsAgent reads inbound messages and updates sentiment, the PipelineAgent and OrchestratorAgent use that signal to decide whether to escalate, follow up, or close out an opportunity.

---

## Agent SKILLS for `minions-comms`

```markdown
# CommsAgent Skills

## Context
You manage all communication data within the Minions ecosystem.
You read threads, messages, drafts, follow-ups, and notifications.
You write only to minions-comms. You never send anything without
an approved approval-request from minions-approvals.
All factual claims in drafted messages must trace to verified
bio-claim or portfolio-item Minions in minions-profile.

## Skill: Monitor Inbound Messages
1. Poll each active platform for new inbound messages
2. Match to existing thread by platform + participantIds + contextRef
   - If no thread exists: create a new thread Minion
3. Create a message Minion for each inbound message
4. Update thread.lastMessageAt and thread.status
5. Analyze sentiment of inbound message body
   - Update thread.sentiment accordingly
6. Emit "inbound-message-received" to OrchestratorAgent
   with threadId and sentiment

## Skill: Draft Reply
1. On receiving "draft-reply" instruction with threadId and intent:
2. Load thread + last 10 messages for context
3. Load contextRef Minion (application, job-posting, contract)
4. Load relevant portfolio-item and bio-claim Minions if intent
   requires referencing experience
5. Use prompt template from minions-prompts matching the intent
6. Generate message-draft Minion with body + promptVersionRef
7. Create approval-request Minion in minions-approvals
8. Send notification to human via minions-openclaw
   with draft body and approve/reject action

## Skill: Send Approved Message
1. On approval-request status changing to "approved":
2. Load message-draft Minion
3. Navigate to platform via browser tool
4. Send message and record platform confirmation
5. Create message Minion with status "sent"
6. Update message-draft status to "sent"
7. Update thread.lastMessageAt

## Skill: Manage Follow-up Plans
1. On "application-submitted" event: create follow-up-plan
   with steps:
   - Step 1: follow-up after 5 days if no reply
   - Step 2: final follow-up after 10 days if still no reply
   - Step 3: close thread after 15 days
2. On each scheduler tick: check all pending follow-up Minions
   where dueAt <= now and status == "pending"
3. For each due follow-up: emit "draft-reply" with
   intent "follow-up" to self
4. If follow-up-plan reaches final step with no reply:
   update thread.status to "archived"
   emit "opportunity-closed" to PipelineAgent

## Skill: Prepare Call Brief
1. On receiving "prepare-call-brief" with threadId and scheduledAt:
2. Load thread + all messages + contextRef Minion
3. Load client-profile from minions-clients
4. Generate call-brief Minion:
   - agenda: summarize open questions and context
   - keyQuestions: 3-5 specific things to clarify with client
5. Send notification to human with call-brief content

## Skill: Process Call Notes
1. On receiving raw call notes from human:
2. Create call-note Minion linked to call-brief
3. Extract action items from notes
4. For each action item: create task Minion in minions-tasks
   with contextRef pointing to the call-brief
5. Update client-profile notes in minions-clients
6. Emit "call-complete" to OrchestratorAgent

## Skill: Compute Comms Metrics
1. On daily schedule trigger from minions-scheduler:
2. Aggregate all message Minions from last 24 hours
3. Calculate averageResponseTimeHours from inbound → outbound pairs
4. Count threads by status and sentiment
5. Create comms-metric Minion for the period
6. Include in OrchestratorAgent daily briefing

## Hard Rules
- Never send a message without an approval-request with
  status "approved" — no exceptions
- Never fabricate client statements — only use actual
  message body content when summarizing
- Never close a thread without notifying the OrchestratorAgent
- Max 3 follow-up attempts per thread before escalating to human
- Always update thread.sentiment after every inbound message
```

---

The `follow-up-plan` is worth highlighting as the most operationally valuable type here — it encodes the entire post-application communication strategy as a structured Minion rather than hardcoded agent logic, which means you can edit the plan (change timing, add steps, adjust tone intent) purely as data without touching any agent code.