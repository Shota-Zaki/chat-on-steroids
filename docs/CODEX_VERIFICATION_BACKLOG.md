# Codex Verification Backlog

このDocumentは、Chatで進行したStatic Review / Implementationのうち、Local実行が必要なVerificationを次回Codex作業でまとめて実施するためのBacklogです。

GitHub Actionsは使用しません。

## Status

- Chat側: Static Review / Implementationを継続
- Local Verification: CodexへDeferred
- Pass判定: 実際にLocal Command / Package / 実機確認を実行した項目のみ
- Release: V-013完了とLocal Verification成功までBlocked

## V-001 — Full local verification

**対象:** 次回Codex開始時の`work` HEAD

**目的:** TypeScript / Unit / Integration / Privacy Gateをまとめて確認する。

**Command:**

```sh
npm ci
npm run verify
```

**確認:** exit code 0。Failure時は最初のRoot Causeから修正して再実行する。V-013のCommit Author Privacyが未解決なら、Privacy Gate Failureを無視・Bypassせず先にV-013を解消する。

## V-002 — Japanese UI regression

**対象:** `src/renderer/ja-*.ts`、`extension/ja.js`、日本語化済みRenderer / Popup / Native UI

**目的:** 既存の日本語化が機械契約・User Data・既存Renderer Testを壊していないことを確認する。Runtime / IPC / Bridge / MCP / Model検出等へ変更が必要になる残存英語は日本語化必須条件としない。

**Command候補:**

```sh
npx vitest run test/japanese-ui.test.ts
npx vitest run test/renderer-state.test.ts test/renderer-timeline.test.ts test/renderer-layout.test.ts
npx vitest run test/extension-popup.test.ts test/extension.test.ts
```

**確認:** `exec_command`、`write_stdin`、`session_finish`、`NO_REPLY`、Error Code、User / Assistant本文、Tool引数 / Result、Pathが翻訳されていないこと。

## V-003 — Hardened defaults regression

**対象:** `src/main/config.ts`

**目的:** Fresh InstallがFail Safeで、既存Config Migrationを勝手に拡張しないことを確認する。

**Command:**

```sh
npx vitest run test/config.test.ts test/feature-parity.test.ts
```

**期待:** `readOnly=true`、browse/search/read/metadataのみ初期ON、`allowUnattributedCalls=false`。

## V-004 — Hardened release trust / no-release update

**対象:** `src/shared/release.ts`、`src/main/update.ts`、`src/main/version.ts`

**目的:** Update / Manual Release / Extension RecoveryがForkだけをTrustし、ForkにReleaseが無い404を正常状態として扱うことを確認する。

**Command:**

```sh
npx vitest run test/hardened-release-source.test.ts test/hardened-no-release-update.test.ts test/update.test.ts
```

**確認:** 404 latest-releaseのみ`idle / error=null`。503、Checksum404、Asset Failure、Hash MismatchはFailureのまま。

## V-005 — Windows package / runtime smoke

**対象OS:** Windows mainPC

**目的:** Windows版を実Packageで起動し、日本語UIとSecurity Defaultを確認する。

**Command候補:**

```powershell
npm ci
npm run dist:x64
```

生成Installerを検証用環境へInstallし、次を確認する。

- 起動成功
- Tray Menu日本語
- Fresh InstallがRead-only
- File mutation / command / Desktop / Clipboardが初期OFF
- Update Errorが出ない
- Chrome Extension Folderを開ける
- Popupが日本語
- ChatGPT上のExtension-owned UIが日本語

## V-006 — Windows node-pty / interactive terminal

**対象OS:** Windows mainPC

**目的:** `node-pty 1.2.0-beta.15`の既知Regressionが本Repositoryの`tty=true` / `write_stdin`へ影響するか確認する。

**確認Scenario:**

1. `exec_command`を`tty=true`で開始
2. 最初のOutput / Promptを待つ
3. `write_stdin`で入力
4. 複数回stdin送信
5. Processが早期終了しない
6. Exit / Output回収が正常

Failure時はbeta Versionを機械的にDowngradeせず、再現条件・stack / error・ConPTY挙動を記録してDependency判断する。

## V-007 — Live MCP / Chrome pairing

**目的:** 実際のChatGPT + Chrome Extension + Local Appで、Static Reviewだけでは確認できないBoundaryを検証する。

