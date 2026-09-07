# Hardened Fork Security Audit — 2026-09-07

Repository: `Shota-Zaki/chat-on-steroids`

Upstream: `totec448-spec/chat-on-steroids`

Audit Baseline: upstreamと同一だったFork Commit `0f3ec7532b7d598275bf6ebf8f842495d8ab9284`

Working Branch: `work`

## 状態

このDocumentは、個人用Hardened Forkに対して実施したStatic Security ReviewとHardening変更を記録します。

**Runtime Verificationは未完了です。** このForkではGitHub Actionsを使用しません。`npm run verify`、Package / Smoke Test、Windows実機確認は対象CommitをLocal Checkoutして実行し、その実行結果をVerificationの正本とします。本DocumentをRuntime Certificationとして扱わないでください。

## 要約

Fork固有の重大な問題を2件修正しました。

1. Fresh InstallでFile変更、Command、Desktop等の強力なPermissionが広く有効だった。
2. Runtime Update / Recovery Linkがupstream RepositoryをTrustしており、Hardened Fork Buildが将来upstream Artifactへ置換される可能性があった。

upstream実装には、File System Containment、MCP Transport Authentication、Secret Storage、Renderer Isolation、Update Checksum、Permission Revocationなど多くの防御が既に実装されており、これらは維持しています。

確認した範囲では、意図的なMalware、Credential Exfiltration、Remote Shell Backdoor、Hidden Privilege Elevationは確認されませんでした。ただし、未確認範囲を含め「存在しない」ことを証明するものではありません。

## 修正済み — H-01: Fresh Installの権限が広すぎる

Fresh Installは次の状態で開始します。

- `readOnly = true`
- 既存の保守的な`DEFAULT_CAPABILITIES`を利用
- browse / search / read / metadataのみON
- create / edit / move / delete / command / screen / control / clipboardはOFF
- Multi-agentはWorker 2つで利用可能だが、`allowUnattributedCalls = false`
- Migrationでは既存Userの明示的な保存済み選択を維持

## 修正済み — H-02: Hardened Forkがupstreamへ自動Updateされる

Runtime Release Trustを`src/shared/release.ts`へ一本化し、`Shota-Zaki/chat-on-steroids`を正本にしました。upstreamへのAutomatic Fallbackは実装していません。

## 修正済み — H-03: 利用者向けUIの日本語化

Desktop App、OS Native Tray / Notification、Chrome Extension、README / SECURITY等の利用者向け表示を日本語化しました。Tool名、API / IPC Identifier、Error Code、`NO_REPLY`、User / Assistant本文、Tool引数・結果、Path等の機械契約・実データは翻訳しません。

## 修正済み — H-04: 日本語化がRenderer Testへ副作用を与える

日本語化処理はPackaged `file://`、localhost、127.0.0.1、IPv6 Loopbackの実Renderer Originだけで起動し、JSDOM Test Harnessや想定外Originでは自動Localizationを起動しないようにしました。

## 修正済み — H-05: ForkにReleaseが無い場合のUpdate 404

ForkにPublished Releaseが無い場合の`releases/latest` 404だけを正常状態として扱い、`latest = null / stage = idle / error = null`へ戻します。503、Checksum取得404、Asset失敗、Hash不一致等は従来通りFailureです。

## 確認済みの既存Security Control

- Approved RootのPath Canonicalization / Link Escape Check
- Command実行時のSecret Environment除去
- Loopback MCPのToken / Host / Origin / Body-size Boundary
- Desktop Capability Gate / Live Permission Revocation
- Electron Renderer Isolation / CSP / Navigation / Permission Deny
- OS-backed `safeStorage`
- External Native AssetのVersion Pin + SHA-256 Verify

## 残存Risk / Follow-up

### R-01 — Browser BridgeはLogged-in User BoundaryをTrust

Severity: **Medium / Design Trade-off**

初回Pairingは同一OS User境界をTrustします。より強い分離が必要ならUser Approval / One-time Pairing Secretを検討します。

### R-02 — Detailed Session Historyは`safeStorage`暗号化対象外

Severity: **Medium / Privacy**

Session Transcript / Tool HistoryはLocal保存ですがCredential Storeと同じEncryption Boundaryではありません。

### R-03 — Release ArtifactがUnsigned / Unnotarized

Severity: **Medium / Supply-chain Assurance**

Windows ReleaseはPublisher署名されておらず、macOS ReleaseもNotarizeされていません。

### R-04 — Linux AppImageの`--no-sandbox` Fallback

Severity: **Affected HostではMedium**

Unprivileged User Namespaceが無効なHostではAppImage Launcherが`--no-sandbox`へFallbackする場合があります。

### R-05 — `node-pty 1.2.0-beta.15`のWindows Regression Report

Severity: **Medium / Reliability。未再現**

Reference:

- https://github.com/microsoft/node-pty/issues/955
- https://github.com/microsoft/node-pty/issues/960

本Repositoryは`tty=true` Unified Execで`node-pty`を直接使用するため、Windowsで`write_stdin` / Interactive Terminalを実機検証する必要があります。

### R-06 — Electron Patch Level

Severity: **Audit時点Low**

ProjectはElectron `43.4.1`をPinしています。

## Verification方針

このForkではGitHub Actionsを使用しません。

- GitHub Actionsを有効化・手動実行・再実行しない
- GitHub Check / Workflow Runの有無をPass判定へ使用しない
- `.github/workflows/`はupstream互換 / 参照目的で残してよいが、Verification Authorityにはしない
- Exact Reviewed CommitをLocal Checkoutして検証する
- `npm run verify`のLocal実行結果を正本とする
- OS固有項目は対象OSの実機 / Package上で確認する
- Windows版はmainPC上の実機結果を正本とする
- 未実行項目は未検証として明記し、Pass扱いしない

## Verification状態

### 完了

- Fork / upstream Baseline確認
- `work` BranchでHardening実装
- Static Diff Review
- Security Contract Regression追加
- Japanese UI Boundary Regression追加
- No-release Update Regression追加
- MCP / File System / Command / Desktop / Renderer / Secret / Update / Packaging BoundaryのStatic Review

### 未完了

- `npm run verify` — **Local実行成功を未確認**
- Windows Packaged Smoke — **未実行**
- macOS Packaged Smoke — **未実行**
- Linux Packaged Smoke — **未実行**
- Live MCP / Secure Tunnel Test — **未実行**
- Live Chrome Extension Pairing / Multi-agent Test — **未実行**
- `node-pty` Windows Regression再現 — **未実行**
- 日本語UIのPackaged実画面確認 — **未実行**

## このForkのRelease Gate

1. Exact Reviewed CommitをLocal Checkoutする。
2. Local環境で`npm run verify`がPassする。
3. Native Windows Packaging / SmokeがPassする。
4. Windowsで`tty=true` + `write_stdin`を実際に検証する。
5. Built Releaseの`SHA256SUMS.txt`とInstaller Hashを独立確認する。
6. Update / Manual Download / Extension Recoveryがすべて`Shota-Zaki/chat-on-steroids`配下であることをRegressionで確認する。
7. Desktop App / Tray / Notification / Chrome Extension Popup / ChatGPT Overlayの日本語表示をPackaged Buildで確認する。
8. macOS / LinuxをRelease対象に含める場合は、それぞれのPackage / Smoke Testを対象OSで実行する。未検証OSはRelease対象外として明記する。
