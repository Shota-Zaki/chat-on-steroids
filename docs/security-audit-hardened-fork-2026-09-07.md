# Hardened Fork Security Audit — 2026-09-07

Repository: `Shota-Zaki/chat-on-steroids`

Upstream: `totec448-spec/chat-on-steroids`

Audit Baseline: upstreamと同一だったFork Commit `0f3ec7532b7d598275bf6ebf8f842495d8ab9284`

Working Branch: `work`

## 状態

このDocumentは、個人用Hardened Forkに対して実施したStatic Security ReviewとHardening変更を記録します。

**Runtime Verificationは一部未完了です。** このForkではGitHub Actionsを使用しません。`npm run verify`、Windows x64 package生成、fresh install、startup、renderer、Bridge auth、packaged node-pty / ConPTY smoke、restart、uninstall、無害なChatGPT connectivity smoke、Bridgeのtoken / origin拒否は確認しましたが、Tray、Packaged UIの日本語確認、正式Chrome pairing / reconnect、Live MCP / attributionは未実行です。本DocumentをRuntime Certificationとして扱わないでください。GitHub Repository設定ではIssuesを有効化し、`main`へPR必須・1 approval・admin enforcement・force-push/delete禁止を適用済みです。Required Status Checksは設定していません。

V-013の未統合History Privacy Findingは修復・検証済みです。残存するPackage / Smoke / Live検証が完了するまでRelease / Mergeは禁止です。

## 要約

Fork固有の重大なRuntime / Release Trust問題を2件修正しました。

1. Fresh InstallでFile変更、Command、Desktop等の強力なPermissionが広く有効だった。
2. Runtime Update / Recovery Linkがupstream RepositoryをTrustしており、Hardened Fork Buildが将来upstream Artifactへ置換される可能性があった。

加えて、Fork MaintainerのCommit Author / Committer Privacy GateをStatic Reviewし、Fork固有Published BoundaryとRegression Testの移行不備を修正しました。未統合Historyのmetadata-only rewrite、Tree不変確認、Privacy Gate、Regression、Full Local Verificationまで完了しています。

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

## 修正済み — H-06: Extension LocalizationがUser / Model Dataへ到達し得る

ChatGPT上のExtension-owned UIは`.clf-*` ContainerをPresentation Layerとして日本語化しますが、保存済みGoal本文、Goalで生成された次Message本文、Goal保存時の診断Errorも同じContainer内へ描画されます。

これらを一般Localization Observerへ通すと、本文が辞書Patternと偶然一致した場合に表示内容だけが書き換わる余地がありました。次をLocalization保護Selectorへ追加し、表示時も原文保持する境界へ変更しました。

- `.clf-menu-goal-text` — Userが保存したGoal本文
- `.clf-stage-body` — Modelが生成した次Message本文
- `.clf-menu-goal-note[data-clf-warn="1"]` — App / Connector由来の診断Error

既存のTool Payload / Result、Bootstrap本文、Stage Detail等の保護境界は維持します。Localizationは操作Label、Status、Step名、説明文等のApp-owned Presentationだけを対象にします。

## 修正済み — H-07: Renderer Runtime Localizationの重複ObserverがData境界を迂回し得る

`src/renderer/ja-runtime.ts`が動的文字列のLocalizationだけでなく、Document全体を監視する独自`MutationObserver`も所有していました。この保護Selectorは`src/renderer/ja-ui.ts`の一般Localization Observerより狭く、少なくとも次のData混在Surfaceを保護していませんでした。

- `#activeGoalRow` — App-owned LabelとUserが入力したGoal本文を同じRowへ描画
- `#composerImages` — User File名を`alt` / Control Labelへ利用

そのためUser Goal本文やFile名が`Starting`、`Saved`等のLocalization辞書と偶然一致した場合、表示時だけ書き換わる余地がありました。

Root Causeを重複Observer Ownershipと判断し、`ja-runtime.ts`をPure Translatorへ縮小しました。Runtime文字列は`ja-ui.ts`の保護境界付き一般Observerから呼び出し、Renderer一般DOM監視は`ja-ui.ts`だけが所有します。`#activeGoalRow`と`#composerImages`は一般Localization対象外のまま維持します。

## 修正済み — H-08: Dynamic Localization Patternが埋め込みDataを空白正規化し得る

