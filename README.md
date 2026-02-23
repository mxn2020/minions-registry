# Minions Registry

![Website](/minions-registry/website/public/vite.svg)

An open-source registry of **Minion Toolboxes** and **AI Agents** for the Minions Ecosystem. Designed to be a central hub where developers can browse production-ready components, discover powerful new AI capabilities, and combine them into fully-autonomous agents with distinct personalities.

## 🚀 Features

- **70+ Minion Toolboxes**: Modular, reusable, and independently-testable technical skills spanning AI, Cloud, Dev Tools, Productivity, and Personal domains.
- **AI Agents**: Pre-configured combinations of toolboxes mapped to an overarching personality, including habits, identity, soul, and allergies.
- **Dynamic Web Interface**: A sleek React-based front-end that automatically catalogs and organizes the entire ecosystem based on metadata.

## 📁 Repository Structure

- `minions-skills/`: Auto-generated, centralized directory of all technical \`SKILL.md\` files fetched from individual toolbox repositories.
- `minions-agents/`: Auto-generated directory containing the identities and technical configurations of fully-fledged AI Agents.
- `website/`: The React+Vite frontend powering the Minions Registry web experience.
- `sync_skills.mjs`: Script to automatically synchronize technical toolboxes from neighbor repositories across the ecosystem.
- `sync_agents.mjs`: Script to synchronize agent personalities and configurations.

## 🛠️ Local Development (Website)

To run the directory website locally:

```bash
cd website
pnpm install
pnpm run dev
```

The website fetches its catalog from the generated `skills-index.json` and `agents-index.json` within the `public/` directory.

To rebuild the data indexes locally:
```bash
cd website
npm run build:index
```

## 🤝 Contributing to the Ecosystem

### Adding a new Minions Toolbox
1. Create a new repository using the Minions template (`npx mxn2020/create-minions-toolbox <name>`).
2. Add a `SKILL.md` with the required YAML frontmatter (ID, version, category, description, commands, env).
3. The sync script will automatically pull it into the registry.

### Adding a new AI Agent
1. Create a folder in the ecosystem's `_agent` directory with your Agent's name.
2. Add its personality files: `SOUL.md`, `IDENTITY.md`, `HABITS.md`, `ALLERGIES.md`, and `SKILLS.md` (for soft skills).
3. Provide the TOML and MD files detailing which Minion Toolboxes the Agent connects to.

---

*Built with ⚡️ by [Mehdi Nabhani](https://the-mehdi.com) — Open Source for the Community.*
