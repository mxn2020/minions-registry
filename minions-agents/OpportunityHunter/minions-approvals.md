## What is an Approval in the Minions Context?

Before defining types, it's worth being precise. "Approval" can mean several different things:

```
something waiting for a human decision    → ApprovalRequest
the rule that triggered the requirement   → ApprovalPolicy
the decision itself                       → logged on ApprovalRequest
a record that it happened                 → AuditLogEntry
an escalation when no one responds        → ApprovalEscalation
a delegated authority                     → ApprovalDelegate
```

The core principle of this toolbox: **nothing irreversible happens without a logged human decision**. Every approval request is immutable once decided, and every action taken on the back of an approval is traceable back to it.

---

## MinionTypes

**Core**
```ts
// approval-request
{
  type: "approval-request",
  fields: {
    title: string,
    description: string,           // human-readable summary of what will happen
    requestedBy: string,           // agent id or person id
    requestedAt: datetime,
    requiredBy: datetime,          // deadline for decision
    contextRefType: string,        // "proposal-draft", "agent-run", "application", etc.
    contextRefId: string,
    payload: Record<string, any>,  // full data snapshot of what will be acted on
    decision: "pending" | "approved" | "rejected" | "expired",
    decidedBy: string,
    decidedAt: datetime,
    decisionNotes: string,
    policyId: string               // which policy triggered this requirement
  }
}

// approval-policy
{
  type: "approval-policy",
  fields: {
    name: string,
    description: string,
    actionType: string,            // "submit-application", "send-message", "accept-contract"
    condition: string,             // e.g. "budget > 5000 || platform == upwork"
    requiredApproverRole: string,  // "owner", "reviewer", "any-human"
    timeoutHours: number,          // how long before it expires
    onTimeout: "expire" | "auto-approve" | "escalate",
    isActive: boolean
  }
}
```

**Audit**
```ts
// audit-log-entry
{
  type: "audit-log-entry",
  fields: {
    actorId: string,
    actorType: "human" | "agent",
    action: string,                // "submitted-application", "approved-proposal"
    contextRefType: string,
    contextRefId: string,
    timestamp: datetime,
    payload: Record<string, any>,  // snapshot of state at time of action
    approvalRequestId: string,     // ref if action was approval-gated
    ipAddress: string
  }
}
```

**Escalation & Delegation**
```ts
// approval-escalation
{
  type: "approval-escalation",
  fields: {
    approvalRequestId: string,
    escalatedAt: datetime,
    reason: string,                // "no response within 4 hours"
    escalatedTo: string,
    escalationChannel: string,     // "telegram", "email", "whatsapp"
    resolved: boolean,
    resolvedAt: datetime
  }
}

// approval-delegate
{
  type: "approval-delegate",
  fields: {
    delegatorId: string,
    delegateId: string,
    actionTypes: string[],         // which action types they can approve
    validFrom: datetime,
    validUntil: datetime,
    isActive: boolean,
    reason: string                 // "on holiday", "out of office"
  }
}
```

**History**
```ts
// approval-history-entry
{
  type: "approval-history-entry",
  fields: {
    approvalRequestId: string,
    changedAt: datetime,
    changedBy: string,
    field: string,
    from: any,
    to: any
  }
}
```

---

## Relations

```
approval-request    --governed_by-->     approval-policy
approval-request    --references-->      contextRef (any Minion)
approval-request    --triggered-->       audit-log-entry
approval-request    --escalated_via-->   approval-escalation
approval-request    --decided_by-->      person (or agent)
approval-delegate   --delegates_for-->   person
approval-policy     --applies_to-->      action types across all minions
audit-log-entry     --traces-->          approval-request
```

---

## How It Connects to Other Toolboxes

`minions-approvals` is unique in that it is **written to by other toolboxes but owned by none of them**. Every domain toolbox that has an irreversible action routes through here:

```
minions-proposals    → approval-request before proposal is submitted
minions-applications → approval-request before application bundle is sent
minions-comms        → approval-request before follow-up message is sent
minions-contracts    → approval-request before terms are accepted
minions-agents       → approval-request before any agent policy change
```

The `contextRefType` + `contextRefId` pattern means the approval request always carries a pointer back to exactly what will be acted on, and the `payload` field snapshots the full state at request time — so even if the underlying Minion changes, the approval record is immutable.

The `audit-log-entry` is the write-once companion to every approval — it records not just the decision but every consequential action taken across the entire system, whether approval-gated or not.

---

## Agent SKILLS for `minions-approvals`

```markdown
# ApprovalAgent Skills

## Context
You manage all approval flows in the Minions ecosystem. You are the
gatekeeper between agent-generated actions and irreversible execution.
You never approve on behalf of the human — you surface, track, escalate,
and record. The human always decides.

## Skill: Evaluate Whether Approval Is Required
1. When any agent proposes an action, check all active `approval-policy`
   Minions where actionType matches
2. Evaluate the condition expression against the action payload
3. If any policy matches: create an `approval-request` Minion with status
   "pending" and full payload snapshot
4. If no policy matches: log directly to `audit-log-entry` and allow
5. Never skip this check for actions tagged as irreversible

## Skill: Notify for Pending Approvals
1. On creation of any `approval-request` with status "pending":
   - Send notification via minions-comms to the required approver
   - Include: title, description, payload summary, requiredBy deadline
   - Include direct approve/reject action links if platform supports it
2. Record notification in audit-log-entry

## Skill: Handle Decision
1. On receiving approve or reject signal (from human via any channel):
   - Update `approval-request` decision, decidedBy, decidedAt, decisionNotes
   - Create `audit-log-entry` recording the decision
   - Emit decision event to the requesting agent via minions-agents message bus
2. If approved: requesting agent may proceed with execution
3. If rejected: requesting agent archives the pending action, no execution

## Skill: Handle Expiry
1. On schedule: check all `approval-request` Minions with status "pending"
   where requiredBy has passed
2. Look up the governing `approval-policy` onTimeout rule:
   - "expire": set decision to "expired", notify requester, block action
   - "auto-approve": set decision to "approved", log with note "auto-approved
     on timeout", emit approval to requesting agent
   - "escalate": create `approval-escalation` Minion, notify escalation target
     via a higher-priority channel, extend requiredBy

## Skill: Manage Escalations
1. On creation of `approval-escalation`:
   - Notify escalation target via the specified escalationChannel
   - Mark escalation as unresolved
2. On decision after escalation:
   - Mark `approval-escalation` resolved, resolvedAt = now
   - Proceed with normal decision handling

## Skill: Manage Delegates
1. On receiving "set delegate" instruction:
   - Create `approval-delegate` Minion with validFrom, validUntil, actionTypes
   - Any approval requests of the specified actionTypes during that window
     are routed to the delegate instead of the owner
2. On expiry of delegate window:
   - Set isActive to false
   - Resume routing to owner

## Skill: Audit Logging
1. Every consequential system action — approved or not — gets an
   `audit-log-entry` Minion created
2. Fields always populated: actorId, actorType, action, contextRef,
   timestamp, payload snapshot
3. Audit log entries are never modified or deleted
4. On request: produce a filtered audit trail by actorId, contextRef,
   action type, or time range

## Hard Rules
- Never modify an audit-log-entry after creation
- Never approve or reject on behalf of a human
- Never allow an action tagged irreversible to proceed without a logged
  approval-request with decision "approved"
- Always snapshot the full payload at request time, not at decision time
- If approval-policy evaluation fails or errors, default to requiring approval
```

---

The `payload` snapshot rule at the bottom is the most important detail operationally — it means your audit trail shows exactly what was approved, not what eventually got submitted after potential edits. That gap between request-time state and execution-time state is where trust breaks down in most automation systems.