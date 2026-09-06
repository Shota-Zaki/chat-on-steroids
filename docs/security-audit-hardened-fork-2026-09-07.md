# Hardened Fork Security Audit — 2026-09-07

Repository: `Shota-Zaki/chat-on-steroids`

Upstream: `totec448-spec/chat-on-steroids`

Audit Baseline: upstreamと同一だったFork Commit `0f3ec7532b7d598275bf6ebf8f842495d8ab9284`

Working Branch: `work`

## 状態

このDocumentは、個人用Hardened Forkに対して実施したStatic Security ReviewとHardening変更を記録します。

**Runtime Verificationは未完了です。** このAudit中、Forkの`work` Branch / Draft PRに対するGitHub Actions Runを確認できず、`npm run verify`のPassも観測していません。本DocumentをRuntime Certificationとして扱わないでください。

## 要約

Fork固有の重大な問題を2件修正しました。

1. Fresh InstallでFile変更、Command、Desktop等の強力なPermissionが広く有効だった。
2. Runtime Update / Recovery Linkがupstream RepositoryをTrustしており、Hardened Fork Buildが将来upstream Artifactへ置換される可能性があった。

upstream実装には、File System Containment、MCP Transport Authentication、Secret Storage、Renderer Isolation、Update Checksum、Permission Revocationなど多くの防御が既に実装されており、これらは維持しています。

確認した範囲では、意図的なMalware、Credential Exfiltration、Remote Shell Backdoor、Hidden Privilege Elevationは確認されませんでした。ただし、未確認範囲を含め「存在しない」ことを証明するものではありません。

## 修正済み — H-01: Fresh Installの権限が広すぎる

### 修正前

新規ConfigではPortable Capabilityが広くON、Windows Desktop CapabilityもON、`readOnly = false`、Unattributed Multi-agent Callも許可されていました。

Userが明示的にPermissionを選ぶ前からFirst Launch Authorityが広すぎる状態でした。

### 修正後

Fresh Installは次の状態で開始します。

- `readOnly = true`
- 既存の保守的な`DEFAULT_CAPABILITIES`を利用
- browse / search / read / metadataのみON
- create / edit / move / delete / command / screen / control / clipboardはOFF
- Multi-agentはWorker 2つで利用可能だが、`allowUnattributedCalls = false`
- Migrationでは既存Userの明示的な保存済み選択を維持

### 対象File

- `src/main/config.ts`
- `test/config.test.ts`
- `test/feature-parity.test.ts`
- `README.md`
- `SECURITY.md`
- `AGENTS.override.md`

## 修正済み — H-02: Hardened Forkがupstreamへ自動Updateされる

### 修正前

以下のRuntime Pathが`totec448-spec/chat-on-steroids`へHard-codeされていました。

- Automatic Update Release API
- Installer / AppImage Download
- Companion Extension Recovery Download
- Manual Release Page

そのためHardened ForkからBuildしたBinaryでも、後からupstream Releaseを取得しFork固有Security変更を失う可能性がありました。

### 修正後

Runtime Release Trustを`src/shared/release.ts`へ一本化し、次を正本にしました。

`Shota-Zaki/chat-on-steroids`

upstreamへのAutomatic Fallbackは意図的に実装していません。Hardened Fork側に利用可能なReleaseがない場合、別Trust Sourceから置換せず現在Versionを維持します。

### 対象File

- `src/shared/release.ts`
- `src/main/update.ts`
- `src/main/version.ts`
- `src/shared/types.ts`
- `test/hardened-release-source.test.ts`

## 修正済み — H-03: 利用者向けUIの日本語化

Personal Forkの利用者向け表示を日本語へ統一しました。

### 日本語化対象

- Desktop RendererのNavigation / Setup / Settings / Usage / Permission / Toast / Status
- OS Native Tray Menu / Status / Finish Notification
- Chrome Extension Manifestの表示名・説明
- Chrome Extension Popup
- ExtensionがChatGPTへ追加する独自UI
- README / SECURITY / Fork固有運用Document

### 翻訳しない境界

正確性・互換性を維持するため以下は原文を保持します。

