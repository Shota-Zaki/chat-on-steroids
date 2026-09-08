const EXACT = new Map<string, string>([
  ['Enter text or delete this stage.', 'テキストを入力するか、このステージを削除してください。'],
  ['Delivery not confirmed', '送信を確認できません'],
  ['Preparing follow-up', 'フォローアップを準備中'],
  ['Delivery confirmation pending', '送信確認待ち'],
  ['Sent to the active turn · awaiting receipt', '実行中のターンへ送信済み · 受領待ち'],
  ['Queued', '待機中'],
  ['Retry delivery', '送信を再試行'],
  ['Cancel delivery', '送信をキャンセル'],
  ['chat bound', 'チャット紐付け済み'],
  [
    'No workers are running. Reusable worker histories are parked and remain available to their prime chats; Clear swarm permanently removes them.',
    '実行中のワーカーはありません。再利用可能なワーカー履歴は待機状態でPrimeチャットから引き続き利用できます。「Swarmをクリア」で完全に削除できます。'
  ],
  [
    'No agents. The prime agent creates workers with the agents tool’s spawn action.',
    'エージェントはありません。Primeエージェントはagentsツールのspawnアクションでワーカーを作成します。'
  ]
]);

const PATTERNS: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^Stage (\d+)$/, (_all, n) => `ステージ ${n}`],
  [/^Edit stage (\d+)$/, (_all, n) => `ステージ ${n} を編集`],
  [/^Delete stage (\d+)$/, (_all, n) => `ステージ ${n} を削除`],
  [/^Scheduled (.+)$/, (_all, when) => `予定: ${when}`],
  [/^(\d+) pending$/, (_all, n) => `${n}件待機中`],
  [/^(\d+) delivered$/, (_all, n) => `${n}件送信済み`],
  [/^(\d+) pending · (\d+) delivered(?: · chat bound)?$/, (all, pending, delivered) => `${pending}件待機中 · ${delivered}件送信済み${all.endsWith('chat bound') ? ' · チャット紐付け済み' : ''}`],
  [/^Clear session — ends this run and every worker in it$/, () => 'セッションをクリア — この実行とすべてのワーカーを終了'],
  [/^Clear session — ends (.+) and frees its slot$/, (_all, id) => `セッションをクリア — ${id}を終了してスロットを解放`],
  [/^(.+) characters · from (\d+) events \(~(.+) tokens\) · (.+)$/, (_all, chars, events, tokens, ago) => `${chars}文字 · ${events}イベントから作成（約${tokens}トークン） · ${ago}`]
];

const ATTRS = ['title', 'aria-label'] as const;
const SAFE_SELECTOR = [
  '.stage-error',
  '.stage-number',
  '.dock-action',
  '.pending-message-status',
  '.model-sub',
  '#swarmList > .hint',
  '#handoffBox > p.hint:first-child'
].join(',');

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

function localize(element: Element): void {
  for (const attr of ATTRS) {
    const before = element.getAttribute(attr);
    if (!before) continue;
    const after = translate(before);
    if (after !== before) element.setAttribute(attr, after);
  }
  for (const child of element.childNodes) {
    if (child.nodeType !== Node.TEXT_NODE) continue;
    const text = child as Text;
    const before = text.data;
    const after = translate(before);
    if (after === before) continue;
    const leading = before.match(/^\s*/)?.[0] ?? '';
    const trailing = before.match(/\s*$/)?.[0] ?? '';
    text.data = `${leading}${after}${trailing}`;
  }
}

function scan(root: ParentNode): void {
  if (root instanceof Element && root.matches(SAFE_SELECTOR)) localize(root);
  for (const element of root.querySelectorAll(SAFE_SELECTOR)) localize(element);
}

let installed = false;

/**
 * Localize only app-owned controls inside composite surfaces whose payload text is intentionally
 * excluded from the general localization observer. User/model/task text itself is never scanned.
 */
export function installJapaneseCompositeUi(): void {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  installed = true;
  scan(document);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof Element) {
        if (record.target.matches(SAFE_SELECTOR)) localize(record.target);
        continue;
      }
      if (record.type === 'characterData') {
        const parent = record.target.parentElement;
        if (parent?.matches(SAFE_SELECTOR)) localize(parent);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
        else if (node.parentElement?.matches(SAFE_SELECTOR)) localize(node.parentElement);
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
