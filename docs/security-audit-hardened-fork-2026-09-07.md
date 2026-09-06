# Hardened Fork Security Audit — 2026-09-07

Repository: `Shota-Zaki/chat-on-steroids`

Upstream: `totec448-spec/chat-on-steroids`

Audit baseline: upstream-equivalent fork commit `0f3ec7532b7d598275bf6ebf8f842495d8ab9284`

Working branch: `work`

## Status

This document records a static security review and the hardening changes applied to the personal fork.

**Runtime verification is not complete.** GitHub Actions had not produced a run for the fork's `work` branch / draft PR during this audit, and `npm run verify` was therefore not observed passing. Do not treat this document as a runtime certification.

## Executive summary

Two fork-specific security problems were fixed:

1. Fresh installs inherited powerful mutation, command and desktop permissions by default.
2. Runtime update/recovery links trusted the upstream repository, so a hardened fork build could later replace or redirect itself back to upstream artifacts.

The existing upstream implementation already contains substantial defensive controls around filesystem containment, MCP transport authentication, secret storage, renderer isolation, update checksums and permission revocation. Those controls were preserved.

No deliberate malware, credential exfiltration path, remote shell backdoor or hidden privilege-elevation mechanism was identified in the reviewed paths. This is not proof that none exists outside the reviewed paths.

## Fixed — H-01: permissive fresh-install authority

### Previous behavior

A new config enabled the portable capability set broadly, enabled Windows Desktop capabilities, started with `readOnly = false`, and permitted unattributed multi-agent calls.

That meant first-launch authority was broader than necessary before the user had made an explicit permission decision.

### Hardened behavior

Fresh installs now:

- start with `readOnly = true`;
- use the existing conservative `DEFAULT_CAPABILITIES` baseline;
- enable only browse, search, read and metadata capabilities;
- leave create, edit, move, delete, command, screen, control and clipboard capabilities off;
- keep multi-agent available with two workers, but start `allowUnattributedCalls = false`;
- preserve existing users' explicit stored choices during migration.

### Files

- `src/main/config.ts`
- `test/config.test.ts`
- `test/feature-parity.test.ts`
- `README.md`
- `SECURITY.md`
- `AGENTS.override.md`

## Fixed — H-02: hardened fork could update back to upstream

### Previous behavior

The following runtime paths were hard-coded to `totec448-spec/chat-on-steroids`:

- automatic update release API;
- automatic installer/AppImage asset downloads;
- companion-extension recovery download;
- manual release page link.

A binary built from the hardened fork could therefore later consume an upstream release and lose fork-specific security changes.

### Hardened behavior

All runtime release trust is centralized in `src/shared/release.ts` and points to:

`Shota-Zaki/chat-on-steroids`

There is deliberately no automatic fallback to upstream. If the hardened fork has no usable release, the current installation remains in place rather than replacing itself from a different trust source.

### Files

- `src/shared/release.ts`
- `src/main/update.ts`
- `src/main/version.ts`
- `src/shared/types.ts`
- `test/hardened-release-source.test.ts`

## Verified existing controls

### Filesystem boundary

`src/main/sandbox.ts`:

- maps model-facing paths through approved virtual roots;
- canonicalizes real paths before containment decisions;
- rejects `..`, null bytes, control characters and unsafe Windows path forms;
- rejects Windows device names and alternate-data-stream syntax;
- checks the deepest existing parent before creating a missing path;
- detects symlink/junction escapes from approved roots;
- detects replacement of an approved root with a different reparse target.

This is application-level containment, not a kernel/VM sandbox. Same-user filesystem races remain a stated limitation.

### Command execution

`exec_command` is intentionally powerful and is **not** confined to approved folders.

Reviewed execution code:

- does not request elevation;
- uses direct process spawning for non-shell execution paths;
- bounds execution/output behavior;
- removes known OpenAI/Cloudflare control-plane secrets from inherited child environments.

Because arbitrary commands run as the logged-in OS user, keeping `command` disabled by default is the primary safety boundary.

### MCP transport

`src/main/mcp/server.ts`:

- binds to `127.0.0.1`;
- creates separate random 32-byte secret paths for Core and Desktop surfaces;
- validates Host and Origin;
- limits request bodies;
- keeps surface tokens out of logs;
- rechecks live capabilities even when ChatGPT has cached an older tools list.

### Desktop control

Desktop automation is a separate MCP surface.

- `observe` and mutating `computer` actions are capability-gated;
- disabling a live permission causes cached tools to return `TOOL_DISABLED` rather than execute;
- browser tab/window keyboard chords are explicitly refused to reduce the risk of closing or steering ChatGPT worker/prime tabs.

Desktop authority remains desktop-wide once enabled; it is not folder-scoped.

### Renderer / Electron boundary

The main application window uses:

- `contextIsolation: true`;
- `nodeIntegration: false`;
- `sandbox: true`;
- `webviewTag: false`;
- `webSecurity: true`;
- a restrictive Content Security Policy;
- global navigation and redirect denial;
- `window.open` denial;
- a default-deny Electron permission request handler.

The app renderer loads local application content rather than arbitrary remote web content.

### Secret storage

