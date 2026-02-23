import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSkills } from '../App';

// Sample blog posts - stored as data so adding new posts is easy
// In the future, these could be loaded from markdown files via a build script
const BLOG_POSTS = [
    {
        slug: 'introduction-to-minion-toolboxes',
        title: 'Introduction to Minion Toolboxes',
        date: '2026-02-22',
        author: 'Mehdi Nabhani',
        tags: ['agents', 'toolboxes', 'open-source'],
        excerpt: 'A deep dive into what minion toolboxes are, why they matter, and how this directory helps you build better AI agents.',
        readTime: '5 min read',
        content: `
# Introduction to Minion Toolboxes

Minion toolboxes are modular, reusable capabilities that extend what AI agents can do. Instead of building everything from scratch, you can compose toolboxes together to create powerful agents.

## What is a Toolbox?

A toolbox is a self-contained unit of functionality that an agent can invoke. Each toolbox:

- Has a **clear purpose** — described in its \`SKILL.md\`
- Exposes **commands** — discrete actions the toolbox can perform
- Declares **dependencies** — environment variables and prerequisites
- Is **independently testable** — each toolbox can be verified in isolation

## Why This Directory?

With over **73 toolboxes** across 5 categories, this directory serves as a central hub for discovering and integrating agent capabilities. Whether you need a GitHub integration, a budget tracker, or an AI image generator — there's likely a toolbox for that.

## How Toolboxes Are Organized

Toolboxes follow a hierarchical structure:

\`\`\`
minions-skills/
├── cloud/
│   ├── infrastructure/
│   │   ├── minions-services/
│   │   │   ├── SKILL.md
│   │   │   └── package.json
│   └── oss/
├── ai/
│   ├── general/
│   │   ├── minions-workflows/
│   │   └── minions-agents/
└── productivity/
    └── tasks/
        ├── minions-projects/
        └── minions-tasks/
\`\`\`

Each \`SKILL.md\` contains YAML frontmatter with metadata, followed by documentation:

\`\`\`yaml
---
name: minions-services
id: OC-0157
version: 1.0.0
description: "Cloud infrastructure management..."
env:
  - AWS_ACCESS_KEY_ID
commands:
  - deploy
  - list
---
\`\`\`

## Getting Started

1. **Browse** the directory to find toolboxes you need
2. **Read** the toolbox documentation to understand capabilities
3. **Integrate** by following the setup instructions
4. **Contribute** by adding your own toolboxes — just create a repo!

---

*Built by [Mehdi Nabhani](https://the-mehdi.com) — find the source on [GitHub](https://github.com/mxn2020/minions-ecosystem).*
    `,
    },
    {
        slug: 'building-your-first-toolbox',
        title: 'Building Your First Toolbox',
        date: '2026-02-20',
        author: 'Mehdi Nabhani',
        tags: ['tutorial', 'getting-started'],
        excerpt: 'Step-by-step guide to creating a new toolbox for the directory. From directory structure to SKILL.md to tools.',
        readTime: '8 min read',
        content: `
# Building Your First Toolbox

Creating a new toolbox for the directory is straightforward. This guide walks you through the entire process.

## Step 1: Choose a Category

Decide which category your toolbox belongs to. The current categories include:

| Category | Examples |
|----------|----------|
| AI | Pipeline, Agents, Workflows |
| Cloud | Infrastructure, OSS |
| Dev Tools | Testing, CI, Monitoring |
| Productivity | Tasks, CRM, Notes, Communication |
| Personal | Identity |

## Step 2: Create the Repo

Create your toolbox repository using the template:

\`\`\`bash
npx mxn2020/create-minions-toolbox my-awesome-toolbox
\`\`\`

## Step 3: Write the SKILL.md

Every toolbox needs a \`SKILL.md\` file with YAML frontmatter:

\`\`\`yaml
---
name: my-awesome-toolbox
id: OC-0200
version: 1.0.0
description: "My Awesome Toolbox - Does something amazing"
env:
  - MY_API_KEY
commands:
  - run
  - configure
  - test
---

# My Awesome Toolbox

Describe what your toolbox does here...
\`\`\`

## Step 4: Test & Submit

1. Run \`update_skills.mjs\` to attach ID and metadata
2. Run \`sync_skills.mjs\` to populate the web registry
3. Submit a pull request!

---

*That's it! Your toolbox is now part of the directory.*
    `,
    },
    {
        slug: 'toolbox-architecture-patterns',
        title: 'Toolbox Architecture Patterns',
        date: '2026-02-18',
        author: 'Mehdi Nabhani',
        tags: ['architecture', 'best-practices'],
        excerpt: 'Common patterns and best practices for structuring agent toolboxes — from simple schemas to complex multi-step pipelines.',
        readTime: '6 min read',
        content: `
# Toolbox Architecture Patterns

After building 73+ toolboxes, several patterns have emerged. Here are the most effective architectures for building robust agent toolboxes.

## Pattern 1: Definitions & Schemas

The simplest pattern — define semantic structures for the ecosystem:

\`\`\`
toolbox/
├── SKILL.md
└── package.json
\`\`\`

**When to use:** When standardizing MinionTypes across agents (e.g. \`minions-taxonomy\`).

## Pattern 2: Process Wrapper

Wrapping an established business process:

**When to use:** For standard operational workflows like sales funnels or CI checks.

## Best Practices

1. **Single responsibility** — one toolbox, one domain
2. **Clear commands** — each command does one thing well
3. **Environment variables** — never hardcode secrets
4. **Error handling** — graceful failures with clear messages
5. **Documentation** — comprehensive SKILL.md with examples

---

*These patterns have been refined across 70+ toolboxes. Use them as guidelines.*
    `,
    },
];