Renderer / ExtensionのLocalization Patternは、全文を`trim().replace(/\s+/g, ' ')`で正規化してからRegExpへ渡していました。静的Labelの照合には有効ですが、Pattern CaptureへFolder名、Path、Model / Run ID、Version、Diagnostic Error等が含まれる場合、そのDataの連続空白まで変更します。

例:

- `Rename /My  Folder` → Folder名内部の2 Spaceを1 Spaceへ変形し得る
- `Extension folder: C:\\My  Folder` → Path表示を変形し得る
- `Could not check for a newer version: E  42.` → Error本文を変形し得る

Exact Dictionaryは従来通りWhitespace Normalizationで照合しますが、Dynamic Patternは元文字列の外側だけを`trim()`してMatchする方式へ統一しました。対象はRendererの`ja.ts` / `ja-ui.ts` / `ja-runtime.ts` / `ja-timeline.ts` / `ja-composite.ts` / `ja-setup.ts`と`extension/ja.js`です。これによりApp-owned周辺文言だけを翻訳し、Pattern Captureされた動的値の内部文字列は保持します。

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

### R-08 — npm auditのdev-only脆弱性

Severity: **Moderate 1 / High 1。Build-time dependency risk**

`npm audit`は次の2件を検出しました。

- `@xmldom/xmldom@0.8.14` — `plist`経由の`electron-builder` dev dependency。GHSA-6gmq-8vp8-gcm6、moderate。
- `fast-uri@3.1.5` — `ajv → app-builder-lib → electron-builder`経由のdev dependency。GHSA-5jgf-p345-68v8、GHSA-f65p-4m7j-42xc、GHSA-fph4-wmhf-6fwf、GHSA-jqff-g426-hqxp、high。

`npm ls --omit=dev`は両方とも空で、生成したWindows `app.asar`にも両パッケージ名および`electron-builder` runtime payloadはありませんでした。したがって現時点の分類は**配布runtimeへ非到達のBuild-time依存**です。`npm audit fix --force`や広範なDependency Upgradeは行っていません。上流の安全な解消版が利用可能になった時点で、lockfile、package生成、監査を再検証します。

### R-07 — Commit Metadata Privacy / Privacy Gate Fork Migration

Severity: **High / Privacy / Release Blocker**

**Root Cause:** Public-history Privacy Gateはupstream運用から移行されており、Fork Maintainer判定は`Shota-Zaki`へ変更済みでしたが、Published Boundaryに`origin/main` Fallbackが残り、Regression Testもupstream Maintainer / upstream Repository前提のままでした。`origin`がupstreamを指すCloneでは、ForkのPublished BoundaryではないHistoryを誤って公開済み扱いする余地がありました。

**影響:** `main..work`の未統合HistoryにGitHub noreplyではないFork Maintainer Author / Committer metadataが残ったままMerge / Releaseすると、そのmetadataが公開Git Historyへ固定されます。また誤ったPublished BoundaryはPrivacy Gateの検出範囲を狭める可能性があります。

**修正済み範囲:** `scripts/verify-public-history.mjs`はMaintainerを`Shota-Zaki`、許可形式をGitHub noreplyに限定し、Published BoundaryをURLが完全一致する`Shota-Zaki/chat-on-steroids`のRemote `main`だけに限定しました。Fork RemoteまたはそのFetched `main`が無い場合は何も公開済み扱いせず、`origin/main`へFallbackしません。Regression TestもFork MaintainerとFork Published Boundaryへ移行し、非noreply Fixtureには実在個人アドレスを使用しません。

**解決結果:** Rewrite前Bundleを保存し、`main..work`の124コミットだけを対象にmetadataを修復しました。Rewrite後も125コミット先行、Tree・commit message・名前・日時は不変で、Fork `main` / upstream `main`は変更していません。Privacy Gateはexit code 0、Privacy Regressionは16/16、Full Local Verificationは成功しました。個人メール値は本Documentへ記録しません。

**Release Blocker:** **CONDITIONAL**。V-013、Local Verification、Package、fresh install、startup、Bridge auth、node-pty smoke、restart、uninstallは完了しました。Tray / Packaged UIの実画面確認、正式Chrome pairing / reconnect、Live MCP / attributionはこの環境で未実行のため、PR #1はDraftを維持し、Merge / Releaseしません。