**確認:**

- Extension Pairing
- Session Attribution
- Core MCP接続
- Permission OFF時の`TOOL_DISABLED`
- Unattributed CallのFail Closed
- Compact & Resume
- Worker Chat / Multi-agent

## V-008 — Release candidate integrity

Releaseを作る段階で実施する。

- `SHA256SUMS.txt`生成
- Windows Installer Hash独立確認
- Extension ZIPに`ja.js`が含まれる
- Update / Download URLが`Shota-Zaki/chat-on-steroids`配下のみ
- Packaged Runtimeに日本語化Assetが含まれる

## V-009 — Expanded dynamic/composite Japanese UI

**対象:**

- `src/renderer/context-meter.ts`
- `src/renderer/ja-runtime.ts`
- `src/renderer/ja-timeline.ts`
- `src/renderer/ja-composite.ts`
- `src/renderer/dom.ts`

**目的:** Chatで追加した動的・複合UI日本語化が、保護対象のUser / Model / Tool payloadを変更せず表示だけを日本語化することを確認する。

**個別確認:**

- Context Meterの本文 / aria-labelが日本語
- Permission group一括ON/OFF titleが日本語
- Handshake / Problem count / Check中表示が日本語
- macOS Menu Bar / Windows Tray説明が日本語
- API Key保存状態 / Placeholderが日本語
- Plan作成 / 保存 / キャンセル系UIが日本語
- Browser Bridge状態が日本語
- Session Footerの保持件数 / 過去履歴 / 稼働中表示が日本語
- Task PlanのStage番号 / Edit / Delete / Validationだけ日本語で、Stage本文は原文保持
- Pending InputのStatus / Retry / Cancelだけ日本語で、Message本文は原文保持
- SwarmのSystem Hint / Pending / Delivered / Clear操作だけ日本語で、Task / Result本文は原文保持
- Handoff先頭の統計行だけ日本語で、Handoff本文 / Noteは原文保持
- Timeline grouped activity titleが日本語で、Tool引数 / Result / Model本文は原文保持

**Command候補:**

```sh
npx vitest run test/japanese-ui.test.ts test/context-meter.test.ts
npx vitest run test/renderer-state.test.ts test/renderer-timeline.test.ts test/renderer-layout.test.ts
```

必要なら`test/japanese-ui.test.ts`へ上記Composite BoundaryのRegressionを追加してから`npm run verify`を再実行する。

## V-010 — Extension localization ownership regression

**対象:** `extension/ja.js`、`src/renderer/ja.ts`、`src/renderer/ja-ui.ts`、`test/japanese-ui.test.ts`

**状態:** 未検証 / Codex検証待ち

**目的:** 今回追加したExtension-owned UIの日本語化と、Renderer Localization Observerの単一所有を確認する。

**Command候補:**

```sh
npx vitest run test/japanese-ui.test.ts test/extension-popup.test.ts test/extension.test.ts
npm run verify
```

**確認:** PopupのCopy結果、Compact / Goal / Loop設定と進行表示、Blocked説明が日本語であること。Model名・Run ID・Agent識別子、Tool / Protocol / User Dataは原文保持すること。`src/renderer/ja.ts`は辞書のみ、DOM Observerは保護境界を持つ`src/renderer/ja-ui.ts`が所有すること。

## V-011 — Renderer observer ownership / dynamic-value preservation

**対象:**

- `src/renderer/ja.ts`
- `src/renderer/ja-ui.ts`
- `src/renderer/ja-runtime.ts`
- `src/renderer/ja-timeline.ts`
- `src/renderer/ja-composite.ts`
- `src/renderer/ja-setup.ts`
- `src/renderer/dom.ts`
- `extension/ja.js`
- `test/japanese-ui.test.ts`

**状態:** 未検証 / Codex検証待ち

**目的:** H-07 / H-08で変更したLocalization OwnershipとDynamic Data保持を、Unit Testと実画面の両方で確認する。

**Command候補:**

```sh
npx vitest run test/japanese-ui.test.ts test/extension-popup.test.ts test/extension.test.ts
npx vitest run test/renderer-state.test.ts test/renderer-timeline.test.ts test/renderer-layout.test.ts
npm run verify
```

**静的 / Unit確認:**

