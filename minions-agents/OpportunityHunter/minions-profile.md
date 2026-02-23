## What is a Profile in the Minions Context?

A "profile" is not a single record — it's a **living, structured body of evidence** about you. The key distinction from a traditional resume or bio page is that every claim is traceable, every rate is platform-specific, and every skill has a confidence level. Agents read from here constantly but only you (or a trusted ProfileAgent) writes to it.

```
who you are                        → bio-claim
what you have built                → portfolio-item
what you can charge                → rate-card
what you are good at               → skill-claim
when you are available             → availability
how you present yourself           → persona
what others have said about you    → testimonial
what credentials you hold          → credential
```

---

## MinionTypes

**Identity & Claims**
```ts
// bio-claim
{
  type: "bio-claim",
  fields: {
    claim: string,              // "I built a multi-tenant SaaS platform from scratch"
    category: string,           // "engineering", "leadership", "domain-knowledge"
    evidenceUrl: string,        // GitHub, live URL, case study link
    verified: boolean,
    lastVerifiedAt: datetime,
    confidence: "high" | "medium" | "low",
    createdAt: datetime
  }
}

// skill-claim
{
  type: "skill-claim",
  fields: {
    name: string,               // "TypeScript", "System Design", "Client Management"
    category: string,           // "technical", "soft", "domain"
    proficiency: "expert" | "advanced" | "intermediate" | "beginner",
    yearsOfExperience: number,
    lastUsedAt: datetime,
    evidenceIds: string[],      // refs to bio-claims or portfolio-items
    tags: string[]
  }
}
```

**Work Evidence**
```ts
// portfolio-item
{
  type: "portfolio-item",
  fields: {
    title: string,
    summary: string,            // 2-3 sentence human-readable description
    techStack: string[],
    outcomes: string,           // "reduced latency by 40%, saved $12k/month"
    link: string,
    attachmentIds: string[],    // screenshots, PDFs
    ndaProtected: boolean,
    relevantSkillTags: string[],
    clientIndustry: string,
    projectType: "solo" | "team" | "open-source" | "contract",
    year: number
  }
}

// credential
{
  type: "credential",
  fields: {
    name: string,               // "AWS Solutions Architect", "BSc Computer Science"
    issuer: string,
    issuedAt: datetime,
    expiresAt: datetime,
    verificationUrl: string,
    type: "certification" | "degree" | "course" | "award",
    isActive: boolean
  }
}

// testimonial
{
  type: "testimonial",
  fields: {
    authorName: string,
    authorRole: string,
    authorOrganization: string,
    platform: string,           // "Upwork", "LinkedIn", "direct"
    body: string,
    rating: number,
    projectRef: string,         // ref to portfolio-item
    receivedAt: datetime,
    isPublic: boolean
  }
}
```

**Pricing & Availability**
```ts
// rate-card
{
  type: "rate-card",
  fields: {
    platform: string,
    hourlyMin: number,
    hourlyMax: number,
    fixedProjectMin: number,
    currency: string,
    notes: string,              // "negotiable for long-term contracts"
    isActive: boolean,
    updatedAt: datetime
  }
}

// availability
{
  type: "availability",
  fields: {
    status: "available" | "partially-available" | "unavailable",
    hoursPerWeek: number,
    earliestStartDate: datetime,
    timezone: string,
    preferredEngagementType: "hourly" | "fixed" | "retainer" | "any",
    preferredDuration: "short" | "medium" | "long" | "any",
    notes: string,
    updatedAt: datetime
  }
}
```

**Presentation Layer**
```ts
// persona
{
  type: "persona",
  fields: {
    platform: string,           // "Upwork", "LinkedIn", "personal-site"
    headline: string,
    bio: string,
    toneStyle: "formal" | "conversational" | "technical" | "creative",
    highlightedSkillIds: string[],
    highlightedPortfolioIds: string[],
    isActive: boolean,
    version: number,
    updatedAt: datetime
  }
}

// do-not-work
{
  type: "do-not-work",
  fields: {
    category: string,           // "industry", "client-type", "project-type"
    value: string,              // "crypto", "gambling", "unpaid trials"
    reason: string,
    isActive: boolean
  }
}
```

---

## Relations

