> [!IMPORTANT]
> **ChatGPT本体の表示言語は英語にしてください。**
>
> Chat On Steroids自体は日本語化していますが、現在のモデル選択連携はChatGPT Web UIの英語ラベルを参照しています。ChatGPTの表示言語を**English**に設定し、ChatGPTタブを再読み込みしてからChat On Steroidsでモデル検出を再実行してください。ChatGPT本体を日本語表示にすると、拡張機能が接続済みでセットアップチェックがすべて正常でもモデル一覧が空になる場合があります。
>
> **モデル選択が表示されない場合の対処:**
>
> 1. Chat On Steroidsを開くか、モデル選択の**更新**ボタンを押します。
> 2. **Chat On Steroidsが開いたChromeウィンドウとChatGPTタブ**へ切り替えます。
> 3. ChatGPTに推論レベルのSliderではなくモデル一覧が表示された場合、選択済みに見えていても一度 **GPT-5.6 Sol** をクリックします。
> 4. Chat On Steroidsへ戻り、**モデル選択をもう一度更新**します。
>
> セットアップチェックがすべて正常でもモデル一覧が出なかった環境で、この手順により復旧した事例があります。解消しない場合は [Issues](../../issues) へ報告してください。

<div align="center">
  <img src="extension/icons/icon128.png" width="88" alt="Chat On Steroids icon" />
  <h1>Chat On Steroids</h1>
  <p><strong>ChatGPTに、あなたのPCで作業するための手を与える。</strong></p>
  <p>ChatGPT向けDesktop Chat Workspace / Local MCP Serverです。Project Folder、画像、Plan、Worker Chat、File読取り・Patch・Command実行などを扱えます。会話とTool実行結果をLocalに記録し、次の指示をどのように渡すかも制御できます。</p>
  <p>
    <a href="../../releases/latest"><strong>最新Release</strong></a>
    · <a href="#quick-start">クイックスタート</a>
    · <a href="#what-chatgpt-gets">Tool</a>
    · <a href="#security-in-one-page">Security</a>
    · <a href="CHANGELOG.md">Changelog</a>
  </p>
</div>

<p align="center">
  <img src="docs/images/workspace.png" width="92%" alt="Chat On Steroidsの新規チャットWorkspaceとComposer" />
</p>
<p align="center">
  <img src="docs/images/settings.png" width="92%" alt="Chat On SteroidsのToolとChat Automation設定" />
</p>

ScreenshotではPrivateな会話やFolder情報を伏せています。Chat Historyは上へScrollすると小さい単位で追加読み込みされます。添付画像はThumbnailとして残り、Message下部からDelivery Controlを操作できます。

## このアプリの目的

ChatGPTは優秀でも、通常はText Boxの中だけで動きます。Developer Modeを使えばMCP Serverを呼べますが、多くのServerは狭いAPIしか提供しません。Chat On Steroidsは、ChatGPTへLocal Workbenchを提供します。

- **Codex相当のTool Contract。** `apply_patch`、`exec_command`、`write_stdin` はOpenAI Codex CLIのTool Contractを基にしています。Multi-file Patchは書込み前にPreflightされます。Commandは実Processとして起動し、Interactive stdin、Output Budget、Background Result回収に対応します。
- **ChatGPT内のSub-agent。** 1つのPrime ChatからWorker Chatを起動し、Taskを渡し、Reportを受け取り、後から同じWorkerを再利用できます。WorkerはBrowser上の通常のChatGPT Conversationなので、実際の動作を確認できます。
- **Context Windowを跨ぐSession。** Tool Callと実際のResultをLocalへ記録します。Chatが大きくなったらCompact & ResumeでHandoff Briefを作り、新しいChatへ同じLocal Sessionを引き継げます。
- **Plan / Goal / Loop。** Requestを編集可能なStageへ分割したり、別ChatGPT HelperまたはAPIからFollow-upを生成したりできます。Astraは`session_finish`を使い、同一Turnのまま次Taskを受け取れます。
- **Permission BoundaryはUserが保持。** 見えるFolderは承認したものだけです。Capabilityは個別Switchで管理し、Read-onlyは書込み系Capabilityをまとめて停止します。

アプリ自身はModelをHostせずTrayで動作し、Browserで普段使っているChatGPTと連携します。

## ダウンロード

