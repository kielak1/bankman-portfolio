# Bankman — current Codex dispatch

dispatch_id: BANKMAN-20261026-001
repository: kielak1/bankman-portfolio
status: claimed
issues: #24
scope: Verify the one-word Bankman execution protocol, GitHub Issue reporting and local msmtp email reporting; do not change application code.
authorized_by: owner-via-ChatGPT
claim: codex-d80be2f8-2ecf-4010-9f13-f83faf328df3 at 2026-10-26T06:20:49Z
result: pending
email: pending

## Owner-authorized scope

Process Issue https://github.com/kielak1/bankman-portfolio/issues/24 only. Read the issue, `main:AGENTS.md`, and `main:docs/CODEX_WORKFLOW.md` before executing. This is a **communication smoke test**: no application source modifications, no feature deployment, no access to production data, no credential changes, and no PKO/bank interaction.

On invocation `bankman`:

1. Verify this exact dispatch is still `approved` and Issue #24 is open.
2. Atomically claim the current revision (`status: claimed`; record run identity/timestamp).
3. Post a complete report with `dispatch_id` and `Status: review` to Issue #24. If you cannot execute or cannot authenticate to GitHub, mark `blocked` and explain without forging results.
4. Send the concise public/sanitized plaintext summary via the **existing local** `/usr/bin/msmtp -t` to `tadeusz@kielak.com`. Record transport exit status or the reason sending could not be attempted. Do not install mail tools or expose credentials.
5. Update the dispatch to `reported` when the task/report is complete (or `blocked` when execution is blocked). Record the GitHub report URL, `email: accepted-by-msmtp` or `email: failed`.
6. Do **not** close Issue #24; it waits for the owner's acceptance. Do **not** touch any other Issue, dependency PR, application runtime, production environment, or external project.

## Execution guard

This dispatch is single-use. After `reported` or `blocked`, a repeat `bankman` must **not** resend mail or repeat side effects. ChatGPT prepares any later owner-approved dispatch under a new ID.
