# Contributing to PhishLab

## Branching model
- `main`: stable / release
- `dev`: integration branch
- `feat/<topic>`: new features
- `fix/<topic>`: bug fixes
- `chore/<topic>`: tooling, CI, docs

## Workflow
1. Create a branch from `dev`
2. Commit with conventional prefixes (see below)
3. Open a PR into `dev`
4. CI must pass
5. At least 1 approval is required
6. Merge with **Squash and merge** (preferred)

## Commit message convention
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

Examples:
- `feat: add campaign builder screen`
- `fix: prevent tracking server crash on invalid token`

## Code quality (required)
### Rust (src-tauri)
- `cargo fmt --all`
- `cargo clippy --all-targets --all-features -- -D warnings`
- `cargo test`

### Frontend (React)
- `npm run lint`
- `npm run build`

## Secrets
Never commit secrets (SMTP passwords, API keys). Use `.env` files and document required env vars in `README.md`.

## PR rules
- One topic per PR
- Keep PRs small when possible
- Add screenshots for UI changes
- Link an Issue if available
