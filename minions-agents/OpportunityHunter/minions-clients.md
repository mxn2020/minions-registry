## What is a Client in the Minions Context?

Before defining types, it's worth being precise. A "client" is not just a contact — it's a relationship that evolves over time and is built from multiple data sources:

```
a person or org that posted a job       → ClientProfile
how we first encountered them           → built from job-posting + platform
every touchpoint we've had              → ClientInteraction
patterns we've observed about them      → ClientPreference
the history of work done together       → linked to contracts + applications
how reliable/good they are              → ClientReputation
what we want to do with them next       → linked to tasks + pipeline
```

---

## MinionTypes

**Core**
```ts
// client-profile
{
  type: "client-profile",
  fields: {
    personId: string,              // ref to minions-contacts person
    organizationId: string,        // ref to minions-contacts organization
    platform: string,              // "upwork" | "freelancer" | "malt" | "linkedin"
    platformClientId: string,      // their ID on that platform
    firstSeenAt: datetime,
    firstSeenVia: string,          // ref to job-posting id
    totalJobsPosted: number,       // on platform overall
    totalJobsWithMe: number,       // jobs we applied to from this client
    totalContractsWithMe: number,  // won contracts
    totalValueWithMe: number,      // cumulative earnings
    averageBudget: number,
    rating: number,                // their public platform rating
    myRating: number,              // my private rating of working with them
    status: "prospect" | "active" | "past" | "blocked",
    tags: string[],
    notes: string
  }
}

// client-interaction
{
  type: "client-interaction",
  fields: {
    clientId: string,
    type: "message" | "interview" | "call" | "offer" | "rejection" | "review" | "referral",
    occurredAt: datetime,
    summary: string,
    sentiment: "positive" | "neutral" | "negative",
    threadId: string,              // ref to minions-comms thread
    agentId: string,               // which agent logged this
    isInbound: boolean
  }
}

// client-preference
{
  type: "client-preference",
  fields: {
    clientId: string,
    preference: string,            // "prefers short proposals", "values timezone overlap"
    confidence: "high" | "medium" | "low",
    inferredFrom: string,          // ref to interaction or job-posting id
    inferredBy: string,            // agent id that inferred this
    createdAt: datetime,
    lastConfirmedAt: datetime
  }
}
```

**Reputation & Trust**
```ts
// client-reputation
{
  type: "client-reputation",
  fields: {
    clientId: string,
    platformRating: number,        // public score from platform
    reviewCount: number,
    paymentVerified: boolean,
    averageResponseTimeHours: number,
    hireRate: number,              // % of job posts that result in hire
    repeatHireRate: number,        // % of freelancers rehired
    redFlags: string[],            // "slow payer", "scope creep", "no feedback"
    greenFlags: string[],          // "clear briefs", "fast approval", "fair review"
    updatedAt: datetime
  }
}

// client-review
{
  type: "client-review",
  fields: {
    clientId: string,
    contractId: string,            // ref to minions-contracts
    reviewedBy: string,            // my id
    rating: number,
    body: string,
    isPublic: boolean,
    createdAt: datetime
  }
}
```

**Relationship Development**
```ts
// client-relationship-stage
{
  type: "client-relationship-stage",
  fields: {
    clientId: string,
    stage: "stranger" | "prospect" | "applicant" | "contractor" | "repeat" | "advocate",
    enteredStageAt: datetime,
    previousStage: string,
    trigger: string               // what caused the stage change
  }
}

// client-opportunity
{
  type: "client-opportunity",
  fields: {
    clientId: string,
    type: "new-job" | "upsell" | "referral" | "repeat-hire",
    description: string,
    estimatedValue: number,
    probability: number,
    dueAt: datetime,
    status: "open" | "pursuing" | "won" | "lost",
    jobPostingId: string           // if tied to a specific posting
  }
}
```

**Research & Intelligence**
```ts
// client-research
{
  type: "client-research",
  fields: {
    clientId: string,
    researchedAt: datetime,
    researchedBy: string,          // agent id
    companyWebsite: string,
    linkedInUrl: string,
    recentNews: string,
    techStack: string[],           // inferred from job postings
    hiringPatterns: string,        // "posts monthly", "hires in batches"
    budgetPattern: string,         // "starts low, increases on repeat"
    notes: string
  }
}
```

---

## Relations

```
client-profile          --built_from-->           person (minions-contacts)
client-profile          --built_from-->           organization (minions-contacts)
client-profile          --first_seen_via-->        job-posting (minions-jobs)
client-profile          --has_interaction-->       client-interaction
client-profile          --has_preference-->        client-preference
client-profile          --has_reputation-->        client-reputation
client-profile          --has_review-->            client-review
client-profile          --has_research-->          client-research
client-profile          --at_stage-->              client-relationship-stage
client-profile          --has_opportunity-->       client-opportunity
client-interaction      --references-->            thread (minions-comms)
client-opportunity      --linked_to-->             pipeline-entry (minions-pipeline)
client-review           --references-->            contract (minions-contracts)
```

