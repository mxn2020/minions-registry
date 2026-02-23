## What is an OSS Content in the Minions Context?

```
a blog post announcing a release          → ReleasePost
a tracked README update                   → ReadmeUpdate
a social media announcement               → SocialAnnouncement
a runnable demo script                    → DemoScript
```

## MinionTypes
```ts
// release-post — title, body, published URL
// readme-update — section, content, reason
// social-announcement — platform, body, status
// demo-script — title, script, output sample
```

## Relations
```
release-post       --announces-->        release (minions-oss-releases)
social-announcement --promotes-->        release
readme-update      --updates-->          oss-project (minions-oss-projects)
demo-script        --demonstrates-->     oss-project
```

## Agent SKILLS
```markdown
# ContentAgent Skills
## Skill: Write Release Post — blog post per release
## Skill: Update README — after each feature implementation
## Skill: Social Announcement — post to configured platforms
## Hard Rules — every release must have a release-post and README update
```
