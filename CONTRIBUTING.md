# Contribution Guide

Chat On SteroidsはWindows / macOS / Linux対応のBetaで、現在は個人でMaintenanceしています。Bug Report、目的が明確なFix、具体的な改善を歓迎します。

## Pull Requestを作成する前に

小さくない変更を行う場合は、意図するBehaviorを明確にするため先にIssueを作成してください。Security上の問題はIssue / PRではなく、[`SECURITY.md`](SECURITY.md) に従ってPrivate Reportしてください。

変更範囲は必要最小限に保ってください。Issueが明示的に変更を要求していない限り、既存のPermission、Identity、Recovery Behaviorを維持してください。無関係なFormatting、Generated Output、Local Debug Material、Private Dataを含めないでください。Screenshot、Log、Exampleでは実際のUser名、Local Path、Chat本文、ID、Credentialを、`C:\Users\you\project` や `/home/you/project` のような明確なPlaceholderへ置き換えてください。

利用者向けUIを追加・変更する場合は、`AGENTS.override.md` の日本語UI方針に従い、同じ変更で日本語表示と必要なRegression Testを追加してください。Tool名、Protocol Identifier、Error Code、User / Model本文などのMachine Contractは翻訳しません。

## Development Setup

DevelopmentにはNode 22以降が必要で、Windows / macOS / LinuxをSupportします。Desktop / Computer-useはWindows / macOS Native Helperを共通ProtocolのBehindに持ちます。Core、Extension、Session、Agent、TunnelのBehaviorはPortableな状態を維持してください。macOS Helper変更にはXcode / SwiftとPackaged arm64またはx64 Smoke Checkが必要です。

```sh
npm ci
npm run verify     # CIと同じVerification Gate
npm run dev        # Electron Development Build
```

Behaviorを変更する場合は、可能な限りDeterministic Regression Testを追加してください。作業中は最寄りのFocused Testを実行し、提出前に`npm run verify`を実行してください。

## Packaging

Release PackageはPlatform / Architectureごとに作成します。

```sh
npm run dist:x64
npm run dist:arm64
npm run dist:mac:x64
npm run dist:mac:arm64
npm run dist:linux:x64
npm run dist:linux:arm64
```

Release CIは各Platform / ArchitectureをNative Runner上でBuild / Smoke Testします。PackagingはVersion固定済みExternal AssetをDownload / Stageし、Checksumを検証するため、最初のPackaging RunではNetwork Accessが必要です。electron-builderが別OS向けArtifactを生成できたという理由だけで、Cross-OS Packageを検証済みと報告しないでください。

## Pull Request

Root Cause、Fixに必要な最小Behavior Change、実施したVerificationを具体的に説明してください。Packaging / Runtime変更では、必要に応じてPackaged-runtime Smoke Checkも含めてください。

Contributionは [`LICENSE`](LICENSE) のMIT License条件で受け入れます。
