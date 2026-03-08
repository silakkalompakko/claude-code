# CLAUDE.md — Claude Code Repository Guide

This file provides context for AI assistants working in this repository.

## Repository Overview

This is the **public-facing repository for [Claude Code](https://claude.ai/code)** — Anthropic's agentic coding tool. The repository does **not** contain the Claude Code application source code (that is closed-source). Instead, it contains:

- **Documentation** (README, CHANGELOG, SECURITY)
- **Official plugins** — reusable extensions with commands, agents, hooks, and skills
- **Example configurations** — settings profiles and hook examples
- **GitHub automation scripts** — TypeScript scripts for issue lifecycle management
- **DevContainer setup** — PowerShell script for running Claude Code in containers

## Directory Structure

```
claude-code/
├── README.md                    # Product overview and installation instructions
├── CHANGELOG.md                 # Version history with bug fixes and features
├── SECURITY.md                  # Vulnerability disclosure via HackerOne
├── LICENSE.md                   # License
├── demo.gif                     # Product demo animation
│
├── plugins/                     # Official Claude Code plugins
│   ├── README.md                # Plugin system overview and installation
│   ├── agent-sdk-dev/           # Agent SDK scaffolding and verification
│   ├── claude-opus-4-5-migration/ # Model migration automation
│   ├── code-review/             # Automated PR review with parallel agents
│   ├── commit-commands/         # Git workflow automation (/commit, /commit-push-pr, /clean_gone)
│   ├── explanatory-output-style/ # Educational session hook
│   ├── feature-dev/             # 7-phase structured feature development
│   ├── frontend-design/         # Design-focused frontend skill
│   ├── hookify/                 # Hook creation and management
│   ├── learning-output-style/   # Interactive learning mode hook
│   ├── plugin-dev/              # Plugin development toolkit
│   ├── pr-review-toolkit/       # Multi-agent PR review specialists
│   ├── ralph-wiggum/            # Iterative self-referential AI loops
│   └── security-guidance/       # Security reminder PreToolUse hook
│
├── examples/
│   ├── hooks/
│   │   └── bash_command_validator_example.py  # PreToolUse hook example
│   └── settings/
│       ├── README.md
│       ├── settings-lax.json    # Permissive org settings
│       ├── settings-strict.json # Restrictive org settings
│       └── settings-bash-sandbox.json  # Sandboxed bash settings
│
├── scripts/                     # GitHub issue automation (run with bun)
│   ├── issue-lifecycle.ts       # Lifecycle labels, timeouts, and messages
│   ├── lifecycle-comment.ts     # Post lifecycle nudge comments
│   ├── sweep.ts                 # Mark stale/autoclose issues
│   ├── auto-close-duplicates.ts # Close duplicate issues
│   ├── backfill-duplicate-comments.ts
│   ├── comment-on-duplicates.sh
│   ├── edit-issue-labels.sh
│   └── gh.sh                   # Restricted gh CLI wrapper (read-only: view/list/search)
│
└── Script/
    └── run_devcontainer_claude_code.ps1  # Windows DevContainer setup (Docker/Podman)
```

## Plugin System

### Plugin Structure

Every plugin follows this directory convention:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Metadata: name, description, version, author
├── commands/                # Slash commands (.md files)
├── agents/                  # Specialized agents (.md files)
├── skills/                  # Agent skills (.md files)
├── hooks/                   # Event handlers (Python/shell scripts + hooks.json)
└── README.md                # Plugin documentation
```

### Hook Exit Codes

When writing PreToolUse/PostToolUse hooks in Python:
- **Exit 0**: Allow the tool call to proceed
- **Exit 1**: Show stderr to the user only (tool proceeds)
- **Exit 2**: Block the tool call and show stderr to Claude (and the user)

### Available Plugins

| Plugin | Commands | Description |
|--------|----------|-------------|
| `agent-sdk-dev` | `/new-sdk-app` | Scaffold and verify Agent SDK projects |
| `claude-opus-4-5-migration` | — | Migrate model strings and prompts to Opus 4.5 |
| `code-review` | `/code-review [--comment]` | Multi-agent PR review with confidence scoring (threshold: 80) |
| `commit-commands` | `/commit`, `/commit-push-pr`, `/clean_gone` | Git workflow automation |
| `explanatory-output-style` | — | SessionStart hook for educational insights |
| `feature-dev` | `/feature-dev` | 7-phase guided feature development workflow |
| `frontend-design` | — | Skill for bold, distinctive UI design |
| `hookify` | `/hookify`, `/hookify:list`, `/hookify:configure` | Create and manage custom hooks |
| `learning-output-style` | — | SessionStart hook for interactive learning |
| `plugin-dev` | `/plugin-dev:create-plugin` | 8-phase plugin creation workflow |
| `pr-review-toolkit` | `/pr-review-toolkit:review-pr` | 6 specialized review agents |
| `ralph-wiggum` | `/ralph-loop`, `/cancel-ralph` | Iterative AI loops via Stop hook |
| `security-guidance` | — | PreToolUse hook for 9 security patterns |

## Scripts

Scripts are TypeScript files run with **bun** (not Node.js). They require a `GITHUB_TOKEN` environment variable.

### Issue Lifecycle (`scripts/issue-lifecycle.ts`)
Single source of truth for lifecycle labels and timeouts:
- `invalid` → 3 days → auto-close
- `needs-repro` → 7 days → nudge comment
- `needs-info` → 7 days → nudge comment
- `stale` → 14 days → close
- `autoclose` → 14 days → close
- Issues with ≥10 upvotes are exempt from stale closure (`STALE_UPVOTE_THRESHOLD`)

### gh.sh Wrapper
A restricted `gh` CLI wrapper that only permits read-only operations:
- `gh.sh issue view <number>`
- `gh.sh issue list`
- `gh.sh search issues <query>`
- `gh.sh label list`

Requires `GH_REPO` or `GITHUB_REPOSITORY` in `owner/repo` format.

## Settings Profiles (`examples/settings/`)

Three pre-built organization settings profiles:

| Profile | Purpose |
|---------|---------|
| `settings-lax.json` | Disables dangerous flags; blocks plugin marketplaces |
| `settings-strict.json` | Adds hook/permission blocks and tool denials |
| `settings-bash-sandbox.json` | Forces bash to run inside a sandbox container |

Settings apply at different hierarchy levels; some properties (e.g. `strictKnownMarketplaces`, `allowManagedHooksOnly`) only take effect in enterprise/managed settings.

## Key Conventions

### Documentation
- Keep READMEs comprehensive with usage examples, workflow integration, and troubleshooting sections
- CHANGELOG entries describe user-visible changes grouped by version (format: `## X.Y.Z`)
- Plugin READMEs must document all commands, agents, and hooks with trigger examples

### Plugins
- Each plugin must have `.claude-plugin/plugin.json` with `name`, `description`, `version`, `author`
- Commands are markdown files in the `commands/` directory
- Agents are markdown files in the `agents/` directory
- Hooks must have a `hooks.json` manifest alongside the hook scripts
- Python hooks read JSON from stdin and use exit codes 0/1/2

### Git
- Commit messages use `chore:` prefix for CHANGELOG updates
- PR merges use standard GitHub merge commits
- Branch naming: `claude/<description>-<session-id>` for AI-authored branches

### Scripts
- Run TypeScript scripts with `bun`, not `node` or `ts-node`
- All GitHub API access requires `GITHUB_TOKEN` environment variable
- Use `--dry-run` flag when testing sweep/lifecycle scripts

## External Resources

- [Claude Code Documentation](https://code.claude.com/docs/en/overview)
- [Plugin System Docs](https://docs.claude.com/en/docs/claude-code/plugins)
- [Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk/overview)
- [Settings Reference](https://code.claude.com/docs/en/settings)
- [Hooks Reference](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Bug Reports](https://github.com/anthropics/claude-code/issues)
- [Security Vulnerabilities](https://hackerone.com/anthropic-vdp/reports/new?type=team&report_type=vulnerability)
- [Discord Community](https://anthropic.com/discord)
