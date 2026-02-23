## What is a Scaffold in the Minions Context?

```
a project scaffolding template            → ScaffoldTemplate
tech stack choices and dependencies       → TechStackConfig
a boilerplate file to include             → InitialFile
```

---

## MinionTypes

```ts
// scaffold-template
{
  type: "scaffold-template",
  fields: {
    name: string,                   // "vite-react-ts", "next-convex", "cli-tool"
    description: string,
    techStack: string,              // "React + TypeScript + Vite"
    framework: string,              // "vite", "next", "astro"
    language: string,               // "typescript", "python"
    packageManager: "pnpm" | "npm" | "yarn" | "bun",
    initCommand: string,            // "npx create-vite@latest ./ --template react-ts"
    postInitSteps: string[],        // ["pnpm install", "pnpm add convex"]
    version: string,
    status: "active" | "deprecated"
  }
}

// tech-stack-config — per-dependency version pinning and purpose
// initial-file — template files (README, .gitignore, config files)
```

---

## Relations

```
scaffold-template  --has_config-->       tech-stack-config
scaffold-template  --includes-->         initial-file
scaffold-template  --used_by-->          repo-definition (minions-repos)
```

---

## How It Connects to Other Toolboxes

```
minions-repos        → repo creation triggers scaffold selection
minions-agent-tasks  → post-scaffold, agent-tasks implement features
minions-documents    → scaffold templates can be versioned as documents
minions-taxonomy     → tech stacks can be categorized (frontend, backend, CLI, etc.)
```

---

## Agent SKILLS for `minions-scaffolds`

```markdown
# ScaffoldAgent Skills

## Context
You manage project templates and initial setup. When RepoAgent creates
a repo, you scaffold the initial project structure using the appropriate
template for the chosen tech stack.

## Skill: Scaffold Project
1. Select scaffold-template matching the project requirements
2. Run initCommand in the repo directory
3. Execute postInitSteps (install deps, add configs)
4. Write initial-files (README, .env.example, etc.)
5. Commit initial scaffold: `git commit -m "feat: initial scaffold"`

## Skill: Manage Templates
1. Create/update scaffold-template Minions
2. Version tech-stack-config for dependency updates
3. Deprecate outdated templates

## Hard Rules
- Every scaffold must produce a buildable project
- Initial commit must include a working CI config
- Templates are versioned — never modify in place
```
