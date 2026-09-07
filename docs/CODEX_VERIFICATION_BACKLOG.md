# Codex Verification Backlog

このDocumentは、Chatで進行したStatic Review / Implementationのうち、Local実行が必要なVerificationを次回Codex作業でまとめて実施するためのBacklogです。

GitHub Actionsは使用しません。

## Status

- Chat側: Static Review / Implementationを継続
- Local Verification: CodexへDeferred
- Pass判定: 実際にLocal Command / Package / 実機確認を実行した項目のみ

## V-001 — Full local verification

**対象:** 次回Codex開始時の`work` HEAD

**目的:** TypeScript / Unit / Integration / Privacy Gateをまとめて確認する。

**Command:**

```sh
npm ci
npm run verify
```

**確認:** exit code 0。Failure時は最初のRoot Causeから修正して再実行する。

## V-002 — Japanese UI regression

**対象:** `src/renderer/ja-*.ts`、`extension/ja.js`、日本語化済みRenderer / Popup / Native UI

**目的:** 日本語化が機械契約・User Data・既存Renderer Testを壊していないことを確認する。

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

## Deferred rule

Chatで新しくLocal Verificationが必要になった場合は、このDocumentへ`V-xxx`を追加して後続作業へ進む。Chat内ではLocal Verification待ちを理由に作業を停止しない。