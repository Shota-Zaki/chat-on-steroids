const EXACT = new Map<string, string>([
  ['You', 'あなた'],
  ['ChatGPT (partial)', 'ChatGPT（途中）'],
  ['Arguments', '引数'],
  ['Result', '結果'],
  ['Turn started', 'ターン開始'],
  ['ChatGPT reported a problem', 'ChatGPTが問題を報告しました'],
  ['Unknown event', '不明なイベント'],
  ['Open sub-agent chat', 'サブエージェントのチャットを開く'],
  ['Sent to the active turn · awaiting receipt', '実行中のターンへ送信済み · 受領待ち'],
  ['Delivery confirmed', '送信確認済み'],
  ['Image unavailable', '画像を利用できません'],
  ['User attachment', 'ユーザー添付画像'],
  ['All', 'すべて'],
  ['Unattributed', '出所不明'],
  [
    'From a chat that Compact & Resume had already replaced — ChatGPT kept running its stopped turn there. Refused by design; nothing to repair.',
    'Compact & Resumeで置換済みのチャットからの呼び出しです。ChatGPT側では停止済みターンが継続していました。設計どおり拒否されており、修復は不要です。'
  ]
]);

const PATTERNS: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^Session started — (.+)$/, (_all, title) => `セッション開始 — ${title}`],
  [/^Turn reopened — (.+)$/, (_all, detail) => `ターン再開 — ${detail}`],
  [/^Turn completed(?: — (.+))?$/, (_all, detail = '') => `ターン完了${detail ? ` — ${detail}` : ''}`],
  [/^Turn failed(?: — (.+))?$/, (_all, detail = '') => `ターン失敗${detail ? ` — ${detail}` : ''}`],
  [/^Turn interrupted(?: — (.+))?$/, (_all, detail = '') => `ターン中断${detail ? ` — ${detail}` : ''}`],
  [/^Turn unknown(?: — (.+))?$/, (_all, detail = '') => `ターン状態不明${detail ? ` — ${detail}` : ''}`],
  [/^Handoff saved — (.+) characters \((.+)\)$/, (_all, chars, reason) => `引き継ぎを保存 — ${chars}文字（${reason}）`],
  [/^ … cut, (.+) characters in the original$/, (_all, chars) => ` … 省略（元の内容は${chars}文字）`],
  [/^Sent by (.+); recorded when the app accepted it$/, (_all, who) => `${who}が送信 · アプリ受理時に記録`],
  [/^Received by (.+); recorded when it acknowledged delivery$/, (_all, who) => `${who}が受信 · 受領確認時に記録`]
];

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

/** Recorded/model/user payloads stay exact; only the renderer-owned chrome around them is localized. */
const PROTECTED = [
  '.msg',
  '.pre',
  '.raw-facts',
  '.changes',
  '.tool > summary',
  '.thinking-line span',
  '.meta.is-progress',
  '.ev-note .meta',
  '.chip',
  '.agent-avatar'
].join(',');
const ATTRS = ['title', 'aria-label', 'alt'] as const;

function isProtected(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(PROTECTED));
}

function text(node: Text): void {
  if (isProtected(node)) return;
  const before = node.data;
  const after = translate(before);
  if (before === after) return;
  const leading = before.match(/^\s*/)?.[0] ?? '';
  const trailing = before.match(/\s*$/)?.[0] ?? '';
  node.data = `${leading}${after}${trailing}`;
}

function element(root: Element): void {
  if (isProtected(root)) return;
  for (const attr of ATTRS) {
    const before = root.getAttribute(attr);
    if (!before) continue;
    const after = translate(before);
    if (after !== before) root.setAttribute(attr, after);
  }
  for (const child of root.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) text(child as Text);
    else if (child.nodeType === Node.ELEMENT_NODE) element(child as Element);
  }
}

let installed = false;

export function installJapaneseTimelineUi(): void {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  installed = true;
  const roots = ['timeline', 'chatAgentFilter']
    .map((id) => document.getElementById(id))
    .filter((value): value is HTMLElement => value !== null);
  for (const root of roots) element(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) {
        text(record.target as Text);
        continue;
      }
      if (record.type === 'attributes' && record.target instanceof Element) {
        element(record.target);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) text(node as Text);
        else if (node.nodeType === Node.ELEMENT_NODE) element(node as Element);
      }
    }
  });
  for (const root of roots) {
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS]
    });
  }
}
