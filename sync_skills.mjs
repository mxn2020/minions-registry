import fs from 'fs';
import path from 'path';

function findSkillsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'minions-registry' || file.startsWith('.')) continue;

        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findSkillsFiles(filePath, fileList);
        } else if (file === 'SKILLS.md' && filePath.includes('minions-')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// A basic regex for YAML frontmatter
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

const REPO_ROOT = path.join(import.meta.dirname, '..');
const DEST_DIR = path.join(import.meta.dirname, 'minions-skills');

function parseYaml(yamlString) {
    const lines = yamlString.split('\n');
    const result = {};
    for (const line of lines) {
        if (line.trim() === '') continue;
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.slice(0, colonIndex).trim();
            const valueStr = line.slice(colonIndex + 1).trim();
            let value = valueStr;
            if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
                value = valueStr.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            } else if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
                value = valueStr.slice(1, -1);
            } else if (valueStr.startsWith("'") && valueStr.endsWith("'")) {
                value = valueStr.slice(1, -1);
            }
            result[key] = value;
        }
    }
    return result;
}

function syncSkills() {
    console.log('Finding minion SKILLS files...');
    const files = findSkillsFiles(REPO_ROOT);

    // Clear out the destination if it exists
    if (fs.existsSync(DEST_DIR)) {
        fs.rmSync(DEST_DIR, { recursive: true, force: true });
    }

    let count = 0;

    for (const filepath of files) {
        const raw = fs.readFileSync(filepath, 'utf-8');
        const match = raw.match(FRONTMATTER_REGEX);
        let category = 'ai';
        let subcategory = 'general';
        let name = path.dirname(filepath).split(path.sep).pop(); // fallback

        if (match) {
            const fm = parseYaml(match[1]);
            if (fm.category) category = fm.category;
            if (fm.subcategory) subcategory = fm.subcategory;
            if (fm.name) name = fm.name;
        }

        // Output path logic: minions-registry/minions-skills/<category>/<subcategory>/<name>.md
        const targetDir = path.join(DEST_DIR, category, subcategory);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetFile = path.join(targetDir, `${name}.md`);
        fs.copyFileSync(filepath, targetFile);
        count++;
    }

    console.log(`Synced ${count} skill files to ${DEST_DIR}.`);
}

syncSkills();