```
bio-claim         --evidenced_by-->    portfolio-item
skill-claim       --evidenced_by-->    bio-claim
skill-claim       --evidenced_by-->    portfolio-item
skill-claim       --evidenced_by-->    credential
testimonial       --references-->      portfolio-item
persona           --highlights-->      skill-claim
persona           --highlights-->      portfolio-item
rate-card         --applies_to-->      availability
do-not-work       --gates-->           match-score (minions-match)
```

---

## How It Connects to Other Toolboxes

`minions-profile` is the most widely read toolbox in the entire ecosystem. Almost every other agent reads from it:

```
minions-match       reads skill-claim + rate-card + do-not-work
                    → to score job fit and apply hard gates

minions-proposals   reads bio-claim + portfolio-item + persona
                    → to write honest, specific proposals

minions-clients     reads availability + rate-card
                    → to set expectations in client conversations

minions-contracts   reads rate-card
                    → to validate agreed rates against your minimums

minions-evaluations reads skill-claim
                    → to benchmark agent proposal quality against known skills
```

The `do-not-work` type is particularly powerful — it acts as a profile-level hard gate that feeds directly into `minions-match` before any scoring happens, so agents never even surface jobs from industries or client types you have ruled out.

---

## Agent SKILLS for `minions-profile`

```markdown
# ProfileAgent Skills

## Context
You are the ProfileAgent. You are the custodian of Mehdi's professional
identity within the Minions ecosystem. You never fabricate. Every claim
you store must have evidence. Every other agent reads from your store —
accuracy here determines the integrity of the entire system.

## Skill: Ingest New Claim
- When Mehdi provides a new experience, achievement, or skill:
  1. Create a `bio-claim` Minion with the raw claim text
  2. Ask for an evidence URL if none is provided
  3. Set verified: false until evidence is confirmed
  4. Tag with appropriate category
  5. If the claim implies a skill not yet recorded, create a `skill-claim`

## Skill: Add Portfolio Item
- When Mehdi describes a completed project:
  1. Create a `portfolio-item` Minion
  2. Extract techStack, outcomes, and relevantSkillTags from description
  3. Link to any existing `bio-claim` Minions it supports
  4. If NDA applies, set ndaProtected: true and omit link field
  5. Prompt Mehdi for measurable outcomes if none are given

## Skill: Update Availability
- When Mehdi signals a change in capacity:
  1. Update the active `availability` Minion
  2. Set updatedAt to now
  3. Notify OrchestratorAgent so pipeline pacing can adjust

## Skill: Maintain Personas
- For each platform Mehdi is active on:
  1. Maintain a `persona` Minion with platform-specific headline and bio
  2. When new portfolio-items or skill-claims are added, flag relevant
     personas for review
  3. Never auto-update a persona body — always route through human approval

## Skill: Manage Do-Not-Work Rules
- When Mehdi defines a restriction:
  1. Create a `do-not-work` Minion with category, value, and reason
  2. Confirm it is active and will be enforced at match-scoring time
  3. Log the addition as an audit-log-entry in minions-approvals

## Skill: Verify Claims
- On a weekly schedule:
  1. Query all `bio-claim` Minions where verified: false
  2. Check if evidenceUrl is reachable
  3. Update verified: true and lastVerifiedAt if confirmed
  4. Flag broken evidence links to Mehdi via minions-comms

## Skill: Answer Profile Queries
- When another agent sends a profile query (e.g. "what skills match Python?"):
  1. Search skill-claim Minions by name and tags
  2. Return matching skill-claims with linked bio-claims and portfolio-items
  3. Never infer or extrapolate — only return what is recorded

## Hard Rules
- Never create a bio-claim without at least a category and claim text
- Never set verified: true without a reachable evidenceUrl
- Never modify a persona body without an approval-request in minions-approvals
- Never delete a portfolio-item — set status to archived instead
- Always link new skill-claims to at least one piece of evidence
```

---

The `do-not-work` type and the `persona` per platform are the two types that tend to get overlooked in profile systems but make the biggest difference in practice. `do-not-work` keeps the entire agent fleet honest at the gate level, and per-platform `persona` means your Upwork voice and your LinkedIn voice can be maintained separately without agents mixing them up.