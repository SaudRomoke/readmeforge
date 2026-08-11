# readmeforge

[![CI](https://github.com/YOUR_USERNAME/readmeforge/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/readmeforge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/readmeforge.svg)](https://npmjs.com/package/readmeforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

> Generate beautiful, professional README files from a simple config file.

## Features

- 📋 **Config-driven** — Define your README in `readmeforge.yml`
- 🎨 **Multiple templates** — minimal, standard, full, library, cli
- 🛡️ **Auto badges** — CI, npm, license, coverage badges auto-generated
- 📊 **Smart sections** — Features, usage, API, contributing, FAQ
- ⚡ **Zero boilerplate** — One command, production-ready README

## Installation

```bash
npm install
```

## Quick Start

```bash
# Create a config file
node src/readmeforge.js init

# Generate README from config
node src/readmeforge.js generate

# Generate with a specific template
node src/readmeforge.js generate --template cli

# Validate your config
node src/readmeforge.js validate

# Preview all templates
node src/readmeforge.js templates
```

## Config Example (`readmeforge.yml`)

```yaml
name: my-awesome-tool
description: A tool that does amazing things
version: 1.0.0
author: Your Name
license: MIT
github:
  username: your-username
  repo: my-awesome-tool
template: standard
features:
  - Fast and lightweight
  - Zero dependencies
  - Cross-platform
badges:
  - ci
  - npm
  - license
usage:
  - command: "my-tool start"
    description: "Start the tool"
  - command: "my-tool --help"
    description: "Show help"
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the CLI |
| `npm test` | Run tests |
| `npm run tracker` | Show achievement progress |
| `npm run roadmap` | Show Day 1 → Month 1 roadmap |

## License

MIT © Your Name
