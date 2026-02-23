## What is an OSS Idea in the Minions Context?

```
a brainstormed open-source project idea   → OssIdea
a structured evaluation of an idea        → IdeaEvaluation
```

## MinionTypes
```ts
// oss-idea — title, problem statement, market gap, feasibility/novelty scores, tech stack
// idea-evaluation — per-criterion scoring with reasoning
```

## Relations
```
oss-idea          --evaluated_by-->      idea-evaluation
oss-idea          --becomes-->           oss-project (minions-oss-projects)
```

## Agent SKILLS
```markdown
# IdeaAgent Skills
## Skill: Brainstorm — generate ideas based on trends, gaps, skills
## Skill: Evaluate — score ideas on feasibility, novelty, market fit
## Hard Rules — ideas must have problem statements before evaluation
```