---

## How It Connects to Other Toolboxes

`minions-clients` sits at the intersection of almost everything:

```
minions-contacts    → person + organization are the raw contact layer
                      client-profile is the richer OpportunityHunter-specific layer on top

minions-jobs        → every job-posting is potentially a first encounter with a client
                      ClientAgent reads job-postings to build/update client-profiles

minions-comms       → every thread and message with a client creates a client-interaction
                      sentiment analysis feeds into client-preference and reputation

minions-contracts   → a won contract updates totalContractsWithMe and totalValueWithMe
                      client-review is written after a contract closes

minions-pipeline    → client-opportunity feeds directly into pipeline-entry
                      stage changes in pipeline can trigger relationship-stage updates

minions-approvals   → blocking a client or marking red flags may require approval
                      before automated actions are restricted for that client

minions-proposals   → client-preference directly informs ProposalWriter
                      "this client prefers short proposals with budget acknowledgment"
```

---

## Agent SKILLS for `minions-clients`

```markdown
# ClientAgent Skills

## Context
You manage the minions-clients store. You build client profiles from
interactions across all other toolboxes. You never fabricate reputation
data — everything traces to a source. You are the system's institutional
memory for every person or organization that has ever posted a job.

## Skill: Build Client Profile
- When a new `job-posting` appears with an unrecognized clientId:
  1. Check minions-contacts for an existing person or organization match
  2. If none exists, create a new person/organization Minion in minions-contacts
  3. Create a `client-profile` Minion with firstSeenVia = jobPostingId
  4. Fetch platform reputation data if available (rating, hireRate, paymentVerified)
  5. Create a `client-reputation` Minion
  6. Set relationship stage to "stranger"

## Skill: Enrich Client From Job History
- When a client has multiple job-postings:
  1. Analyze posting patterns: frequency, budget ranges, skill requirements
  2. Update `client-research` with inferred techStack and hiringPatterns
  3. Look for preference signals: proposal length in successful hires,
     response time patterns, screening question style
  4. Create or update `client-preference` Minions with confidence scores

## Skill: Log Interaction
- On any inbound or outbound message via minions-comms:
  1. Identify the client from thread participants
  2. Create a `client-interaction` Minion with type, sentiment, and summary
  3. If sentiment is negative and it is the second negative interaction:
     add "communication friction" to redFlags in client-reputation
  4. If client replies quickly and positively: update averageResponseTimeHours

## Skill: Infer Preferences
- After each interaction or contract:
  1. Review the interaction history for this client
  2. Extract preference signals: what did they respond well to?
     What questions did they ask? What did they complain about?
  3. Create or update `client-preference` Minions
  4. Set confidence based on how many data points support the inference
  5. Pass updated preferences to ProposalAgent for future proposals

## Skill: Advance Relationship Stage
- Monitor triggers that indicate a stage change:
  - First application submitted → "stranger" to "prospect"
  - Client replies to proposal → "prospect" to "applicant"
  - Contract awarded → "applicant" to "contractor"
  - Second contract → "contractor" to "repeat"
  - Client refers another client → "repeat" to "advocate"
- On each trigger: create a `client-relationship-stage` Minion
- Notify Orchestrator of stage advancement for any client

## Skill: Identify Opportunities
- Periodically review all active client-profiles:
  1. Check if a repeat client has posted new jobs
  2. Check if a past contractor has gone quiet — flag for follow-up
  3. Identify upsell opportunities from ongoing contracts
  4. Create `client-opportunity` Minions for each identified opportunity
  5. Emit "opportunity-identified" to Orchestrator with clientId and type

## Skill: Flag Risk
- Automatically flag a client if:
  - platformRating < 4.0
  - hireRate < 0.2 (posts but rarely hires)
  - paymentVerified == false
  - two or more redFlags accumulated
- On flag: add tag "high-risk" to client-profile
- Create an approval-request before submitting any proposal to a flagged client

## Hard Rules
- Never delete a client-profile — set status to "blocked" with a reason instead
- Never invent reputation data — only record what is sourced from a platform or interaction
- Always link client-preference back to the inferredFrom source
- A client flagged as "blocked" must never receive an automated action without
  explicit human approval
```

---

The `client-preference` type feeding directly into `ProposalAgent` is the most valuable connection here — over time the system builds a per-client playbook that makes each subsequent proposal sharper than the last, without you having to manually brief the writer every time.