# Documentation Index

この`docs/`は、現行のHardened Fork正本とupstream由来の設計・監査履歴が同居しています。

迷った場合は、まずこのIndexと下記の「現行正本」を確認してください。

## 現行正本

| 文書 | 用途 |
| --- | --- |
| [`../AGENTS.md`](../AGENTS.md) | upstream Architecture / Incident History / Subsystem Ownership |
| [`../AGENTS.override.md`](../AGENTS.override.md) | Hardened Fork固有ルール。Branch、Security、Japanese UI、Verification方針はこれを優先 |
| [`security-audit-hardened-fork-2026-09-07.md`](security-audit-hardened-fork-2026-09-07.md) | Fork固有Security Hardeningと残存Riskの正本 |
| [`CODEX_VERIFICATION_BACKLOG.md`](CODEX_VERIFICATION_BACKLOG.md) | ChatでDeferredしたLocal / Runtime Verificationの正本 |
| [`../README.md`](../README.md) | 利用者向け機能・Setup・Permission説明 |
| [`../SECURITY.md`](../SECURITY.md) | 利用者向けSecurity説明・報告方針 |

## 現在の運用状態

- 開発Branch: `work`
- PR: `#1`をDraftのまま維持
- `main`へ直接変更しない
- GitHub ActionsはForkのVerification Authorityとして使用しない
- Local / Runtime Verification未実施の項目は`CODEX_VERIFICATION_BACKLOG.md`へ記録する
- 実行していないTestをPass扱いしない
- ReleaseはCodex Verification完了前に行わない

## 現在の保留事項

`test/japanese-ui.test.ts`にはNative File Dialogの日本語表示を要求するRegression Contractがありますが、`src/main/ipc.ts`側の対応はまだ完了していません。

Repository整理ではRuntime / IPCの挙動へ影響し得る変更を避けるため、この差分はコード修正せずVerification Backlogへ明示しています。

対象UI:

- Approved Folder picker
- Project Folder picker
- Tunnel executable picker
- Image picker

Diagnostic Error本文はLocalization対象外として原文保持する方針です。

## 履歴・参考資料

以下は重要な履歴ですが、現在のFork運用ルールの正本ではありません。

### Bug / Audit History

- `bug-audit-*.md`
- `bughunt-*.md`
- `bughunt-follow-up-*.md`
- `public-history-privacy-incident-*.md`

過去のIncident、Root Cause、修正判断を追うために保持します。

### Design / Implementation Reference

- `computer-use-overhaul-plan.md`
- `computer-use-overhaul-implementation.md`
- `chatgpt-turn-signals.md`

Subsystem変更時の背景資料として使用します。現行実装と矛盾する場合は`AGENTS.md`と現在コードを優先します。

### Release / Assets

- `release-notes/`
- `images/`

利用者向けRelease履歴とREADME用Assetです。

## 文書整理ルール

1. 現行Ruleを複数文書へ重複して増やさない。
2. Fork固有Ruleは`AGENTS.override.md`へ集約する。
3. Security Finding / RiskはSecurity Auditへ集約する。
4. Local / Runtime検証待ちはCodex Verification Backlogへ集約する。
5. 過去Auditは参照切れを避けるため、リンク確認なしに削除・移動しない。
6. Runtime Contract、Tool名、Protocol、Error本文等をDocument整理の都合で変更しない。

## Repository整理の方針

Repository hygieneでは、まず「削除」より「正本を明確化する」ことを優先します。

古いDocumentが不要と判断できても、`AGENTS.md`、Issue、PR、README等から参照されていないことを確認してからArchive / Deleteを判断してください。
