# Hardened Fork 固有ルール

このRepositoryは `totec448-spec/chat-on-steroids` を基にした個人用Hardened Forkです。

## 正本と優先順位

- 対象Subsystemを変更する前に、upstreamのArchitecture / Incident History正本として `AGENTS.md` を読むこと。
- 本ファイルの規則は、初期権限・Fork運用・日本語UI・ブランチ方針についてupstreamの記述と競合する場合に優先する。
- Security Hardening、再現済みBug、明示的に承認されたFork固有要件以外では、upstreamの挙動を不必要に変更しない。

## Branch方針

- 実装・Test・Audit・Documentationはすべて `work` Branchで行う。
- `main` へ直接書き込まない。
- `main` はレビュー済みの統合基準として維持する。

## Hardened Fresh Install基準

Fresh InstallはFail Safeを原則とする。

- `readOnly = true`。
- 初期ONは既存の保守的な `DEFAULT_CAPABILITIES` のみ: browse / search / read / metadata。
- File変更、Command実行、Screen / Control、Clipboardは明示的Opt-in。
- Multi-agentはupstreamのWorker上限で有効でもよいが、`allowUnattributedCalls = false` を初期値とする。
- 欠損・破損・新規追加されたSettingをPermission Consentとして扱わない。
- 明示的なMigration承認がない限り、既存Userが保存した権限選択を維持する。

## 日本語UI方針

利用者向け表示は原則として日本語を正本とする。

- Desktop Renderer、Setup、Settings、Usage、Toast、OS Native Notification / Tray、Chrome Extension Popup、ExtensionがChatGPTへ追加する独自UIは日本語表示にする。
- 新しい利用者向け英語文言を追加するときは、同じ変更で日本語表示と回帰Testも追加する。
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

## 変更手順

Security-sensitiveな変更では次を守る。

1. Unsafe Behaviorを再現するか、決定的なRegression Testで固定する。
2. 最も早いRoot Cause Boundaryを、必要最小限で一貫した変更として修正する。
3. 可能なら重複Testを増やさず既存Testを更新する。
4. 最寄りのRegression、隣接Boundary Test、`npm run verify` を実行してから完了扱いする。
5. README / SECURITY等の利用者向け文書を実際のPermission Modelと一致させる。

実際にCommandを実行して結果を確認していないTest / Verificationを「Pass」と報告しない。