- Renderer一般DOM Observerは`ja-ui.ts`だけが所有する
- `ja-runtime.ts`はPure TranslatorでありDOM Observerを持たない
- Dynamic PatternはWhitespace-normalized文字列ではなく元文字列の外側だけを`trim()`してMatchする
- `Rename /My  Folder`のFolder名内部の2 Spaceが維持される
- `Extension folder: C:\\My  Folder`のPath内部の2 Spaceが維持される
- `Could not check for a newer version: E  42.`のError本文内部の2 Spaceが維持される
- Extension側もVersion / Run ID / Request ID / Error Capture等の内部文字列を保持する

**Packaged / 実画面確認:**

- User Goal本文が`Starting` / `Saved`等の辞書語と一致しても`#activeGoalRow`内で変形しない
- User File名が辞書語と一致しても`#composerImages`のData表示・属性で変形しない
- Folder名 / Path / Model名 / Agent名 / Run ID / Request IDは原文保持
- Dynamic StatusのApp-owned周辺文言だけが日本語化される
- Chrome ExtensionでError本文・Model名・Run IDを保持したまま周辺Labelだけが日本語化される

## V-012 — Native file dialog localization — closed by policy

**状態:** Closed / 実装不要

`src/main/ipc.ts`はRuntime / IPC責務を持つため、日本語化だけを目的とした変更対象から外しました。Native File DialogのTitle / Filterに英語が残ることは許容します。

以前`test/japanese-ui.test.ts`へ追加されたNative File Dialog日本語化の必須Regression Contractも撤回済みです。Diagnostic Error本文、File Path、IPC identifier、Tool / Protocol Contractは引き続き原文保持します。

この項目はVerification待ちではなく、安定性優先の方針決定を記録するために残しています。

## V-013 — Fork commit author privacy / noreply history

**対象:** `scripts/verify-public-history.mjs`、`test/public-history-privacy.test.ts`、`main..work`の到達可能な未統合Commit History

**状態:** **History Rewrite required / Codex検証待ち / Release Blocker**

**Static判断:** 現在の`main..work`に、GitHub noreplyではないFork Maintainer Author / Committer metadataを持つ到達可能な未統合Commitが存在することをGitHub上で確認した。個人メール値そのものはDocument / PR本文へ記録しない。したがって「Rewriteが必要か」は未決ではなく、**`work`の未統合History Rewriteが必要**と判断する。

**Privacy Gate修正範囲:**

- Maintainer = `Shota-Zaki`
- 許可Email = GitHub `users.noreply.github.com`形式のみ
- Published Boundary = URLが完全一致する`Shota-Zaki/chat-on-steroids` Remoteの`main`
- Exact Fork Remoteが無い場合、`origin/main`へFallbackしない
- Exact Fork RemoteはあるがFetched `main`が無い場合、公開済みCommitを0件として扱う
- upstream / unrelated RemoteをForkのPublished BoundaryとしてTrustしない
- HEADへ到達しない無関係Refは検査対象へ混ぜない
- Regression TestをFork Maintainer / Fork Remoteへ移行し、非noreply Test Fixtureには実在個人アドレスを使用しない

**目的:** Fork用Privacy Gateと実Historyの両方を整合させ、公開前のFork Historyに個人メールアドレスを残さない。

### Codex手順

① **Remote / HEADを再取得し、Rewrite対象を固定する**

```sh
git fetch --all --prune
git remote -v
git rev-parse main work
git rev-list --left-right --count main...work
```

- Fork `main` / `work`とupstream `main`の現在値をGitHub側と照合する。
- PR #1がDraftであることを確認する。
- 新Branchは作成しない。

② **今後のMaintainer IdentityをGitHub noreplyへ固定する**

```sh
git config user.name Shota-Zaki
git config user.email 246847859+Shota-Zaki@users.noreply.github.com
```

Repository Local Configを優先する。個人Emailは設定・Log・Documentへ転記しない。

③ **未統合HistoryをLocalだけで監査する**

```sh
git log main..work --format='%H %an <%ae> | %cn <%ce>'
npm run verify:privacy
```

- non-noreply Maintainer identityを検出する。
- Terminal上の個人値をIssue / PR / DocumentへCopyしない。
- Privacy Gateを`--no-verify`等でBypassしない。

④ **Rewrite前BackupをBranchではなくBundleで保存する**

