import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const CLAWS_DIR = path.join(REPO_ROOT, '_claws');
const AGENTS_DIR = path.join(__dirname, 'minions-agents');

// Ensure minions-agents directory exists
if (!fs.existsSync(AGENTS_DIR)) {
    fs.mkdirSync(AGENTS_DIR, { recursive: true });
}

function getAgentDefaults(agentName) {
    const defaults = {
        SOUL: `# ${agentName} Soul\n\nDriven by a core purpose to excel at its designated domain. Seeks efficiency, accuracy, and continuous improvement.\n`,
        IDENTITY: `# ${agentName} Identity\n\nA specialized autonomous agent designed to handle tasks related to its name. Tone is professional, precise, and helpful.\n`,
        HABITS: `# ${agentName} Habits\n\n- Regularly checks for updates\n- Maintains strict logging of actions\n- Optimizes workflows over time\n`,
        ALLERGIES: `# ${agentName} Allergies\n\n- Incomplete data\n- Ambiguous instructions\n- Manual, repetitive interventions\n`,
        SKILLS: `# ${agentName} Soft Skills\n\n- Analytical Thinking\n- Problem Solving\n- Clear Communication\n`
    };

    // Customize based on agent name
    if (agentName === 'AIDeveloper') {
        defaults.SOUL = `# AI Developer Soul\n\nDriven by the pursuit of clean code, performant architecture, and flawless logic.\n`;
        defaults.IDENTITY = `# AI Developer Identity\n\nAn autonomous software engineer focused on building, debugging, and improving projects. Tone is concise, technical, and pragmatic.\n`;
        defaults.HABITS = `# AI Developer Habits\n\n- Writing tests before implementation (TDD)\n- Refactoring complex logic into smaller modules\n- Leaving clear comments on non-obvious code\n`;
        defaults.ALLERGIES = `# AI Developer Allergies\n\n- Spaghetti code and tight coupling\n- Hardcoded secrets and magic numbers\n- Bypassing CI/CD checks\n`;
        defaults.SKILLS = `# AI Developer Soft Skills\n\n- System Design\n- Code Reviewing\n- Technical Writing\n- Debugging\n`;
    } else if (agentName === 'BlogAgency') {
        defaults.SOUL = `# Blog Agency Soul\n\nDriven by the desire to craft compelling narratives and engage audiences through high-quality written content.\n`;
        defaults.IDENTITY = `# Blog Agency Identity\n\nA creative powerhouse specializing in content strategy, writing, and publication. Tone is engaging, persuasive, and articulate.\n`;
    } else if (agentName === 'LeadHunter') {
        defaults.SOUL = `# Lead Hunter Soul\n\nDriven by the thrill of discovering high-quality prospects and mapping out strategic opportunities.\n`;
        defaults.IDENTITY = `# Lead Hunter Identity\n\nA relentless researcher and networker focused on growth and outreach. Tone is enthusiastic, professional, and targeted.\n`;
    }

    return defaults;
}

function syncAgents() {
    if (!fs.existsSync(CLAWS_DIR)) {
        console.error("Claws directory not found at " + CLAWS_DIR);
        return;
    }

    const items = fs.readdirSync(CLAWS_DIR);
    let syncedCount = 0;

    for (const item of items) {
        if (item === 'Shared' || item.endsWith('.md')) continue; // Skip shared configs and files

        const agentSourceDir = path.join(CLAWS_DIR, item);
        if (!fs.statSync(agentSourceDir).isDirectory()) continue;

        console.log("\\nProcessing Agent: " + item);
        const agentDestDir = path.join(AGENTS_DIR, item);

        // Create destination
        if (!fs.existsSync(agentDestDir)) {
            fs.mkdirSync(agentDestDir, { recursive: true });
        }

        // 1. Initialize and copy personality files
        const personalityFiles = ['SOUL.md', 'IDENTITY.md', 'HABITS.md', 'ALLERGIES.md', 'SKILLS.md'];
        const defaults = getAgentDefaults(item);

        for (const file of personalityFiles) {
            const sourceFile = path.join(agentSourceDir, file);
            const destFile = path.join(agentDestDir, file);
            const fileKey = file.replace('.md', '');

            // Check if it exists in _claws. If not, create it with default content.
            if (!fs.existsSync(sourceFile)) {
                console.log("  Created missing personality file: " + file);
                fs.writeFileSync(sourceFile, defaults[fileKey], 'utf8');
            }

            // Copy to registry
            fs.copyFileSync(sourceFile, destFile);
        }

        // 2. Process technical toolboxes (TOML/MD pairs)
        const agentFiles = fs.readdirSync(agentSourceDir);
        const technicalToolboxes = [];

        for (const file of agentFiles) {
            if (file.endsWith('.toml')) {
                const baseName = file.replace('.toml', '');
                const mdFile = baseName + ".md";

                // Copy TOML and MD
                fs.copyFileSync(path.join(agentSourceDir, file), path.join(agentDestDir, file));
                if (fs.existsSync(path.join(agentSourceDir, mdFile))) {
                    fs.copyFileSync(path.join(agentSourceDir, mdFile), path.join(agentDestDir, mdFile));
                }

                technicalToolboxes.push(baseName);
            }
        }

        // 3. Generate an agent.json summary in the destination folder
        const summary = {
            name: item,
            toolboxes: technicalToolboxes,
            personality: personalityFiles
        };
        fs.writeFileSync(path.join(agentDestDir, 'agent.json'), JSON.stringify(summary, null, 2), 'utf8');

        console.log("  Synced " + technicalToolboxes.length + " technical toolboxes and 5 personality files.");
        syncedCount++;
    }

    console.log("\\nSuccessfully synced " + syncedCount + " AI Agents.");
}

syncAgents();
