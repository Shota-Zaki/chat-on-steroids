const EXACT = new Map<string, string>([
  ['Starting', '起動中'],
  ['Connecting', '接続中'],
  ['Sign-in failed', '認証に失敗'],
  ['Tunnel unavailable', 'Tunnelを利用できません'],
  ['No tunnel yet', 'Tunnel未設定'],
  ['off', 'オフ'],
  ['off in read-only mode', '読み取り専用モードのためオフ'],
  ['session tool exposed', 'sessionツール公開中'],
  ['agents tool exposed', 'agentsツール公開中'],
  ['Record this chat locally, and expose the session tool in ChatGPT', 'このチャットをローカルへ記録し、ChatGPTにsessionツールを公開します'],
  ['Session recording', 'セッション記録'],
  ['List recent recordings or find past and concurrent work by text.', '最近の記録を一覧表示するか、テキストから過去・並行作業を検索します。'],
  ['Read one explicit recording, continue it, or expand one short T… tool reference.', '指定した記録を読み取り、続きを確認するか、短いT…ツール参照を展開します。'],
  ['Expose or hide the sub-agent tools in ChatGPT', 'ChatGPTでサブエージェントツールを表示または非表示にします'],
  ['Open worker ChatGPT conversations for parts of the task, on one shared context.', 'タスクの一部を担当するWorker ChatGPT会話を共有Context上で開きます。'],
  ['Steer one worker or several at once, or report back to prime.', '1つまたは複数のWorkerへ指示を送り、Primeへ結果を返します。'],
  ['See every worker, and collect messages not yet delivered on a tool result.', 'すべてのWorker状態と、Tool Resultで未配信のMessageを確認します。'],
  ['Hand the worker result back to prime and close that slot.', 'Worker ResultをPrimeへ返し、そのSlotを終了します。'],
  ["ChatGPT reaches this computer through an OpenAI tunnel. Nothing is exposed to the open internet.", 'ChatGPTはOpenAI Tunnel経由でこのPCへ接続します。PC側で一般公開Portを開くことはありません。'],
  ['Creates a temporary public https address with Cloudflare. The address changes on every restart.', 'Cloudflareで一時的なPublic HTTPS Addressを作成します。Addressは再起動ごとに変わります。'],
  ['This app only listens on localhost. You are responsible for exposing it.', 'このアプリはlocalhostでのみ待受します。外部公開はUser側で設定します。'],
  ['Secure credential storage is unavailable.', '安全な認証情報ストレージを利用できません。'],
  ['Checking for the latest update…', '最新アップデートを確認中…'],
  ['Checking for a newer version…', '新しいバージョンを確認中…'],
  ['the download stopped', 'ダウンロードが停止しました'],
  ['the check stopped', '確認処理が停止しました'],
  ['granted', '許可済み'],
  ['missing', '未許可'],
  ['unknown', '不明']
]);

const PATTERNS: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^(\d+) permissions?$/, (_all, count) => `${count}件の権限`],
  [/^(\d+) of (\d+) permissions$/, (_all, on, total) => `${total}件中${on}件の権限がオン`],
  [/^Screen Recording: (granted|missing|unknown)(?: · Accessibility: (granted|missing|unknown))?\. These are live verdicts from the native backend executing inside Chat On Steroids\. Grant the missing macOS permission, then fully quit and reopen the app\.$/, (_all, screen, accessibility) => {
    const state = (value: string) => EXACT.get(value) ?? value;
    const access = accessibility ? ` · アクセシビリティ: ${state(accessibility)}` : '';
    return `画面収録: ${state(screen)}${access}。これはChat On Steroids内のNative Backendが確認した現在の状態です。不足しているmacOS権限を許可した後、アプリを完全終了して再起動してください。`;
  }],
  [/^Accessibility: (granted|missing|unknown)\. These are live verdicts from the native backend executing inside Chat On Steroids\. Grant the missing macOS permission, then fully quit and reopen the app\.$/, (_all, accessibility) => `アクセシビリティ: ${EXACT.get(accessibility) ?? accessibility}。これはChat On Steroids内のNative Backendが確認した現在の状態です。不足しているmacOS権限を許可した後、アプリを完全終了して再起動してください。`],
  [/^Chat On Steroids (.+) is downloaded and ready\. Install it now, or it installs the next time you quit\.$/, (_all, version) => `Chat On Steroids ${version} をダウンロード済みです。今すぐインストールするか、次回終了時にインストールできます。`],
  [/^Chat On Steroids (.+) is downloading\. Keep working; you can install it when it lands\.$/, (_all, version) => `Chat On Steroids ${version} をダウンロード中です。作業は継続でき、完了後にインストールできます。`],
  [/^Chat On Steroids (.+) could not be downloaded: (.+)\.$/, (_all, version, error) => `Chat On Steroids ${version} をダウンロードできませんでした: ${error}。`],
  [/^Chat On Steroids (.+) is out\. This installation has to be updated by hand\.$/, (_all, version) => `Chat On Steroids ${version} が公開されています。このInstall方式では手動更新が必要です。`],
  [/^Could not check for a newer version: (.+)\.$/, (_all, error) => `新しいバージョンを確認できませんでした: ${error}。`],
  [/^Up to date! Chat On Steroids (.+?)(?: · extension (.+))?$/, (_all, version, extension) => `最新版です。Chat On Steroids ${version}${extension ? ` · 拡張機能 ${extension}` : ''}`],
  [/^The browser extension is (.+) and this app is (.+)\. Load the extension folder again in Chrome\.$/, (_all, extension, app) => `Browser Extensionは${extension}、アプリは${app}です。Chromeで拡張機能Folderをもう一度読み込んでください。`]
];

const PROTECTED = [
  'script', 'style', 'code', 'pre', 'textarea',
  '#timeline', '#handoffBox', '#inputQueue', '#taskPlanPreview', '#finishQueue',
  '#connectorCards', '#fullFeed', '#homeFeed', '#swarmList', '#goalModelList',
  '.sess-top > b', '.project-name', '.session-tooltip', '.root > b', '.root > span', '.root-rename'
].join(',');
const ATTRS = ['title', 'aria-label'] as const;

function translate(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  const exact = EXACT.get(normalized);
  if (exact) return exact;
  for (const [pattern, replacer] of PATTERNS) {
    const match = pattern.exec(normalized);
    if (match) return replacer(...match);
  }
  return value;
}

function protectedNode(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(PROTECTED));
}

function localizeText(node: Text): void {
  if (protectedNode(node)) return;
  const before = node.data;
  const after = translate(before);
  if (before === after) return;
  const leading = before.match(/^\s*/)?.[0] ?? '';
  const trailing = before.match(/\s*$/)?.[0] ?? '';
  node.data = `${leading}${after}${trailing}`;
}

function localizeElement(element: Element): void {
  if (protectedNode(element)) return;
  for (const attr of ATTRS) {
    const before = element.getAttribute(attr);
    if (!before) continue;
    const after = translate(before);
    if (after !== before) element.setAttribute(attr, after);
  }
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) localizeText(child as Text);
    else if (child.nodeType === Node.ELEMENT_NODE) localizeElement(child as Element);
  }
}

let installed = false;

export function installJapaneseRuntimeUi(): void {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  installed = true;
  localizeElement(document.documentElement);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) {
        localizeText(record.target as Text);
        continue;
      }
      if (record.type === 'attributes' && record.target instanceof Element) {
        localizeElement(record.target);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) localizeText(node as Text);
        else if (node.nodeType === Node.ELEMENT_NODE) localizeElement(node as Element);
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...ATTRS]
  });
}
