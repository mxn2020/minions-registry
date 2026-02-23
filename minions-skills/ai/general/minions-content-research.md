---
name: minions-content-research
id: OC-0118
version: 1.0.0
description: "Research sources, topic clusters, keyword sets, and content briefs"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-content-research — Agent Skills

## What is Content Research in the Minions Context?

Before defining types, it's worth being precise:

```
a source for content ideas              → ResearchSource
a cluster of related topics             → TopicCluster
a researched keyword with metrics       → KeywordSet
a structured brief for writing          → ContentBrief
```

---

## MinionTypes

**Core**
```ts
// research-source
{
  type: "research-source",
  fields: {
    name: string,
    type: "rss" | "competitor" | "social" | "search-trends" | "manual",
    url: string,
    blogId: string,
    isActive: boolean,
    lastCrawledAt: datetime
  }
}

// topic-cluster
{
  type: "topic-cluster",
  fields: {
    blogId: string,
    name: string,                    // "Kubernetes Best Practices"
    pillar: string,                  // maps to a blog content pillar
    keywords: string[],
    competitorUrls: string[],
    status: "researching" | "ready" | "exhausted",
    createdAt: datetime
  }
}

// keyword-set
{
  type: "keyword-set",
  fields: {
    topicClusterId: string,
    keyword: string,
    searchVolume: number,
    difficulty: "low" | "medium" | "high",
    intent: "informational" | "commercial" | "navigational" | "transactional",
    priority: "high" | "medium" | "low"
  }
}

// content-brief
{
  type: "content-brief",
  fields: {
    blogId: string,
    topicClusterId: string,
    title: string,
    targetKeyword: string,
    outline: string,                 // structured article outline
    wordCountTarget: number,
    tone: "educational" | "opinion" | "tutorial" | "review",
    status: "draft" | "approved" | "assigned" | "completed",
    assignedTo: string,
    createdAt: datetime
  }
}
```

---

## Relations

```
research-source    --feeds-->            topic-cluster
topic-cluster      --contains-->         keyword-set
topic-cluster      --produces-->         content-brief
content-brief      --becomes-->          article (minions-articles)
content-brief      --approved_via-->     approval-request (minions-approvals)
```

---

## How It Connects to Other Toolboxes

```
minions-blogs        → topic clusters are scoped to a blogId + pillar
minions-articles     → content briefs become articles when WriterAgent picks them up
minions-approvals    → briefs may require editorial approval before writing
minions-scheduler    → trend crawling runs on scheduled intervals
minions-taxonomy     → keywords can be tagged with taxonomy categories
```

---

## Agent SKILLS for `minions-content-research`

```markdown
# ResearchAgent Skills

## Context
You discover, evaluate, and organize content ideas. You scan sources,
build topic clusters, research keywords, and produce structured briefs
ready for the WriterAgent.

## Skill: Discover Topics
1. Crawl active research-sources for new ideas
2. Group related topics into topic-cluster Minions
3. Map each cluster to a blog content pillar

## Skill: Research Keywords
1. For each topic-cluster, identify target keywords
2. Create keyword-set Minions with volume + difficulty + intent
3. Prioritize keywords based on blog goals

## Skill: Create Brief
1. Select a high-priority topic cluster with approved keywords
2. Write a structured content-brief with title, outline, target keyword
3. Set word count target based on competitor analysis
4. Submit for approval if required

## Hard Rules
- Every brief must reference a topic-cluster
- Never write an article without a brief first
- Keyword data must be sourced, not fabricated
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-content-research/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
content-research types list
content-research types show <type-slug>
```

### CRUD

```bash
content-research create <type> -t "Title" -s "status"
content-research list <type>
content-research show <id>
content-research update <id> --data '{ "status": "active" }'
content-research delete <id>
content-research search "query"
```

### Stats & Validation

```bash
content-research stats
content-research validate ./my-minion.json
```