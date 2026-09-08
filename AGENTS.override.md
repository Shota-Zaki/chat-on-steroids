# Hardened Fork 固有ルール

このRepositoryは `totec448-spec/chat-on-steroids` を基にした個人用Hardened Forkです。

## 正本と優先順位

- 対象Subsystemを変更する前に、upstreamのArchitecture / Incident History正本として `AGENTS.md` を読むこと。
- 本ファイルの規則は、初期権限・Fork運用・日本語UI・ブランチ方針・検証方針についてupstreamの記述と競合する場合に優先する。
- Security Hardening、再現済みBug、明示的に承認されたFork固有要件以外では、upstreamの挙動を不必要に変更しない。

## Branch方針

- 実装・Test・Audit・Documentationはすべて `work` Branchで行う。
- `main` へ直接書き込まない。
- `main` はレビュー済みの統合基準として維持する。

## Verification方針

このForkではGitHub Actionsを検証手段として使用しない。

- GitHub Actionsを有効化・手動実行・再実行しない。
- `.github/workflows/` はupstream互換や参照目的で残してよいが、Forkの完成判定やRelease Gateの根拠にはしない。
- GitHub上のStatus / Check / Workflow Runの有無をPass判定に使わない。
- 実際にCommandを実行して結果を確認していないTest / Verificationを「Pass」と報告しない。

### Chat進行時

- Chatでの調査・静的監査・実装修正は、Local Verification待ちで停止しない。
- `npm run verify`、個別Test実行、Package / Smoke Test、Windows実機確認など、このChat環境から実行できない項目は `docs/CODEX_VERIFICATION_BACKLOG.md` に対象Commit・目的・実行Command・確認事項を記録して次の作業へ進む。
- Local Verification未実施であることは明示するが、それだけを理由に同じChat内の後続Static Review / Implementationを止めない。
- Chatでは構文・型・契約・Security Boundaryを可能な範囲で静的確認し、実行しないTestをPass扱いしない。

### Codex進行時

- 次回Codex作業では `docs/CODEX_VERIFICATION_BACKLOG.md` の未完了項目をまとめて実行する。
- Exact Reviewed CommitをLocal Checkoutし、`npm run verify`、必要な個別Test、Package / Smoke Test、Windows実機確認を実行する。
- Windows固有機能はmainPC上の実機結果を正本とする。
- macOS / Linux固有項目を未実行のまま完了扱いしない。実行しない場合は未検証として明記する。
- 検証結果はBacklogへ追記し、失敗があればRoot Cause修正後に対象項目を再実行する。

## Hardened Fresh Install基準

Fresh InstallはFail Safeを原則とする。

- `readOnly = true`。
- 初期ONは既存の保守的な `DEFAULT_CAPABILITIES` のみ: browse / search / read / metadata。
- File変更、Command実行、Screen / Control、Clipboardは明示的Opt-in。
- Multi-agentはupstreamのWorker上限で有効でもよいが、`allowUnattributedCalls = false` を初期値とする。
- 欠損・破損・新規追加されたSettingをPermission Consentとして扱わない。
- 明示的なMigration承認がない限り、既存Userが保存した権限選択を維持する。

## 日本語UI方針

利用者向け表示は原則として日本語を正本とする。ただし、**日本語化の網羅性よりSystemの動作安定性を優先する。**

- Desktop Renderer、Setup、Settings、Usage、Toast、OS Native Notification / Tray、Chrome Extension Popup、ExtensionがChatGPTへ追加する独自UIは、安全にPresentationだけを変更できる範囲で日本語表示にする。
- 日本語化だけを目的として、Runtime Control Flow、IPC、Bridge、MCP、Permission、Update、Model検出、Session Attribution、Tool Contract、Protocol、Persistence、Browser Automation等の動作責務を持つ実装を変更しない。
- `MutationObserver`、DOM Selector、Dynamic Pattern、Origin判定、Extension transport等はLocalizationと動作境界が近いため、表示上の英語が残っていても翻訳目的だけでは変更しない。
- `src/main/*`等のMain Processコードは、表示文字列だけに見える変更でもRuntimeと同じFileに存在する場合、影響が明確にPresentation-onlyと証明できない限り保留してよい。
- 残存英語がSecurity、Correctness、操作不能等の問題を起こさない場合、日本語化未完了だけを理由にRelease / CompletionをBlockしない。
- 新しい利用者向け英語文言を追加するときも、同じ変更で安全に日本語化できる場合のみ日本語表示を追加する。動作Riskが増える場合は英語のまま許容する。
- User / Assistantの会話本文、Handoff本文、Task本文、Folder名、Model名、Tool引数・結果、Diagnostic Logは表示の正確性を優先して翻訳しない。
- `exec_command`、`write_stdin`、`session_finish` などのTool名、API / IPC identifier、Error Code、Protocol field、Model ID、Provider名、`NO_REPLY` などの機械契約は変更しない。
- ChatGPTへコピーするConnector名・Description等、完全一致が意味を持つContract Textは翻訳レイヤーの対象外とする。
- 日本語化を理由にModel PromptやProtocol payloadを書き換えない。

## Security境界

- `exec_command` はLogged-in OS User権限での任意Code実行であり、Approved FolderにはContainされない。`command` の有効化はHigh Risk Permission Grantとして扱う。
- Desktop ControlはFolder ScopeではなくDesktop全体に作用する。Screen / Control / Clipboardは明示的に有効化されるまでOFFを維持する。
- Caller IdentityはFail Closed。ExtensionがCallerを証明できない場合、Active Tab、Timing、Ordering、Model-supplied ID等から推測しない。
- File ToolはApproved Rootに制約するが、Application-level Path CheckをOS / Kernel Sandboxとして扱わない。
- Tunnel URL、Bridge Token、API Key等のCredentialをLogやCommitへ含めない。
- Forkが所有するRelease / Download / Support / Security / Package Metadataは `Shota-Zaki/chat-on-steroids` を指す。upstream URLは、出典・履歴・比較・明示的なupstream参照として必要な場合だけ残す。

## 変更手順

Security-sensitiveな変更では次を守る。

1. Unsafe Behaviorを再現するか、決定的なRegression Testで固定する。
2. 最も早いRoot Cause Boundaryを、必要最小限で一貫した変更として修正する。
3. 可能なら重複Testを増やさず既存Testを更新する。
4. Chat進行時はLocal Verification項目をBacklogへ記録して後続作業へ進む。Codex進行時はBacklogをまとめて実行する。
5. README / SECURITY等の利用者向け文書を実際のPermission Modelと一致させる。