| Platform | x64 | ARM64 |
| --- | --- | --- |
| **Windows** | [Installer](../../releases/latest/download/Chat-On-Steroids-Setup-x64.exe) | [Installer](../../releases/latest/download/Chat-On-Steroids-Setup-arm64.exe) |
| **macOS** | [DMG](../../releases/latest/download/Chat-On-Steroids-macOS-x64.dmg) · [ZIP](../../releases/latest/download/Chat-On-Steroids-macOS-x64.zip) | [DMG](../../releases/latest/download/Chat-On-Steroids-macOS-arm64.dmg) · [ZIP](../../releases/latest/download/Chat-On-Steroids-macOS-arm64.zip) |
| **Linux** | [AppImage](../../releases/latest/download/Chat-On-Steroids-Linux-x64.AppImage) · [DEB](../../releases/latest/download/Chat-On-Steroids-Linux-x64.deb) | [AppImage](../../releases/latest/download/Chat-On-Steroids-Linux-arm64.AppImage) · [DEB](../../releases/latest/download/Chat-On-Steroids-Linux-arm64.deb) |

各Packageには対象CPU向けNative Dependency、Version固定済み`Tunnel Client`、ripgrep、Chrome拡張機能が含まれます。Manual Install用の [Extension ZIP](../../releases/latest/download/Chat-On-Steroids-Extension.zip) と、全ArtifactのHashを記載した [`SHA256SUMS.txt`](../../releases/latest/download/SHA256SUMS.txt) もReleaseへ添付します。

WindowsとAppImageは起動時および6時間ごとに**このHardened ForkのRelease**を確認し、新VersionがあればDownload、Checksum Verification、Stageを行います。Userが終了するか**アップデートをインストール**を選んだ際に適用します。Stage済みDownloadもInstall直前に再検証します。macOS / DEBはRelease PageからManual Updateします。

**Debian / UbuntuではDEBを推奨します。** AppImageはelectron-builderのStatic Launcherを使用し、HostがUnprivileged User Namespace（unprivileged user namespaces）を禁止しているとChromiumを`--no-sandbox`付きで起動するFallbackがあります。このFallbackを避けたい場合はDEBを使用してください。

**BuildはまだPublisher署名されておらず、macOSもNotarizeされていません。** SmartScreen、Gatekeeper、Browser等が警告する可能性があります。実行前にHashを確認してください。

```powershell
Get-FileHash .\Chat-On-Steroids-Setup-x64.exe -Algorithm SHA256   # Windows
```

```sh
shasum -a 256 Chat-On-Steroids-macOS-arm64.dmg    # macOS
sha256sum Chat-On-Steroids-Linux-x64.AppImage     # Linux
```

> **Betaであり、実PCへ作用するPermissionを扱います。** Fresh InstallはRead-onlyで開始し、browse / search / read / metadataのみ有効です。File変更、Command実行、Screen / Control、Clipboardは明示的なOpt-inが必要です。Multi-agentはWorker 2つで開始しますが、Unattributed Callは明示的に許可するまでBlockします。`exec_command`を有効にするとLogged-in User権限でProgramを実行できるため、接続前にFolderとPermissionを確認してください。

<a id="requirements"></a>
## 必要環境

- **Windows 10/11**、**macOS 13 Ventura以降（macOS 13 Ventura or newer）**、または現行Desktop **Linux**。DownloadしたBuildとCPU Architecture（x64 / ARM64）が一致していること。
- Companion Extension用に**Chrome 116以降**。ExtensionがなくてもMCP Tool自体は使えますが、Session Attribution、Compact & Resume、Worker Chat、Goal Loopは利用できません。
- **Linux:** GNOME KeyringやKWallet等のSecret Service Keyring。Electronの暗号化されない`basic_text` FallbackはCredential保存に使用しません。
- **Developer mode**とCustom MCP Appを利用できるChatGPT Workspace。利用可能な機能はChatGPT Plan / Workspace設定により異なります。最新条件はOpenAI公式の [Developer mode and MCP apps](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt) を確認してください。
- Plan / Goal / LoopでAPI生成を選択する場合のみ**OpenRouter API Key**。既定のChatGPT Helper方式では接続済みBrowser Sessionを使用します。

Custom Appを有効にした通常のChatGPT Conversationで使用します。

<a id="quick-start"></a>
## クイックスタート