```sh
git bundle create ../chat-on-steroids-v013-before-rewrite.bundle main work
```

新しいGit Branchを作らず、Rollback用のLocal BundleだけをRepository外へ保存する。

⑤ **`main`を触らず、`main..work`だけのMetadataをRewriteする**

- 対象は`work`へ到達し、Fork `main`へ到達しないCommitだけ。
- `Shota-Zaki` MaintainerのAuthor / CommitterがGitHub noreplyでない場合だけnoreplyへ置換する。
- 他ContributorのAuthor / Committer identity、Commit Message、Tree内容は変更しない。
- `main` / upstream HistoryはRewriteしない。
- `--reset-author`等で全AuthorをMaintainerへ一括置換しない。
- 使用可能なら`git filter-repo`の`--refs work` + reviewed callbackを優先する。Toolが無い場合は、その場で別方式へ機械的に切り替えず、Tree不変を検証できる方式を選ぶ。

Rewrite前に次を保存する。

```sh
old_work=$(git rev-parse work)
old_tree=$(git rev-parse 'work^{tree}')
```

⑥ **Tree / Diff不変を検証する**

```sh
test "$old_tree" = "$(git rev-parse 'work^{tree}')"
git diff --exit-code "$old_work^{tree}" 'work^{tree}'
git diff --stat main...work
```

History Rewriteの目的はMetadata修復だけであり、Source / Documentの最終Tree内容を変えない。

⑦ **Privacy GateとFull VerificationをLocal実行する**

```sh
npm run verify:privacy
npm run verify
```

実際にexit code 0を確認した場合だけPassとする。V-001〜V-011の実機 / Package項目は各項目どおり別途実施する。

⑧ **Remote競合が無いことを再確認してから`work`だけForce-with-leaseする**

```sh
git fetch origin work
git rev-parse refs/remotes/origin/work
```

取得したRemote `work`がRewrite開始時に固定した旧Remote HEADと一致する場合だけ、旧SHAを明示した`--force-with-lease`で`work`を更新する。`main`へPushしない。Remoteが進んでいた場合はForce Pushせず停止し、差分を再評価する。

⑨ **Push後にGitHub正本を再取得する**

- `work` HEAD / `main` HEAD / upstream `main` HEAD
- `main...work` ahead / behind
- PR #1がDraftのまま
- `main..work`のMaintainer Author / CommitterがGitHub noreplyのみ
- `npm run verify:privacy` / `npm run verify`の対象CommitがPush後HEADと一致

**完了条件:** History Rewrite、Privacy Gate、Local Verificationの3点が同じ最終`work` HEADに対して確認済みであること。完了前はMerge / Release禁止。

## GitHub Repository Settings — Manual follow-up

Repository Admin設定は現在のChat Connectorから安全に変更できないため、次をManual設定項目として残す。

### Issues

- 現在RepositoryではGitHub Issuesが無効。
- `.github/ISSUE_TEMPLATE/*`が存在し、README / CONTRIBUTINGも通常Bug / Feature報告にIssuesを参照しているため不整合。
- **推奨:** Issuesを有効化する。
- Security VulnerabilityはIssuesではなくGitHub Private Vulnerability Reporting / Security Advisoryを使用する現行`SECURITY.md`方針を維持する。

### `main` protection / ruleset

- 現在`main`はProtectedではなく、Repository Rulesetも確認できない。
- **推奨:** `main`へのDirect Push、Force Push、Deleteを拒否し、PR経由を必須にする。
- 必要に応じてReview Approvalを要求する。
- このForkではGitHub ActionsをVerification Authorityにしないため、GitHub Actions CheckをRequired Status Checkへ設定しない。
- `work`運用とPR #1 Draft方針は維持する。

### GitHub Actions

- `.github/workflows/`はupstream互換 / 参照目的で残してよい。
- Workflowを手動実行・再実行しない。
- GitHub Check / Workflow RunをPass判定に使わない。
- Repository LevelのActions Permission状態は現在のConnectorでは確認・変更できなかったため、ForkでActions自体を無効化する運用ならRepository SettingsでManual確認する。

## Deferred rule

Chatで新しくLocal Verificationが必要になった場合は、既存V-001〜V-013へ統合できるものは重複追加せず追記する。Chat内ではLocal Verification待ちを理由に作業を停止しない。
