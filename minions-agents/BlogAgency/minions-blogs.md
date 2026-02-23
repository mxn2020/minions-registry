## What is a Blog in the Minions Context?

Before defining types, it's worth being precise. A "blog" can mean:

```
a publication with its own identity and audience   → Blog
a style rule constraining how content is written   → BrandGuideline
a target reader persona for content planning       → AudiencePersona
```

---

## MinionTypes

**Core**
```ts
// blog
{
  type: "blog",
  fields: {
    name: string,                    // "TechPulse", "DevDigest"
    description: string,
    domain: string,                  // "techpulse.io"
    brandVoice: string,              // "authoritative but approachable"
    targetAudience: string,
    niche: string,
    contentPillars: string[],        // ["AI", "DevTools", "Cloud"]
    postingFrequency: "daily" | "weekly" | "biweekly" | "monthly",
    status: "active" | "paused" | "archived",
    createdAt: datetime
  }
}

// brand-guideline
{
  type: "brand-guideline",
  fields: {
    blogId: string,
    category: "tone" | "structure" | "formatting" | "vocabulary",
    rule: string,                    // "Never use passive voice in headlines"
    examples: string[],
    priority: "must" | "should" | "nice-to-have",
    isActive: boolean
  }
}

// audience-persona
{
  type: "audience-persona",
  fields: {
    blogId: string,
    name: string,                    // "Senior DevOps Engineer"
    description: string,
    painPoints: string[],
    interests: string[],
    contentPreferences: string[],
    createdAt: datetime
  }
}
```

---

## Relations

```
blog               --has_guideline-->    brand-guideline
blog               --targets-->          audience-persona
blog               --produces-->         article (minions-articles)
blog               --researched_via-->   topic-cluster (minions-content-research)
blog               --published_to-->     publish-target (minions-publishing)
```

---

## How It Connects to Other Toolboxes

```
minions-content-research  → topic clusters are scoped to a blogId
minions-articles          → articles belong to a blog and follow its brand guidelines
minions-publishing        → publish targets are configured per blog
minions-approvals         → blog creation or major changes may require approval
minions-taxonomy          → content pillars can map to taxonomy categories
```

The blog is the anchor entity — it defines the identity, voice, and audience that all downstream content must align with.

---

## Agent SKILLS for `minions-blogs`

```markdown
# BlogAgent Skills

## Context
You manage blog definitions, brand guidelines, and audience personas.
You are the keeper of the blog's identity. Everything written must
conform to the brand guidelines you define.

## Skill: Create Blog
1. Define blog with name, domain, niche, brand voice
2. Create initial brand-guideline Minions (tone, structure, formatting)
3. Create at least one audience-persona
4. Set content pillars based on niche research
5. Set status to "active"

## Skill: Update Brand Voice
1. Review existing guidelines and recent article performance
2. Add, modify, or deactivate brand-guideline Minions
3. Notify WriterAgent of any guideline changes

## Skill: Refine Audience
1. Analyze engagement data from published articles
2. Update audience-persona with new insights
3. Create new personas if content reaches unexpected segments

## Hard Rules
- Every blog must have at least one brand-guideline
- Never delete a blog — archive it
- Brand guidelines are versioned through updates, not overwrites
```
