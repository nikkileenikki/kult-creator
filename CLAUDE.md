# Workflow conventions

- Always develop directly off `main` (fetch `origin/main`, branch from there, rebase onto it rather than reusing/stacking on old feature branches). Don't let branches accumulate — treat each PR's branch as disposable once merged.
- Never leave PR comments when merging (no ready-for-review notes, no "merged" comments, etc.) — this avoids triggering GitHub notification emails.
- Combine multiple changes into a single PR rather than opening a new PR per small fix — keep adding commits to the current open PR/branch until told to merge. Only merge one PR at a time.
- Don't spin up a local dev server (wrangler pages dev + D1 + Playwright) to verify changes — it's overkill and burns credits. Default to `npm run build` plus reading through the diff/generated output as the verification bar. Only fall back to the full local-server + browser loop when a change touches auth/permissions, data migrations, or something else a build pass genuinely can't catch, or when explicitly asked to visually confirm something in the browser.