**Codex Verification:** `docs/CODEX_VERIFICATION_BACKLOG.md`のV-013を正本とします。`main` / upstream Historyを変更せず、Tree内容の不変を検証したうえで`work`の未統合Historyだけを修復します。

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

**この方針はFork固有の恒久ルールです。GitHub Actionsが存在・有効・無効のいずれであっても、このForkのVerification手順では使用しません。**

## Verification状態

### 完了

- Fork / upstream Baseline確認
- `work` BranchでHardening実装
- Static Diff Review
- Security Contract Regression追加
- Japanese UI Boundary Regression追加
- Extension Goal / Generated Message / Diagnostic Localization Boundary Regression追加
- Renderer general Observer Ownership Regression追加
- Dynamic Localization Payload Preservation Regression追加
- No-release Update Regression追加
- MCP / File System / Command / Desktop / Renderer / Secret / Update / Packaging BoundaryのStatic Review
- V-013 Privacy GateのFork Published Boundary Static Review / Regression Test移行
- V-013 `main..work` metadata-only History Rewrite / Tree不変確認
- V-013 Privacy Gate — **PASS**
- V-013 Privacy Regression — **16/16 PASS**
- `npm ci` — **PASS**
- `npm run verify` — **PASS**
- `npm audit` — **FAIL / 要対応**（2件。ただし両方dev-only、配布runtime非到達を確認）
- `npm run dist:x64` — **PASS**（Windows x64 NSIS Installer生成、unpacked payload生成、native payload checksum検証）
- MCP / `exec_command` / `write_stdin` / node-pty契約 / Bridge / attribution / fresh-default focused suite — **PASS**（7 files, 565 passed, 4 skipped）
- Windows fresh install / startup / renderer / Bridge auth — **PASS**（Installer exit 0、window loaded、8765 listener、tokenなしendpoint 401）
- Packaged node-pty / ConPTY smoke — **PASS**（2 sessions、各2回stdin、exit 0、child cleanup差分0）
- Packaged app restart — **PASS**（restart後process / 8765 listener）
- Live ChatGPT connectivity smoke — **PASS**（無害な確認文への`OK`応答。tool callは未要求）
- Browser Bridge invalid-token / unsupported-origin checks — **PASS**（401 / 401 / 403）
- Windows verification uninstall — **PASS**（install directory、process、8765–8769 listenerを除去。user-dataは保持）

### 未完了 / 環境依存

- Windows Packaged GUI Smoke — **一部未完了**（Tray、Packaged日本語UI、実端末操作は未確認。現在の検証環境にはNative UI automation backendがない）
- macOS Packaged Smoke — **未実行**
- Linux Packaged Smoke — **未実行**
- Live MCP / Secure Tunnel Test — **未実行**（正式pairingが未完了）
- Live Chrome Extension Pairing / Multi-agent Test — **未実行**
- Chrome reconnect / formal pairing — **未実行**（Extension browser / model-catalog tabの存在のみ確認。token provisioningの実機操作が必要）
- Packaged App MCP dispatcher経由の`exec_command` / `tty=true` / `write_stdin` — **未実行**（command permission OFFを維持）
- `node-pty` Windows Regression再現 — **未再現**（配布payload smokeはPASS）
- 日本語UIのPackaged実画面確認 — **未実行**
- Live ChatGPT tabとのPairing / MCP / attribution — **未実行**（既存Chrome tabの存在確認のみ）

## このForkのRelease Gate

1. V-013を完了し、`main..work`のFork Maintainer Author / CommitterがGitHub noreply形式だけであることをLocalで確認する。
2. Exact Reviewed CommitをLocal Checkoutする。
3. Local環境で`npm run verify`がPassする。
4. Native Windows Packaging / SmokeがPassする。
5. Windowsで`tty=true` + `write_stdin`を実際に検証する。
6. Built Releaseの`SHA256SUMS.txt`とInstaller Hashを独立確認する。
7. Update / Manual Download / Extension Recoveryがすべて`Shota-Zaki/chat-on-steroids`配下であることをRegressionで確認する。
8. Desktop App / Tray / Notification / Chrome Extension Popup / ChatGPT Overlayの日本語表示をPackaged Buildで確認する。
9. macOS / LinuxをRelease対象に含める場合は、それぞれのPackage / Smoke Testを対象OSで実行する。未検証OSはRelease対象外として明記する。
