# AGENTS.md

This document defines the working conventions for contributors/agents in this fork.

## Branching Model

- `main`:
    - Keep this branch clean and close to `upstream/master` (or `upstream/main` if upstream changes).
    - Do not do feature development directly here.
- `integration/develop`:
    - This is the integrated working stack for finalized issue branches.
    - Use this as the base for new issue work unless there is a specific reason not to.
- Issue branches:
    - One branch per issue.
    - Naming examples:
        - `issue-220-worldcat-request`
        - `issue-258-preferences-mamplus-tab`
    - For fork-local issues, use a prefix:
        - `fork-issue-1-hide-shout-tools-in-fullscreen`

## Change Scope

- Prefer minimal diffs over broad refactors.
- Avoid unrelated cleanup in the same issue branch.
- Preserve existing naming and structure unless the issue requires otherwise.
- Before making changes, inspect `package.json`, TypeScript config, and lint/format settings for existing conventions.

## Finalize Flow (Required)

When asked to “finalize” an issue, do all of the following:

1. Commit changes on the issue branch.
2. Push the issue branch to `origin`.
3. Merge the issue branch into `integration/develop` using a non-fast-forward merge.
4. Run `npm run build` on `integration/develop`.
5. Run `npm run test:smoke` when feasible for behavior or UI changes.
6. Push `integration/develop`.
7. Return to `main`.

If merge conflicts are gnarly or behavior risk is high, stop after integration and request manual verification before pushing further.

## Testing Expectations

- For code changes:
    - Always run at least `npm run build`.
- For behavior changes:
    - Prefer updating or adding tests.
    - Run `npm run test:smoke` when the environment supports it.
- If you cannot run a test suite in the current environment, say so explicitly.

## Documentation Expectations

- User-facing behavior changes:
    - Update docs as part of the same issue before finalization.
- Pure backend refactors or bugfixes:
    - Doc updates are optional unless behavior or workflow changed.

## Wiki Handling

The wiki is a separate git repo.

- Local path: `/home/<user>/mam-plus.wiki`
- Working branch: `integration/develop-docs`

Keep wiki commits separate from code commits.
Push wiki updates to the wiki repo branch when relevant features are finalized.

### Wiki Setup / Update

Clone the wiki locally if needed:

```bash
git clone git@github.com:anonymooseJoy/mam-plus.wiki.git /home/<user>/mam-plus.wiki
cd /home/<user>/mam-plus.wiki
git checkout -b integration/develop-docs origin/integration/develop-docs || git checkout integration/develop-docs
```
