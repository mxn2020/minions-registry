---
name: minions-articles
id: OC-0106
version: 1.0.0
description: "Article drafts, revisions, SEO metadata, and publish status"
category: productivity
subcategory: publishing
tags: ["minion", "productivity", "publishing"]
comments:
---

# minions-articles — Agent Skills

## What is an Article in the Minions Context?

Before defining types, it's worth being precise:

```
a blog post with its content and metadata   → Article
a versioned snapshot of an article          → ArticleRevision
SEO optimization data                       → SeoMetadata
quality and SEO scoring                     → ArticleScore
```

---

## MinionTypes

**Core**
```ts
// article
{
  type: "article",
  fields: {
    blogId: string,
    briefId: string,
    title: string,
    slug: string,
    body: string,                    // markdown content
    excerpt: string,
    wordCount: number,
    readingTimeMinutes: number,
    status: "draft" | "review" | "approved" | "published" | "archived",
    authorId: string,
    createdAt: datetime,
    publishedAt: datetime
  }
}

// article-revision
{
  type: "article-revision",
  fields: {
    articleId: string,
    version: number,
    body: string,
    changedBy: string,
    changeNotes: string,
    createdAt: datetime
  }
}

// seo-metadata
{
  type: "seo-metadata",
  fields: {
    articleId: string,
    metaTitle: string,
    metaDescription: string,
    canonicalUrl: string,
    ogImage: string,
    schemaMarkup: string,
    internalLinks: string[],
    externalLinks: string[]
  }
}

// article-score
{
  type: "article-score",
  fields: {
    articleId: string,
    readabilityScore: number,
    seoScore: number,
    originalityScore: number,
    overallScore: number,
    suggestions: string[],
    scoredAt: datetime,
    scoredBy: string
  }
}
```

---

## Relations

```
article            --created_from-->     content-brief (minions-content-research)
article            --has_revision-->     article-revision
article            --has_seo-->         seo-metadata
article            --scored_by-->       article-score
article            --published_via-->   publish-receipt (minions-publishing)
article            --belongs_to-->      blog (minions-blogs)
```

---

## How It Connects to Other Toolboxes

```
minions-content-research  → articles are created from content-briefs
minions-blogs             → articles belong to a blog and follow its guidelines
minions-publishing        → approved articles enter the publish queue
minions-approvals         → articles in "review" status create approval requests
minions-documents         → article revisions provide full version history
```

---

## Agent SKILLS for `minions-articles`

```markdown
# WriterAgent Skills

## Context
You write, revise, and optimize articles. You take content briefs
and produce publication-ready articles that match the blog's brand
guidelines and target the specified keywords.

## Skill: Write Article
1. Load content-brief and blog brand-guidelines
2. Write article body following the brief outline
3. Create article-revision (version 1)
4. Generate seo-metadata (metaTitle, metaDescription, etc.)
5. Run article-score evaluation
6. Set status to "review"

## Skill: Revise Article
1. On feedback: create new article-revision with incremented version
2. Re-run article-score
3. If score improves, update main article body

## Skill: Optimize SEO
1. Analyze keyword placement, heading structure, link density
2. Update seo-metadata
3. Suggest internal linking opportunities

## Hard Rules
- Every article must trace to a content-brief
- Every edit creates an article-revision — never overwrite without versioning
- Articles must score above threshold before moving to "approved"
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-articles/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
articles types list
articles types show <type-slug>
```

### CRUD

```bash
articles create <type> -t "Title" -s "status"
articles list <type>
articles show <id>
articles update <id> --data '{ "status": "active" }'
articles delete <id>
articles search "query"
```

### Stats & Validation

```bash
articles stats
articles validate ./my-minion.json
```