function BlogList() {
    const [selectedTag, setSelectedTag] = useState(null);

    const allTags = useMemo(() => {
        const tags = new Set();
        BLOG_POSTS.forEach(p => p.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, []);

    const filtered = selectedTag
        ? BLOG_POSTS.filter(p => p.tags.includes(selectedTag))
        : BLOG_POSTS;

    return (
        <div className="page-container">
            <div className="blog-header animate-in">
                <div className="hero-badge">📝 Blog</div>
                <h1>
                    Thoughts on <span className="gradient-text">Minion Ecosystem</span>
                </h1>
                <p className="hero-subtitle">
                    Tutorials, architecture patterns, and insights on building minion toolboxes.
                </p>
            </div>

            {/* Tags filter */}
            <div className="blog-tags animate-in animate-in-delay-1">
                <button
                    className={`blog-tag ${!selectedTag ? 'active' : ''}`}
                    onClick={() => setSelectedTag(null)}
                >
                    All
                </button>
                {allTags.map(tag => (
                    <button
                        key={tag}
                        className={`blog-tag ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Post list */}
            <div className="blog-posts animate-in animate-in-delay-2">
                {filtered.map(post => (
                    <Link to={`/blog/${post.slug}`} key={post.slug} className="blog-post-card">
                        <div className="blog-post-meta">
                            <span className="blog-post-date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="blog-post-dot">·</span>
                            <span className="blog-post-read">{post.readTime}</span>
                        </div>
                        <h2 className="blog-post-title">{post.title}</h2>
                        <p className="blog-post-excerpt">{post.excerpt}</p>
                        <div className="blog-post-tags">
                            {post.tags.map(tag => (
                                <span key={tag} className="blog-post-tag">{tag}</span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function BlogDetail({ slug }) {
    const post = BLOG_POSTS.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3>Post not found</h3>
                    <Link to="/blog" className="back-link">← Back to Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-sep">/</span>
                <Link to="/blog">Blog</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{post.title}</span>
            </div>

            <article className="blog-article animate-in">
                <div className="blog-article-header">
                    <div className="blog-post-meta">
                        <span className="blog-post-date">
                            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="blog-post-dot">·</span>
                        <span className="blog-post-read">{post.readTime}</span>
                        <span className="blog-post-dot">·</span>
                        <span className="blog-post-author">By {post.author}</span>
                    </div>
                    <div className="blog-post-tags" style={{ marginTop: 16 }}>
                        {post.tags.map(tag => (
                            <span key={tag} className="blog-post-tag">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="markdown-body">
                    <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
                </div>
            </article>
        </div>
    );
}

export default function BlogPage() {
    const { slug } = useParams();

    if (slug) {
        return <BlogDetail slug={slug} />;
    }

    return <BlogList />;
}
