#!/usr/bin/env node
/**
 * build-index.js
 *
 * Recursively scans the skills repo for SKILL.md files, parses YAML
 * frontmatter, and outputs a single skills-index.json used by the web app.
 *
 * Usage: node scripts/build-index.js
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { globSync } from 'glob';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUT_FILE = path.resolve(import.meta.dirname, '..', 'public', 'skills-index.json');
const AGENTS_OUT_FILE = path.resolve(import.meta.dirname, '..', 'public', 'agents-index.json');
const BUNDLES_OUT_FILE = path.resolve(import.meta.dirname, '..', 'public', 'bundles-index.json');

// Directories to skip

const IGNORE = new Set(['.git', '.claude', 'node_modules', 'website', 'examples']);

function slugToTitle(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Category icons (emoji mapping)
const CATEGORY_ICONS = {
  'ai': '🤖',
  'cloud': '☁️',
  'dev-tools': '🧪',
  'personal': '🏠',
  'productivity': '📋',
};

function buildIndex() {
  // Find all SKILL.md files
  const pattern = path.join(REPO_ROOT, 'minions-skills', '**', '*.md');
  const files = globSync(pattern, { ignore: ['**/node_modules/**', '**/website/**'] });

  const categoryMap = new Map();
  let totalSkills = 0;

  for (const filepath of files) {
    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data: frontmatter, content: markdownBody } = matter(raw);

    // Get the relative path from repo root
    const relDir = path.relative(REPO_ROOT, path.dirname(filepath));
    const parts = relDir.split(path.sep);

    // Skip ignored directories
    if (IGNORE.has(parts[0])) continue;

    // relDir is something like "minions-skills/cloud/infrastructure" for "minions-skills/cloud/infrastructure/minions-services.md"
    let categorySlug, subcategorySlug, skillSlug;

    // We expect the path to be minions-skills/<category>/<subcategory>/<skill>.md
    // relative to REPO_ROOT, filepath is REPO_ROOT/minions-skills/...
    // Let's get the path relative to minions-skills
    const skillsRelPath = path.relative(path.join(REPO_ROOT, 'minions-skills'), filepath);
    const skillParts = skillsRelPath.split(path.sep);

    if (skillParts.length >= 3) {
      // <category>/<subcategory>/<skill>.md
      categorySlug = skillParts[0];
      subcategorySlug = skillParts.slice(1, -1).join('/');
      skillSlug = path.parse(skillParts[skillParts.length - 1]).name;
    } else if (skillParts.length === 2) {
      // <category>/<skill>.md
      categorySlug = skillParts[0];
      subcategorySlug = null;
      skillSlug = path.parse(skillParts[1]).name;
    } else {
      categorySlug = 'misc';
      subcategorySlug = null;
      skillSlug = path.parse(skillParts[0]).name;
    }

    const skill = {
      slug: skillSlug,
      name: typeof frontmatter.name === 'string' && frontmatter.name ? frontmatter.name : skillSlug,
      id: frontmatter.id || null,
      version: frontmatter.version || '1.0.0',
      description: (frontmatter.description || '').trim(),
      commands: frontmatter.commands || [],
      env: frontmatter.env || [],
      path: relDir,
      markdownBody: markdownBody.trim(),
    };

    // Build category structure
    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        name: slugToTitle(categorySlug),
        icon: CATEGORY_ICONS[categorySlug] || '📦',
        subcategories: new Map(),
        skills: [],
      });
    }

    const category = categoryMap.get(categorySlug);

    if (subcategorySlug) {
      if (!category.subcategories.has(subcategorySlug)) {
        category.subcategories.set(subcategorySlug, {
          slug: subcategorySlug,
          name: slugToTitle(subcategorySlug),
          skills: [],
        });
      }
      category.subcategories.get(subcategorySlug).skills.push(skill);
    } else {
      category.skills.push(skill);
    }

    totalSkills++;
  }

  // Convert maps to arrays and sort
  const categories = Array.from(categoryMap.values())
    .map(cat => ({
      ...cat,
      subcategories: Array.from(cat.subcategories.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
      skillCount:
        cat.skills.length +
        Array.from(cat.subcategories.values()).reduce((sum, sc) => sum + sc.skills.length, 0),
    }))
    .sort((a, b) => b.skillCount - a.skillCount);

  const index = {
    categories,
    totalSkills,
    generatedAt: new Date().toISOString(),
  };

  // Ensure output dir exists
  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2));
  console.log(`✅ Built skills index: ${totalSkills} skills across ${categories.length} categories`);
  console.log(`   → ${OUT_FILE}`);
}

function buildAgentsIndex() {
  const agentsDir = path.join(REPO_ROOT, 'minions-agents');
  if (!fs.existsSync(agentsDir)) {
    console.log('No agents directory found, skipping.');
    return;
  }

  const items = fs.readdirSync(agentsDir);
  const agents = [];

  for (const item of items) {
    const fullPath = path.join(agentsDir, item);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const agentJsonPath = path.join(fullPath, 'agent.json');
    if (!fs.existsSync(agentJsonPath)) continue;

    const summary = JSON.parse(fs.readFileSync(agentJsonPath, 'utf-8'));

    // Read personality markdown files
    const personality = {};
    for (const filename of summary.personality) {
      const p = path.join(fullPath, filename);
      const key = filename.replace('.md', '').toLowerCase();
      personality[key] = fs.existsSync(p) ? fs.readFileSync(p, 'utf-8').trim() : '';
    }

    agents.push({
      slug: item.toLowerCase(),
      name: item,
      toolboxes: summary.toolboxes || [],
      personality
    });
  }

  agents.sort((a, b) => a.name.localeCompare(b.name));

  const index = {
    agents,
    totalAgents: agents.length,
    generatedAt: new Date().toISOString()
  };

  const outDir = path.dirname(AGENTS_OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(AGENTS_OUT_FILE, JSON.stringify(index, null, 2));
  console.log(`✅ Built agents index: ${agents.length} agents`);
  console.log(`   → ${AGENTS_OUT_FILE}`);
}

function buildBundlesIndex() {
  const bundlesDir = path.join(REPO_ROOT, '..', 'minionsBundles');
  if (!fs.existsSync(bundlesDir)) {
    console.log('No bundles directory found, skipping.');
    return;
  }

  const items = fs.readdirSync(bundlesDir);
  const bundles = [];

  for (const item of items) {
    if (!item.startsWith('minions-bundles-')) continue;
    const fullPath = path.join(bundlesDir, item);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const pkgJsonPath = path.join(fullPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

    const readmePath = path.join(fullPath, 'README.md');
    const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8').trim() : '';

    const skillsPath = path.join(fullPath, 'SKILLS.md');
    const skills = fs.existsSync(skillsPath) ? fs.readFileSync(skillsPath, 'utf-8').trim() : '';

    bundles.push({
      slug: item.replace('minions-bundles-', '').toLowerCase(),
      name: item,
      description: pkg.description || '',
      version: pkg.version || '0.1.0',
      readme,
      skills
    });
  }

  bundles.sort((a, b) => a.name.localeCompare(b.name));

  const index = {
    bundles,
    totalBundles: bundles.length,
    generatedAt: new Date().toISOString()
  };

  const outDir = path.dirname(BUNDLES_OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(BUNDLES_OUT_FILE, JSON.stringify(index, null, 2));
  console.log(`✅ Built bundles index: ${bundles.length} bundles`);
  console.log(`   → ${BUNDLES_OUT_FILE}`);
}

buildIndex();
buildAgentsIndex();
buildBundlesIndex();
