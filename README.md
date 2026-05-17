# aiaudit

Score pull request diffs for AI-generated content. CLI + GitHub Action.

## What it does

Given a `git diff` (or a GitHub PR URL), `aiaudit` returns a per-hunk likelihood that the changes were written by an AI assistant — Copilot, Cursor, Claude Code, etc. It posts an annotated comment on the PR with the top suspect hunks and the signals that flagged them.

## Why

- **Compliance**: some orgs need to log AI authorship for audit, IP, or training-data hygiene.
- **Review hygiene**: reviewers should know when they are reviewing AI output so they look harder at edge cases.
- **Metrics**: track AI adoption per repo, per developer, per language over time.

## Install

```bash
npm install -g aiaudit
```

## CLI

```bash
git diff main..HEAD | aiaudit
# aiaudit: 4 hunks, aggregate AI-likelihood 62%
#   src/auth.ts:14   85%  AI phrasing in 2 pattern(s), high comment ratio (40%)
#   src/users.ts:22  55%  long lines (avg 102 chars)

git diff main..HEAD | aiaudit --json > report.json
```

## GitHub Action

```yaml
# .github/workflows/aiaudit.yml
name: AI Content Audit
on: pull_request

jobs:
  audit:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: mukundakatta/aiaudit-action@v0
        with:
          base: ${{ github.event.pull_request.base.sha }}
          head: ${{ github.event.pull_request.head.sha }}
          comment: true
```

## How it scores

`aiaudit` ships two scorers, composable:

1. **Heuristic** (default, zero-dep, offline): comment density, line length, common AI phrasings, repetition.
2. **LLM** (optional, BYO key): per-hunk classification by a small fast model.

The aggregate score is confidence-weighted across hunks.

## Status

v0.1.0 — heuristic scorer + CLI + basic tests. LLM scorer + GitHub Action wrapper land next.

## License

MIT
