# aiaudit — 11-day plan to DevNetwork submission

**Target:** DevNetwork [AI+ML] Hackathon 2026 — https://devnetwork-ai-ml-hack-2026.devpost.com/
**Deadline:** May 28, 2026 10:00 AM PDT
**Prize target:** Overall AI track + TrueFoundry $1.5K challenge (LLMOps angle)

## Days 1–2 (May 17–18) — Core (THIS SESSION)

- [x] Scaffold repo, package.json, tsconfig, MIT license
- [x] `parseDiff` — unified diff parser, file + hunk extraction
- [x] `heuristicScorer` — zero-dep AI phrasing / comment density / line length detection
- [x] `auditDiff` — composer that aggregates per-hunk confidence-weighted score
- [x] CLI with stdin / `--file` / `--json` modes
- [x] Tests for diff parser, heuristic scorer, audit composer
- [x] CI workflow (test on push/PR)
- [ ] Run `npm install` + `npm test` locally to confirm green

## Day 3 (May 19) — LLM scorer

- [ ] `llmScorer` factory accepting a callable `(prompt: string) => Promise<string>` (BYO LLM)
- [ ] Anthropic adapter using `@anthropic-ai/sdk` (claude-haiku-4-5 for speed/cost)
- [ ] Per-hunk prompt template: "is this hunk likely written by an AI assistant? return JSON {score:0-1, reasoning:string}"
- [ ] Retry + JSON repair on parse failure
- [ ] Cost cap: short-circuit if hunk > N tokens, skip if estimated cost > budget

## Day 4 (May 20) — GitHub Action wrapper

- [ ] `action.yml` definition (inputs: base sha, head sha, comment bool, model)
- [ ] Action runs the CLI on the diff between base and head
- [ ] If `comment: true`, post a PR comment with the top 5 suspects + aggregate score
- [ ] Comment idempotency: update existing aiaudit comment, don't spam
- [ ] Dist build via `@vercel/ncc` so the action is single-file

## Day 5 (May 21) — TrueFoundry integration (challenge fit)

- [ ] Optional `--truefoundry` scorer that proxies the LLM call through TrueFoundry's LLM Gateway
- [ ] README section: "Why TrueFoundry: centralized auth + cost tracking + rate limiting for LLM scoring at fleet scale"
- [ ] One-line install snippet for TrueFoundry users

## Day 6 (May 22) — Demo + publish

- [ ] Publish to npm as `aiaudit` (user runs `npm publish` with their OTP)
- [ ] Publish action to GitHub Marketplace
- [ ] Set up demo repo: open a PR with mixed human + AI code, action posts comment
- [ ] Screenshot the comment for README

## Day 7 (May 23) — Demo video

- [ ] 2-minute screencast: install -> run on real PR -> see action comment
- [ ] Voiceover or captions, no em dashes
- [ ] Upload to YouTube unlisted

## Day 8 (May 24) — Submission writeup

- [ ] Devpost submission draft: inspiration, what it does, how we built it, challenges, what's next
- [ ] Lead with the "compliance + review hygiene" framing — judges respond to use cases more than tech
- [ ] Add TrueFoundry challenge writeup as separate submission section

## Day 9–10 (May 25–26) — Polish + buffer

- [ ] React to early adopter feedback (if any)
- [ ] Fix any submission-rule details we missed
- [ ] Add a "limitations" section so judges trust the project

## Day 11 (May 27) — Submit

- [ ] Final check: tests green, README clean, demo link works
- [ ] User: log into Devpost, navigate to submission form
- [ ] I drive form-filling via Chrome MCP, stop before final Submit
- [ ] User clicks Submit
- [ ] **Print the submission URL for the record**

## Blockers user must handle

- Devpost account + join the DevNetwork hackathon
- Anthropic API key for LLM scorer (in env, never committed)
- TrueFoundry account (free tier OK?) for the challenge integration
- npm 2FA OTP at publish time (via 1Password per CLAUDE.md)
- GitHub PAT with PR-comment scope (for the demo run)

## What we're NOT building (scope discipline)

- Multi-language support beyond what regex/heuristics already give us
- Web UI / dashboard — judges score the action + CLI demo, dashboard is over-build
- Bedrock / Gemini / OpenAI adapters in v0.1 — Anthropic + BYO is enough
- Training a custom classifier — heuristic + LLM is shippable, training is not