`src/main/secrets.ts` uses Electron asynchronous `safeStorage`.

- Windows: OS-backed protection via DPAPI.
- macOS: Keychain-backed protection.
- Linux: insecure Chromium `basic_text` / `v10` fallback is explicitly rejected.
- secret writes use a temporary file and rename boundary;
- mutations are serialized;
- malformed or temporarily undecryptable storage is not treated as permission to overwrite the encrypted store.

### External native binaries

Packaging pins and checksum-verifies native external assets.

At audit time:

- OpenAI `tunnel-client` pin: `v0.0.14`, matching the current upstream release observed during audit;
- ripgrep pin: `15.2.0`, matching the current upstream release observed during audit;
- each supported OS/architecture target has a pinned SHA-256.

The release workflow also pins major GitHub Actions by commit SHA.

## Residual risks / follow-up

### R-01 — Browser bridge trusts the logged-in-user boundary

Severity: **Medium / design trade-off**

The browser bridge is loopback-only and authenticated after pairing, but first pairing intentionally allows a requester on localhost to obtain a bridge token. The Origin policy accepts Chrome extension origins and requests without an Origin header.

Consequences are narrower than MCP authority: the bridge does not expose filesystem, command or permission-mutation routes. However, a malicious process already running as the same OS user, or a sufficiently privileged malicious browser extension, may interact with browser/session automation surfaces.

The upstream design explicitly treats same-user local processes as inside this bridge trust boundary.

**Follow-up option:** replace silent first pairing with explicit user approval / a one-time pairing secret if stronger local separation is required. Do not implement a weak fixed header or public extension ID and call it authentication.

### R-02 — Detailed session history is not encrypted by `safeStorage`

Severity: **Medium / privacy**

Session recording is on by default and enables timeline, Compact & Resume and agent attribution. The durable transcript/tool history is local but is not protected with the credential-store encryption boundary.

A process or person with access to the user's OS account may be able to read recorded sessions.

### R-03 — Unsigned / unnotarized release artifacts

Severity: **Medium / supply-chain assurance**

Windows release binaries are not publisher-signed and macOS releases are not notarized. SHA-256 verification protects integrity relative to the published release manifest, but does not establish a publisher identity equivalent to code signing/notarization.

### R-04 — Linux AppImage may use `--no-sandbox`

Severity: **Medium on affected hosts**

The AppImage launcher can fall back to `--no-sandbox` when unprivileged user namespaces are disabled. Debian/Ubuntu users should prefer the DEB when that fallback is undesirable.

### R-05 — `node-pty 1.2.0-beta.15` has open Windows regression reports

Severity: **Medium / reliability, not yet reproduced here**

The dependency is pinned to `node-pty 1.2.0-beta.15`. An upstream issue opened 2026-08-18 reports that this specific beta can terminate persistent Windows PTY sessions before the first write, while another open issue reports ConPTY pipe failures that can terminate the embedding host.

References:

- https://github.com/microsoft/node-pty/issues/955
- https://github.com/microsoft/node-pty/issues/960

This repository uses `node-pty` directly for `tty=true` unified-exec sessions, so the reports are relevant to `write_stdin` / interactive terminal behavior. No downgrade is made in this audit because beta.14 also has an open Windows ConPTY error-handling report and runtime reproduction has not yet been performed against this application.

### R-06 — Electron patch level can move independently of app releases

Severity: **Low at audit time**

The project pins Electron `43.4.1`. The Electron security advisories reviewed during this audit targeted older major/minor ranges and did not identify `43.4.1` as affected. Newer Electron 43.x maintenance releases exist and contain additional bug fixes.

Do not upgrade Electron without regenerating the lockfile and running the repository's full native/package verification matrix.

## Verification status

### Completed

- Fork/upstream HEAD equality verified before modification.
- `work` branch created from the exact upstream-equivalent baseline.
- Static diff review performed after hardening changes.
- Existing adjacent tests updated to encode the new security contract.
- Dedicated hardened release-source regression added.
- README and SECURITY documentation aligned with effective defaults.
- Major MCP, filesystem, command, Desktop, renderer, secret-storage, update and packaging boundaries reviewed statically.

### Not completed

- `npm run verify` — **not observed running**.
- Windows packaged smoke test — **not run**.
- macOS packaged smoke test — **not run**.
- Linux packaged smoke test — **not run**.
- Live MCP / Secure Tunnel test — **not run**.
- Live Chrome extension pairing / multi-agent test — **not run**.
- `node-pty` Windows regression reproduction — **not run**.

At audit time, GitHub Actions had not produced a workflow run for the fork's draft PR / `work` branch. This is a verification blocker, not evidence that the changes pass or fail.

## Release gate for this fork

Do not publish or install a hardened-fork release until all of the following are true:

1. GitHub Actions is enabled for the fork.
2. `npm run verify` passes on the exact reviewed commit.
3. Native Windows packaging/smoke checks pass.
4. `tty=true` + `write_stdin` is exercised on Windows because of the current `node-pty` reports.
5. The built release publishes `SHA256SUMS.txt` and the installer checksum is independently checked.
6. The release source regression confirms that update, manual download and extension recovery all remain under `Shota-Zaki/chat-on-steroids`.
