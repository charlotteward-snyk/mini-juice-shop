# Facilitator notes

## Baseline (verified 2026-10-26, `snyk test`)

- 294 dependencies, **252 unique vulnerabilities** (13 critical, 112 high, 118 medium, 9 low), 290 vulnerable paths
- 34 of 36 direct dependencies have at least one finding
- 19 vulnerabilities have no fixed version available
- `npm test`: 28/28 passing, ~1s. `npm install`: ~25s.

Re-run `snyk test` before the session. The vulnerability database moves, so counts will drift.

## Why this keeps an agent busy

Volume: dozens of independent direct upgrades plus transitive fixes, so there is a lot to triage, fix and re-verify.

Fixes that are not a simple version bump (the interesting ones for the agent):

| Dependency | Catch |
| --- | --- |
| `js-yaml` 3 -> 4 | `safeLoad` removed; `load` is now the safe call (`src/routes/admin.js`) |
| `marked` 0.3.5 -> 4+ | `sanitize` option removed, so feedback XSS test fails until output is sanitised (`sanitize-html` is already a dependency) |
| `express-jwt` 5 -> 6 | `algorithms` option becomes mandatory; app throws at startup otherwise (`src/auth.js`) |
| `xmldom` | Fixed only in the renamed `@xmldom/xmldom` package |
| `request` | Deprecated, no fixed version. Must be replaced (axios or node-fetch are already present) |
| `crypto-js` 3 -> 4 | Different default hasher; password hash is computed at runtime so tests still pass, but it is a behaviour change |
| `jsonwebtoken` 8 -> 9, `multer` 1 -> 2, `axios` 0.x -> 1.x, `pug` 2 -> 3, `sanitize-html` 1 -> 2, `tar` 4 -> 6+ (not yet exercised: these were not applied to check them), `adm-zip` 0.4 -> 0.5 | Major bumps with small API or option changes |
| `dot-prop` | Latest majors are ESM-only; the agent needs to pick a CJS-compatible version |
| `adm-zip` 0.4.7 | Cannot write zips on modern Node; test fixture builds its own zip so the baseline is green |

## Running for ~30 people

- Each participant works in their own fork, so there is no shared state and no conflicts.
- Nothing needs network access at test time (outbound-HTTP tests use a local stub server), only `npm install` does.
- To reset a fork: `git fetch upstream && git reset --hard upstream/main && git push -f`.
- Token usage scales with how many findings each agent attempts, so cap or widen the scope in the agent's prompt rather than editing the repo.
