# Hardened fork overrides

This repository is the hardened personal fork of `totec448-spec/chat-on-steroids`.

## Source of truth

- Read `AGENTS.md` as the upstream architecture and incident-history design record when working in an affected subsystem.
- The rules in this file override conflicting upstream statements about shipped defaults and local branch policy.
- Preserve upstream behavior unless a change is required for security hardening, a verified bug, or an explicitly approved fork requirement.

## Branch policy

- Use the `work` branch for all implementation, tests, audits, and documentation changes.
- Do not write directly to `main`.
- Keep `main` as the reviewed integration baseline.

## Hardened fresh-install baseline

Fresh installs must fail safe:

- `readOnly = true`.
- Only the existing conservative `DEFAULT_CAPABILITIES` baseline is enabled: browse, search, read, and metadata.
- File mutation, command execution, screen/control, and clipboard capabilities are opt-in.
- Multi-agent may remain enabled with the upstream worker limit, but `allowUnattributedCalls = false` by default.
- Never turn a missing, corrupt, or newly introduced setting into permission consent.
- Existing users' explicit stored permission choices must be preserved during migration unless a separate migration is explicitly approved.

## Security boundaries

- `exec_command` is arbitrary code execution as the logged-in OS user and is not contained by approved folders. Treat enabling `command` as a high-risk permission grant.
- Desktop control is desktop-wide, not folder-scoped. Keep screen, control, and clipboard capabilities off until explicitly enabled.
- Caller identity is fail-closed. Do not infer identity from active tabs, timing, ordering, model-supplied identifiers, or other heuristics when the extension cannot prove the caller.
- File tools remain constrained to approved roots, but application path checks are not an OS/kernel sandbox.
- Tunnel URLs, bridge tokens, API keys, and other credentials must never be logged or committed.

## Change discipline

For security-sensitive changes:

1. Reproduce or pin the unsafe behavior with a deterministic regression.
2. Fix the earliest responsible boundary with the smallest coherent change.
3. Update existing tests rather than adding duplicate coverage when practical.
4. Re-run the nearest regression, adjacent boundary tests, and `npm run verify` before declaring the change complete.
5. Keep README/SECURITY documentation aligned with the effective permission model.

Do not claim a test or verification passed unless the command actually ran and its result was observed.
