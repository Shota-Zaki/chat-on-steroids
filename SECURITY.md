# セキュリティポリシー

## 脆弱性の報告

**Security上の問題をPublic IssueやPull Requestへ投稿しないでください。** このRepositoryのGitHub Private Vulnerability Reporting、**Security → Report a vulnerability** を使用してください。

報告には、必要最小限の再現手順、アプリVersion、OS Version / Architecture、Chrome拡張機能が接続されていたかを含めてください。個人ファイルの内容、User名 / Path、会話内容、Account / Workspace識別子は伏せてください。実際に使用中のAPI Key、Connector URL、Tunnel TokenなどのCredentialは絶対に投稿しないでください。誤って公開したCredentialは直ちにRotateしてください。

このProjectは個人管理のBetaです。Bug Bountyや対応時間の保証はありません。

Security Fixは原則として**最新の公開Release**を対象にします。最新Versionで安全に再現できる場合は、その結果もPrivate Reportへ含めてください。

## Security Model

Chat On Steroidsは、ChatGPTと、このアプリを実行しているLogged-in OS Userとの間にPermission Boundaryを設けます。

- File System Toolは、Userが明示的に承認したFolderに対してPathを検証します。
- Read-only Modeでは、実効的なFile書き込み、Command実行、Desktop操作、Clipboard書き込みを無効化します。
- `exec_command` は意図的にApproved Folder内へSandboxされません。Approved Working Directoryから開始しますが、その後は通常のUser Account権限で実行されます。
- Screen、Mouse / Keyboard、Clipboard PermissionはWindows / macOSのDesktop全体に作用するCapabilityであり、Folder単位ではありません。Fresh InstallではOFFで開始し、macOSではOS側のScreen Recording / Accessibility許可も必要です。
- MCP ServerはLoopbackへBindし、Secret Tokenを含むPathを使用します。Public ReachabilityはUserが設定したTunnelからのみ提供されます。
- Companion Extension BridgeはMCPとは別のLoopback Serviceであり、File読取り、Command実行、Permission変更Routeを持ちません。
- 保存するAPI / Bridge CredentialにはElectron `safeStorage` を使用します。WindowsではDPAPI、macOSではKeychain、Linuxでは安全なDesktop Secret Storeを利用します。Linuxの`basic_text` Fallbackは拒否します。通常のActivity LogはRedact / Size Capされ、Credentialは記録しません。
- Session RecordingはCredential Storeとは別のDurable Local Historyです。Fresh InstallではONですが、設定で無効化できます。

## 既知の制約

以下は現在のDesign上の特性であり、それだけでは脆弱性報告の対象ではありません。

- **Release BinaryはPublisher署名されておらず、macOS BuildもNotarizeされていません。** Apple SiliconのMach-OにAd-hoc Signatureが付く場合がありますが、Publisher IdentityやGatekeeper Trustを証明するものではありません。Windows SmartScreen、macOS Gatekeeper、Browser等が警告する可能性があります。実行前にReleaseのSHA-256を確認してください。
- **Linux AppImageにはSandbox利用不可時のFallbackがあります。** HostがUnprivileged User Namespace（unprivileged user namespaces）を無効化している場合、electron-builderのStatic Launcherが`--no-sandbox`を追加することがあります。このFallbackを避けたいDebian / Ubuntu環境ではDEBを推奨します。
- **Fresh InstallはRead-onlyで開始し、browse / search / read / metadataのみONです。** File変更、Command実行、Screen / Control、Clipboard Capabilityは明示的なOpt-inが必要です。Multi-agentはONで開始しますが、Unattributed Callは初期状態でBlockされます。既存Installでは保存済みの明示的な選択を維持します。
- **Application-level Path CheckはKernel / VM Sandboxではありません。** File Toolを大きく制限しますが、同一User権限のLocal ProcessとのFile System Raceなどを完全隔離するものではありません。Approved RootをHostile Local Processからの隔離境界として扱わないでください。
- **CommandとDesktop CapabilityはDesign上強力です。** 有効化すると、通常のOS権限境界の範囲でLogged-in Userが操作できる場所へ作用できます。
- **Session Recordingは詳細であり、`safeStorage`では暗号化されません。** 記録した会話やTool ActivityはLocalに保存されますが、OS Accountへアクセスできる別User / Processから読まれる可能性があります。

## Scope

対象: このRepositoryのDesktop App、MCP Surface、Local Browser Bridge、`extension/` Companion。

対象外: ChatGPT / OpenAI Infrastructure、Electron / Chromium upstream、`tunnel-client`、`cloudflared`、その他Third-party Dependency。Upstream側の脆弱性は該当Projectにも報告してください。
