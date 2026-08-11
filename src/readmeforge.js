#!/usr/bin/env node
'use strict';
/**
 * readmeforge — Generate beautiful READMEs from a config file
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const PKG = require('../package.json');

const R='\x1b[0m', G='\x1b[32m', Y='\x1b[33m', BOLD='\x1b[1m';

// ─── Templates ────────────────────────────────────────────────────────────────

const BADGE_TEMPLATES = {
  ci:       (u, r) => `[![CI](https://github.com/${u}/${r}/actions/workflows/ci.yml/badge.svg)](https://github.com/${u}/${r}/actions/workflows/ci.yml)`,
  npm:      (_,r)  => `[![npm version](https://img.shields.io/npm/v/${r}.svg)](https://npmjs.com/package/${r})`,
  license:  (_, __, l='MIT') => `[![License: ${l}](https://img.shields.io/badge/License-${l}-yellow.svg)](LICENSE)`,
  coverage: (u, r) => `[![codecov](https://codecov.io/gh/${u}/${r}/branch/main/graph/badge.svg)](https://codecov.io/gh/${u}/${r})`,
  node:     () => `[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)`,
};

const TEMPLATES = {
  minimal: (cfg) => `# ${cfg.name}

> ${cfg.description}

## Installation

\`\`\`bash
npm install${cfg.github?.repo ? ` ${cfg.github.repo}` : ''}
\`\`\`

## License

${cfg.license || 'MIT'} © ${cfg.author || 'Your Name'}
`,

  standard: (cfg) => {
    const u = cfg.github?.username || 'YOUR_USERNAME';
    const r = cfg.github?.repo || cfg.name;
    const badges = (cfg.badges || ['ci','npm','license','node']).map(b => {
      const fn = BADGE_TEMPLATES[b];
      return fn ? fn(u, r, cfg.license) : '';
    }).filter(Boolean).join('\n');

    const features = (cfg.features || []).map(f => `- ${f}`).join('\n') || '- Feature 1\n- Feature 2';
    const usageEx = (cfg.usage || []).map(u =>
      `\`\`\`bash\n# ${u.description}\n${u.command}\n\`\`\``
    ).join('\n\n') || '```bash\nnpm start\n```';

    return `# ${cfg.name}

${badges}

> ${cfg.description}

## Features

${features}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

${usageEx}

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

${cfg.license || 'MIT'} © ${cfg.author || 'Your Name'}
`;
  },

  cli: (cfg) => {
    const u = cfg.github?.username || 'YOUR_USERNAME';
    const r = cfg.github?.repo || cfg.name;
    const badges = (cfg.badges || ['ci','npm','license','node']).map(b => {
      const fn = BADGE_TEMPLATES[b];
      return fn ? fn(u, r, cfg.license) : '';
    }).filter(Boolean).join('\n');

    const cmds = (cfg.commands || cfg.usage || []).map(c =>
      `| \`${c.command}\` | ${c.description} |`
    ).join('\n') || '| `start` | Start the tool |';

    return `# ${cfg.name}

${badges}

> ${cfg.description}

## Installation

\`\`\`bash
# Global install
npm install -g ${r}

# Local install
npm install
\`\`\`

## Commands

| Command | Description |
|---------|-------------|
${cmds}

## Configuration

Create \`.${r.replace(/-/g,'')}.json\` in your project root to customize behavior.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

${cfg.license || 'MIT'} © ${cfg.author || 'Your Name'}
`;
  },
};
TEMPLATES.full    = TEMPLATES.standard;
TEMPLATES.library = TEMPLATES.standard;

// ─── Config loader ────────────────────────────────────────────────────────────

function loadConfig(file) {
  const candidates = file ? [file] : ['readmeforge.yml','readmeforge.yaml','readmeforge.json','.readmeforge.yml'];
  for (const c of candidates) {
    if (!fs.existsSync(c)) continue;
    const raw = fs.readFileSync(c, 'utf8');
    if (c.endsWith('.json')) return JSON.parse(raw);
    try {
      const yaml = require('js-yaml');
      return yaml.load(raw);
    } catch {
      console.error(`Failed to parse ${c}`); process.exit(1);
    }
  }
  return null;
}

// ─── Commands ────────────────────────────────────────────────────────────────

program.name('readmeforge').description('Generate beautiful READMEs from config').version(PKG.version);

program
  .command('init')
  .description('Create a starter readmeforge.yml config')
  .option('--json', 'Output JSON instead of YAML')
  .action((opts) => {
    const defaultCfg = {
      name: path.basename(process.cwd()),
      description: 'A short description of your project',
      version: '1.0.0',
      author: 'Your Name',
      license: 'MIT',
      github: { username: 'your-username', repo: path.basename(process.cwd()) },
      template: 'standard',
      badges: ['ci','npm','license','node'],
      features: ['Feature one','Feature two','Feature three'],
      usage: [{ command: 'npm start', description: 'Start the application' }],
    };

    if (opts.json) {
      fs.writeFileSync('readmeforge.json', JSON.stringify(defaultCfg, null, 2));
      console.log(`${G}✓ Created readmeforge.json${R}`);
    } else {
      const yaml = require('js-yaml');
      fs.writeFileSync('readmeforge.yml', yaml.dump(defaultCfg));
      console.log(`${G}✓ Created readmeforge.yml${R}`);
    }
    console.log(`Edit the config, then run: ${Y}node src/readmeforge.js generate${R}`);
  });

program
  .command('generate')
  .description('Generate README from config')
  .option('-c, --config <file>', 'Config file path')
  .option('-t, --template <name>', 'Template override (minimal/standard/cli/full/library)')
  .option('-o, --output <file>', 'Output file', 'README.md')
  .action((opts) => {
    const cfg = loadConfig(opts.config);
    if (!cfg) {
      console.error(`${Y}No config found. Run: node src/readmeforge.js init${R}`);
      process.exit(1);
    }

    const templateName = opts.template || cfg.template || 'standard';
    const template = TEMPLATES[templateName];
    if (!template) {
      console.error(`Unknown template: ${templateName}. Available: ${Object.keys(TEMPLATES).join(', ')}`);
      process.exit(1);
    }

    const content = template(cfg);
    fs.writeFileSync(opts.output, content, 'utf8');
    console.log(`${G}✓ Generated: ${opts.output} (${content.length} chars, template: ${templateName})${R}`);
  });

program
  .command('validate')
  .description('Validate a readmeforge config file')
  .option('-c, --config <file>', 'Config file path')
  .action((opts) => {
    const cfg = loadConfig(opts.config);
    if (!cfg) { console.error('No config found.'); process.exit(1); }
    const required = ['name', 'description'];
    const missing = required.filter(k => !cfg[k]);
    if (missing.length) {
      console.log(`${Y}Missing required fields: ${missing.join(', ')}${R}`);
    } else {
      console.log(`${G}✓ Config is valid!${R}`);
      console.log(`  Name: ${cfg.name}`);
      console.log(`  Template: ${cfg.template || 'standard'}`);
      console.log(`  Badges: ${(cfg.badges || []).join(', ')}`);
    }
  });

program
  .command('templates')
  .description('List available templates')
  .action(() => {
    console.log(`\n${BOLD}Available Templates:${R}\n`);
    const descs = {
      minimal:  'Simple name, description, install, license',
      standard: 'Full README with badges, features, usage, contributing',
      cli:      'CLI-focused with commands table and config section',
      full:     'Alias for standard — comprehensive documentation',
      library:  'Alias for standard — library/package focused',
    };
    for (const [name, desc] of Object.entries(descs)) {
      console.log(`  ${G}${name.padEnd(12)}${R}${desc}`);
    }
    console.log(`\nUsage: node src/readmeforge.js generate --template <name>\n`);
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) program.outputHelp();
