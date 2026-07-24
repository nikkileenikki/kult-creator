# Workflow conventions

- Always develop directly off `main` (fetch `origin/main`, branch from there, rebase onto it rather than reusing/stacking on old feature branches). Don't let branches accumulate — treat each PR's branch as disposable once merged.
- Never leave PR comments when merging (no ready-for-review notes, no "merged" comments, etc.) — this avoids triggering GitHub notification emails.
- Combine multiple changes into a single PR rather than opening a new PR per small fix — keep adding commits to the current open PR/branch until told to merge. Only merge one PR at a time.
