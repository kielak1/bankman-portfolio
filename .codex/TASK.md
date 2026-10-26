# Bankman — current Codex dispatch

dispatch_id: BANKMAN-20261026-002
repository: kielak1/bankman-portfolio
status: approved
issues: #26
scope: Audit and rationalize stale Dependabot PRs, GitHub CI and Vercel statuses; close only verified fully superseded/duplicate dependency PRs; no application changes, merges or deployments.
authorized_by: owner-via-ChatGPT
claim: none
result: pending
email: pending

## Execution authorization

The owner approved systematic Bankman maintenance and Codex execution of the initial cleanup review via the established `bankman` command. Proceed **only when the owner invokes `bankman` in this repository**. The work and acceptance criteria are in https://github.com/kielak1/bankman-portfolio/issues/26.

Before starting:
- Fetch current `origin/main` and `origin/codex-control`.
- Read the current `main:AGENTS.md`, `main:docs/CODEX_WORKFLOW.md`, `main:docs/MAINTENANCE.md` and Issue #26, including comments.
- Confirm Issue #26 is still open and this exact dispatch is still approved.
- Claim the dispatch using version-checked concurrency control `approved → claimed` before any mutating action.

Permitted:
- Read GitHub PRs, main, dependency state, CI, Vercel status (where available) and relevant public release/security information.
- Publish findings to Issue #26.
- Close **only** Dependabot PRs proven redundant because already incorporated on main or superseded for the same dependency; add a factual explanatory comment to each before closure and document the evidence. If uncertain leave them open.
- Use existing local `/usr/bin/msmtp -t` once to email a sanitized summary to `tadeusz@kielak.com`, including report URL and mail acceptance status.

Prohibited:
- Do not merge any PR, commit application changes, update dependencies, modify production, reset leaderboards, access secrets, alter pipelines or deploy to Vercel.
- Do not close Issue #24 or #26. Keep Issue #26 in owner-review state until explicitly accepted.
- Do not execute unrelated issues or any PKO/bank workflows.
- Do not repeat an already reported execution or resend the email.

On completion, post a full report in Issue #26 with current PR inventory, verified PR dispositions, CI/Vercel observations, omissions/risks, exact actions actually taken, and email transport outcome. Update this control record as `reported` (or `blocked` if unable to safely complete). If mail fails, transparently record `email: failed`. No claim of inbox delivery from `msmtp` acceptance.
