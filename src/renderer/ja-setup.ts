const EXACT = new Map<string, string>([
  ['ChatGPT has not called this app yet.', 'ChatGPTからこのアプリへの呼び出しはまだありません。'],
  ['For the connection, choose', '接続方式は'],
  ['and pick the tunnel you made in step 2.', 'を選び、ステップ2で作成したTunnelを指定してください。'],
  ['For the connection, paste the URL below into', '接続には、下のURLを'],
  [
    'The extension folder is missing from this installation. Reinstall the app, or use the extension/ folder from a source checkout.',
    'このインストールには拡張機能フォルダーがありません。アプリを再インストールするか、Source Checkoutのextension/フォルダーを使用してください。'
  ]
]);

const PATTERNS: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^ChatGPT connected (.+) but has never run a tool\. If it says “does not support developer MCPs”, switch Developer mode back on in ChatGPT → Settings → Apps & Connectors → Advanced\.$/, (_all, when) => `ChatGPTは${when}に接続しましたが、ツールはまだ実行されていません。「developer MCPsをサポートしていない」と表示される場合は、ChatGPT → Settings → Apps & Connectors → AdvancedでDeveloper modeを再度オンにしてください。`],
  [/^ChatGPT ran a tool (.+), but (.+) has never been called — create it in ChatGPT to use it\.$/, (_all, when, connectors) => `ChatGPTは${when}にツールを実行しましたが、${connectors}はまだ呼び出されていません。使用するにはChatGPTで作成してください。`],
  [/^ChatGPT ran a tool (.+) — the whole chain works\.$/, (_all, when) => `ChatGPTは${when}にツールを実行しました。接続経路全体が正常に動作しています。`],
  [/^Extension folder: (.+)$/, (_all, path) => `拡張機能フォルダー: ${path}`]
];

function translate(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  const exact = EXACT.get(normalized);
  if (exact) return exact;
  const trimmed = value.trim();
  for (const [pattern, replacer] of PATTERNS) {
    const match = pattern.exec(trimmed);
    if (match) return replacer(...match);
  }
  return value;
}

function text(node: Text): void {
  if (node.parentElement?.closest('#chatgptConn strong')) return;
  const before = node.data;
  const after = translate(before);
  if (after === before) return;
  const leading = before.match(/^\s*/)?.[0] ?? '';
  const trailing = before.match(/\s*$/)?.[0] ?? '';
  node.data = `${leading}${after}${trailing}`;
}

function element(root: Element): void {
  if (root.matches('#chatgptConn strong')) return;
  for (const child of root.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) text(child as Text);
    else if (child.nodeType === Node.ELEMENT_NODE) element(child as Element);
  }
}

let installed = false;

/** Dynamic setup prose only. Exact connector names/labels in <strong> remain unchanged. */
export function installJapaneseSetupUi(): void {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  installed = true;
  const roots = ['wizChatgpt', 'chatgptConn', 'extensionPath']
    .map((id) => document.getElementById(id))
    .filter((value): value is HTMLElement => value !== null);
  for (const root of roots) element(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) {
        text(record.target as Text);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) text(node as Text);
        else if (node.nodeType === Node.ELEMENT_NODE) element(node as Element);
      }
    }
  });
  for (const root of roots) observer.observe(root, { subtree: true, childList: true, characterData: true });
}