- User / Assistant Conversation本文
- Handoff / Task本文
- Folder名、Model名
- Tool引数・Tool Result本文
- Diagnostic Log
- `exec_command` / `write_stdin` / `session_finish`等のTool名
- API / IPC Identifier、Error Code、Protocol Field
- Model ID / Provider ID
- `NO_REPLY`等の機械契約
- ChatGPTへCopyする完全一致Contract Text

Regressionとして`test/japanese-ui.test.ts`を追加し、日本語化対象と保護対象の両方を固定しています。

## 確認済みの既存Security Control

### File System Boundary

`src/main/sandbox.ts`:

- Model-facing PathをApproved Virtual Rootから解決
- Containment判断前にReal PathをCanonicalize
- `..`、Null Byte、Control Character、不正Windows Pathを拒否
- Windows Device Name / Alternate Data Stream Syntaxを拒否
- Missing Path作成前に最深Existing Parentを検証
- Symlink / JunctionによるApproved Root Escapeを検出
- Approved Root自体が別Reparse Targetへ差し替えられた場合も検出

これはApplication-level ContainmentでありKernel / VM Sandboxではありません。同一User権限のFile System Raceは残る制約です。

### Command実行

`exec_command`は意図的に強力で、Approved Folder内へSandboxされません。

確認した実装では:

- Elevationを要求しない
- Non-shell PathではDirect Process Spawnを使用
- Execution / OutputをBound
- Child Environmentから既知のOpenAI / Cloudflare Control-plane Secretを除去

任意CommandがLogged-in OS User権限で実行されるため、`command`初期OFFが主要なSafety Boundaryです。

### MCP Transport

`src/main/mcp/server.ts`:

- `127.0.0.1`へBind
- Core / Desktopで別々のRandom 32-byte Secret Pathを生成
- Host / Originを検証
- Request BodyをSize Limit
- Surface TokenをLogへ出さない
- ChatGPTが古いTool ListをCacheしていてもLive Capabilityを再確認

### Desktop Control

Desktop Automationは独立したMCP Surfaceです。

- `observe` / mutating `computer` ActionをCapability Gate
- Live PermissionをOFFにするとCache済みToolも`TOOL_DISABLED`で拒否
- ChatGPT Worker / Prime Tabを誤操作しにくくするためBrowser Tab / Window Keyboard Chordを明示的に拒否

Desktop Authorityは有効化後Desktop全体に作用し、Folder Scopeではありません。

### Renderer / Electron Boundary

Main Windowは以下を使用します。

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- `webviewTag: false`
- `webSecurity: true`
- Restrictive CSP
- Navigation / RedirectのGlobal Deny
- `window.open` Deny
- Electron Permission RequestのDefault Deny

Rendererは任意Remote Web ContentではなくLocal Application Contentを読み込みます。

### Secret Storage

`src/main/secrets.ts`はElectron Async `safeStorage`を使用します。

- Windows: DPAPI
- macOS: Keychain
- Linux: ChromiumのInsecure `basic_text` / `v10` Fallbackを明示的に拒否
- Temporary File + RenameでSecret Write
- MutationをSerialize
- Malformed / Temporarily UndecryptableなStoreを空の権威あるStoreとして上書きしない

### External Native Binary

PackagingはExternal Native AssetをVersion Pin + SHA-256 Verifyします。

Audit時点:

- OpenAI `Tunnel Client`: `v0.0.14`
- ripgrep: `15.2.0`
- 対応OS / ArchitectureごとにSHA-256固定

Release Workflowの主要GitHub ActionもCommit SHA固定です。

## 残存Risk / Follow-up

### R-01 — Browser BridgeはLogged-in User BoundaryをTrust

Severity: **Medium / Design Trade-off**

Browser BridgeはLoopback-onlyでPairing後はAuthenticationされますが、初回Pairingはlocalhost RequesterへBridge Tokenを発行するDesignです。Origin PolicyはChrome Extension OriginとOrigin HeaderなしのLocal Requestを許可します。

MCP Authorityより範囲は狭く、BridgeにはFile / Command / Permission Mutation Routeがありません。ただし、同一OS Userとして既に実行中のMalicious Processや十分なPrivilegeを持つMalicious ExtensionはBrowser / Session Automation Surfaceへ作用できる可能性があります。

**Follow-up候補:** より強いLocal Separationが必要ならSilent First Pairingを明示User Approval / One-time Pairing Secretへ変更する。Fixed HeaderやPublic Extension IDだけをAuthenticationとして扱わない。