1. CPUに合うBuildをInstallし、Chat On Steroidsを起動します。Tray / Menu Barに常駐します。
2. **設定 → ワークスペース**を開き、Permissionを確認してProject Folderを承認します。**追加**を押すかFolders CardへFolderをDropします。
3. OpenAI Secure MCP TunnelとRestricted API Keyを作成し、**接続**を押します。
4. ChatGPT WebでDeveloper Modeを有効にし、Tunnelから**Core** Appを作成します。Screen / Input / Clipboard Capabilityを明示的にONにした場合だけ**Desktop** Appも作成します。
5. **拡張機能フォルダーを開く**を押し、`chrome://extensions`でDeveloper Modeを有効化して**Load unpacked**を選択し、そのFolderを読み込みます。Pairingは自動です。

**設定 → セットアップ**では、実際のTrafficが確認できたStepだけを完了表示します。Chat画面ではProjectとModelを選び、Messageを入力するかGearから**プランを作成**できます。画像はAttach / Dropできます。

### OpenAI Secure MCP Tunnel（推奨）

1. [Platform → Tunnels](https://platform.openai.com/settings/organization/tunnels) で、ChatGPTと同じWorkspaceにTunnelを作り、ID（`tunnel_…`）をCopyします。
2. [Platform → API keys](https://platform.openai.com/settings/organization/api-keys) で**Restricted** Keyを作り、必要最小限のTunnel権限だけを許可します。
3. Setup TabへTunnel IDとKeyを貼り付けて**接続**します。
4. ChatGPTの **Settings → Apps → Advanced settings** からDeveloper Modeを有効にし、Tunnel TypeのCustom Appを作成します。検出されたActionを確認して有効にします。

CoreとOptional Desktop SurfaceはChatGPT上で別Connectorとして扱われるため、OpenAI Tunnel方式では別々のTunnel IDを使用します。Release BuildにはChecksum検証済み`Tunnel Client`を同梱します。明示的に設定したBinary Pathが最優先で、`PATH`はFallbackです。

### その他のTunnel

**Cloudflare Quick Tunnel:** **接続**を押し、表示されたURLをChatGPTのMCP Server URLとして使用します。URL内のRandom PathがSecretです。再起動ごとに変わります。

**独自HTTPS Tunnel:** アプリが表示するLoopback URLをExposeし、Secret Pathを含めたPublic URLをChatGPTへ設定します。

Permission変更はLocal Enforcementへ即座に反映されます。Tool Schema変更後はConnector RefreshをScheduleします。ChatGPT側が古いAction ListをCacheしている場合はCustom AppをRefreshしてください。

<a id="what-chatgpt-gets"></a>
## ChatGPTへ公開するTool

| Connector | Tool | 概要 |
| --- | --- | --- |
| **Core**（全Platform） | `read`, `view_image`, `find`, `apply_patch`, `exec_command`, `write_stdin`, `session`, `agents` | Approved Folder内のBounded Read / Search、Preflight済みMulti-file Patch、Shell / Interactive Terminal、Recorded Session参照、Worker Chat Control |
| **Desktop**（明示的に有効化した対応Platform） | `observe`, `computer` | Screenshot、Window / Control Inspection、Mouse、Keyboard、Clipboard |

Live Tool Listは設定に従います。`find`はCommandがOFFのときのNo-shell Search Fallbackです。Session finishを有効にするとAstra向け`session_finish`が追加されます。PermissionをOFFにすると、ChatGPT側に古いSchemaが残っていてもLocal Handlerが即座に拒否します。完全なContractは [`docs/tool-surface.md`](docs/tool-surface.md) を参照してください。

各CallはModelが処理できるStructured Outcomeを返します。Permission不足、Approved Root外Path、未回収のBackground Result、Caller Identity不足など、拒否した理由と次Actionを返します。

## SessionとChrome拡張機能

Recordingは初期ONで、設定からOFFにできます。Extensionが確認できるConversationについて、Message、Tool Call、アプリが実際に返したResultをDurable Local Historyへ記録します。この履歴をChat Timelineと`session` Toolが利用します。Retention既定値は30日です。

保存先:

- Windows: `%APPDATA%\chat-on-steroids\sessions\`
- macOS: `~/Library/Application Support/chat-on-steroids/sessions/`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/chat-on-steroids/sessions/`

Extensionは`chatgpt.com` / `chat.openai.com`とアプリのLoopback Bridgeだけで動作します。どのConversationがMCP Callを発行したかを証明し、Visible Transcriptを記録し、ChatGPT上へアプリ所有のTool表示を追加し、Worker TabをCoordinationします。App / Extensionは同じVersionで管理します。Update後はUnpacked ExtensionをReloadしてください。

### Desktop Composer

GearからChatごとのGoal / Loop、Task Editor、Plan作成、Compact & Resumeを操作します。横の小さいCircleは現在Chatの推定Token使用量を表示します。これはRecorder推定値でありProviderの正確なContext Counterではありません。

作業中の**今すぐ注入**はMessageをTool Delivery Queueへ入れ、次のEligible Callで渡します。複数のInjectionを待機できます。PlanはAstraなら`session_finish`、通常ModelならCompleted Answerの後に1Stageずつ進みます。Queue Cardは編集・取消できます。

### Compact & Resume

アプリはContext PressureをLocal推定します。Fresh Installでは約400k推定Tokenで警告し、533kをLocal Limitとして扱い、自動CompactのThresholdは400kです。**Pro Modelでは自動Compactを行いません。** これらはChatGPT自身のContext Counterではありません。

Compact & Resumeは現在ChatへHandoff Brief作成を要求し、それを保存して新しいConversationを開き、同じLocal SessionをRebindします。Brief作成中は旧ChatのLocal Tool Callを拒否するため、Handoff内容とMachine Stateがずれるのを防ぎます。Source / Destination SendにはDurable Checkpointがあり、Refresh、Tab Close、App Restartで同じPromptを二重送信しないよう設計されています。Handoffが完了できなければ元Sessionをそのまま維持します。Goal / Task / Worker Historyも一緒に移動します。

### Goal / Loop

通常Modelの**Goal**はCompleted Answerを確認し、Follow-upが必要か完了かを判断します。**Loop**はOFFにするまで継続Taskを生成します。Promptは**設定 → エージェントと自動化**から編集できます。既定はChatGPT Helper方式で、API方式では暗号化保存したOpenRouter Keyを使用します。

**Astraは挙動が異なります。** Session finishがONの場合、Goal / LoopはTool Injection経由で次Instructionを渡します。Queued User InstructionとPlan Stageを優先します。Astraが`session_finish`を呼び、待機Taskがない場合は、設定に従ってFinish NotificationまたはAutomatic Follow-upを生成します。生成したInstructionは後続のTool Callに付与され、本当にTurnが終了した後に勝手に新しいTurnを開始するものではありません。

Finish ReminderはPlanとは別のDelivery Layerで管理します。Desktop NotificationはOS Support / Notification Settingに依存します。

### Multi-agent Mode

1つのPrime Chatから最大8つ（既定2つ）のWorker Chatを開き、`agents` ToolでMessageを交換できます。Provider Rate Limitは引き続き適用され、Worker同士は直接通信しません。

Workerは再利用可能なConversationです。Resultを返すとSleepし、Slotを空けたままChat Historyを保持します。同じWorkerへMessageすると同じConversationをWakeします。Recorded Contextが約400kに達したWorkerは次の停止後に再利用不可になります。Worker自身はCompactしません。

各Primeは自身のWorker Historyを所有します。最後のWorkerがSleepしたRunはParkされ、別Chatが新しいRunを開始できます。元Primeは`agents action=status`からHistoryを確認し、Workerを再利用できます。Multi-agentをOFFにしてもHistoryは保持し、**Swarmをクリア**した場合だけ破棄します。

Identity-sensitive ActionはFail Closedです。Spawn / Message等にはExtensionがCaller Conversationを証明する必要があります。Extensionから見えない場所で使用したChatは通常Core Toolを利用できますが、Agent Controlはできません。

### ChatのBlock

ChatGPT PageがWedgedしてStop Buttonが効かない状態でもModelがToolを呼び続けることがあります。Chat Tabの**Block**は、そのConversationからのTool Callを拒否します。これはProvider Generationを直接Cancelする機能ではなく、Caller Ownershipが証明できたCallにのみ適用します。

<a id="security-in-one-page"></a>
## Security要点

- **File ToolはApproved Folder内。** PathをCanonicalize / Validateします。ただしApplication-level ContainmentでありOS Sandboxではありません。
- **CommandはFolder Sandbox外。** Approved Folderから開始しても、その後は通常User権限で動作します。
- **Desktop ControlはFolder Scope外。** 有効化するとWindows / macOS Desktop全体に作用します。
- **MCP ServerはLoopbackのみ。** Random Secret PathのBehindで待受し、ChatGPTからは設定したTunnelを経由します。Public Tunnel URLはPassword同様に扱ってください。
- **Browser BridgeもLoopbackのみでMCPとは別。** File / Command / Permission変更Routeを持ちません。
- **SecretはElectron `safeStorage`。** Windows DPAPI、macOS Keychain、Linux Secure Secret Storeを使用します。
- **Read-only Mode**はFile Write、Command、Desktop Control、Clipboard Writeをまとめて停止します。

Security問題は [`SECURITY.md`](SECURITY.md) に従ってPrivate Reportしてください。

### ExtensionとOpenAIの利用条件

MCP ConnectorはChatGPT Developer Mode / MCPの仕組みを利用します。一方Companion ExtensionはChatGPT Web UIを観測し、Rendered Conversation StateをLocalへ記録し、Multi-agentでは追加のChatGPT Tabを開いて入力します。これは通常のMCP Connectorとは異なるBrowser Automationを含みます。利用するAccountに適用されるOpenAIの [Terms / Policies](https://openai.com/policies/) とRate Limit等を確認し、Scraping、Limit回避、Safety Controlの迂回目的では使用しないでください。

## Troubleshooting

- **Permission変更後にToolが見えない / 古い:** Tool Schema変更後はConnector RefreshがScheduleされます。失敗した場合はChatGPT側Custom AppをRefreshしてください。Chrome Extension Reloadとは別です。
- **ExtensionがApp not foundを表示:** RecordingまたはMulti-agentがONである必要があります。その後Popupを開き直してください。
- **Extension Version mismatch:** App Update後にUnpacked ExtensionをReloadしてください。
- **`agents`が`UNIDENTIFIED_CALLER`:** Pairing済みBrowserでそのConversationを開き、ExtensionがRequest IDを観測できるようにしてください。Active TabからCallerを推測しません。
- **`COMPACTION_IN_PROGRESS`:** そのChatはHandoff中です。Briefを作成させ、Replacement Chatで作業を継続してください。
- **未署名AppのOS警告:** Betaでは想定されます。Override前に`SHA256SUMS.txt`を確認してください。
- **LinuxでSecure Credential Storage unavailable:** GNOME Keyring / KWalletをUnlockして再起動してください。
- **Tunnel unavailable:** Advanced設定で明示的な`Tunnel Client` / `cloudflared` Pathを指定するか、同梱Binaryを使用してください。

## 開発

```sh
npm ci
npm run dev        # Hot Reload付きでアプリを起動
npm run verify     # Typecheck + Test + Privacy Gate。CIと同じ検証
```

変更前に [`AGENTS.override.md`](AGENTS.override.md) と [`AGENTS.md`](AGENTS.md) を確認してください。Fork固有ルールは`AGENTS.override.md`、upstream Architecture / Invariantは`AGENTS.md`が正本です。

<a id="building"></a>
## Build

```sh
npm run dist:x64          # Windows x64
npm run dist:arm64        # Windows ARM64
npm run dist:mac:x64      # macOS Intel DMG + ZIP
npm run dist:mac:arm64    # macOS Apple Silicon DMG + ZIP
npm run dist:linux:x64    # Linux x64 AppImage + DEB
npm run dist:linux:arm64  # Linux ARM64 AppImage + DEB
```

対象OS上でPackageしてください。Release WorkflowはNative Windows / macOS / Linux Runnerを使用し、Tunnel / ripgrep AssetをPin + Verifyし、対象PlatformのNative DependencyをStageし、Packaged Runtime Smoke Testを行ってRelease Candidateを組み立てます。

## Contribution

Bug Report、Feature Request、PRを受け付けます。変更時は [`CONTRIBUTING.md`](CONTRIBUTING.md) とFork固有ルールを確認してください。Release Historyは [`CHANGELOG.md`](CHANGELOG.md) にあります。

## License

MIT。 [`LICENSE`](LICENSE) を参照してください。

OpenAIによる公式製品・Endorsementではありません。"ChatGPT" と "Codex" は対応対象を説明するために使用しているOpenAIのTrademarkです。