### R-02 — Detailed Session Historyは`safeStorage`暗号化対象外

Severity: **Medium / Privacy**

Session RecordingはTimeline、Compact & Resume、Agent AttributionのためFresh InstallでONです。Durable Transcript / Tool HistoryはLocal保存ですがCredential Storeと同じEncryption Boundaryではありません。

OS AccountへAccessできるProcess / Personから記録Sessionを読まれる可能性があります。

### R-03 — Release ArtifactがUnsigned / Unnotarized

Severity: **Medium / Supply-chain Assurance**

Windows ReleaseはPublisher署名されておらず、macOS ReleaseもNotarizeされていません。SHA-256 VerifyはPublished Manifestに対するIntegrityを確認しますが、Code Signing / Notarization相当のPublisher Identityは提供しません。

### R-04 — Linux AppImageの`--no-sandbox` Fallback

Severity: **Affected HostではMedium**

Unprivileged User Namespaceが無効なHostではAppImage Launcherが`--no-sandbox`へFallbackする場合があります。これを避けたいDebian / Ubuntu UserはDEBを推奨します。

### R-05 — `node-pty 1.2.0-beta.15`のWindows Regression Report

Severity: **Medium / Reliability。未再現**

Dependencyは`node-pty 1.2.0-beta.15`固定です。2026-08-18に、このBetaでPersistent Windows PTY Sessionが最初のWrite前に終了するというupstream Issueが報告されています。別IssueではConPTY Pipe FailureによりEmbedding Hostが終了する問題も報告されています。

Reference:

- https://github.com/microsoft/node-pty/issues/955
- https://github.com/microsoft/node-pty/issues/960

本Repositoryは`tty=true` Unified Execで`node-pty`を直接使用するため、`write_stdin` / Interactive Terminalに関連します。beta.14にも別のWindows ConPTY Error Handling Issueがあるため、Runtime再現なしで単純Downgradeはしていません。

### R-06 — Electron Patch Level

Severity: **Audit時点Low**

ProjectはElectron `43.4.1`をPinしています。Audit時に確認したSecurity Advisoryでは`43.4.1`をAffectedとするものは確認されませんでした。Electron Updateを行う場合はLockfileを再生成し、RepositoryのNative / Package Verification Matrixを実行してください。

## Verification状態

### 完了

- 修正前にFork / upstream HEAD同一を確認
- Exact upstream-equivalent Baselineから`work`作成
- Hardening後のStatic Diff Review
- 新Security Contractに合わせAdjacent Test更新
- Hardened Release Source Regression追加
- Japanese UI Boundary Regression追加
- README / SECURITYを実際のDefault / 日本語UI方針へ同期
- MCP / File System / Command / Desktop / Renderer / Secret / Update / Packaging BoundaryをStatic Review

### 未完了

- `npm run verify` — **実行成功を未確認**
- Windows Packaged Smoke — **未実行**
- macOS Packaged Smoke — **未実行**
- Linux Packaged Smoke — **未実行**
- Live MCP / Secure Tunnel Test — **未実行**
- Live Chrome Extension Pairing / Multi-agent Test — **未実行**
- `node-pty` Windows Regression再現 — **未実行**
- 日本語UIのPackaged実画面確認 — **未実行**

Audit時点でForkのDraft PR / `work` Branchに対するGitHub Actions Workflow Runは確認できませんでした。この状態はVerification Blockerであり、Pass / Failの証拠ではありません。

## このForkのRelease Gate

以下をすべて満たすまでHardened Fork Releaseを公開・Installしないこと。

1. ForkでGitHub Actionsを有効化する。
2. Exact Reviewed Commitで`npm run verify`がPassする。
3. Native Windows Packaging / SmokeがPassする。
4. 現在の`node-pty` Reportを考慮し、Windowsで`tty=true` + `write_stdin`を実際に検証する。
5. Built Releaseが`SHA256SUMS.txt`を公開し、Installer Hashを独立確認する。
6. Update / Manual Download / Extension Recoveryがすべて`Shota-Zaki/chat-on-steroids`配下であることをRegressionで確認する。
7. Desktop App / Tray / Notification / Chrome Extension Popup / ChatGPT Overlayの日本語表示をPackaged Buildで確認する。
