import { translateUiText } from './ja.js';

const ATTRIBUTES = ['title', 'aria-label', 'placeholder'] as const;
const normalize = (value: string): string => value.trim().replace(/\s+/g, ' ');

const EXTRA = new Map<string, string>([
  ['Model availability and the work recorded in this workspace.', 'このワークスペースで利用できるモデルと記録済みの作業を確認します。'],
  ['Usage could not be loaded. Try Refresh.', '使用状況を読み込めませんでした。「更新」をお試しください。'],
  ['Reported by ChatGPT. Shared pools and feature quotas are listed separately. Missing data means not reported.', 'ChatGPTから報告された値です。共有プールと機能クォータは別に表示します。値がない項目は未報告です。'],
  ['ChatGPT has not reported per-model message balances. Shared usage and feature quotas do not establish a model-specific balance.', 'ChatGPTからモデル別のメッセージ残量は報告されていません。共有使用量や機能クォータからモデル固有の残量を推定することはできません。'],
  ['Recorded model attribution; missing history assumes GPT-5.6 High. Unchanged recordings reuse saved totals.', '記録済みのモデル情報を使用しています。履歴にモデル情報がない箇所はGPT-5.6 Highとして推定し、変更のない記録は保存済み集計を再利用します。'],
  ['USD / 1M cached input · editable official baseline, checked 5 September 2026', 'USD / 100万キャッシュ入力トークン · 編集可能な公式基準値（2026年9月5日確認）'],
  ['USD / 1M cached input · enter a verified comparison rate', 'USD / 100万キャッシュ入力トークン · 確認済みの比較単価を入力'],
  ['Cached-input equivalent, not a bill.', 'キャッシュ入力相当の比較値であり、実際の請求額ではありません。'],
  ['This is a comparison, not a bill.', 'これは比較用の見積もりであり、実際の請求額ではありません。'],
  ['Choose what ChatGPT can access and keep your connection healthy.', 'ChatGPTがアクセスできる範囲を選択し、接続状態を管理します。'],
  ['Nothing recorded yet. Turn on recording in Settings, pair the Chrome extension, and this fills up as you work in ChatGPT.', 'まだ記録はありません。設定で記録を有効にし、Chrome拡張機能を接続すると、ChatGPTでの作業内容がここに記録されます。'],
  ['Nothing shared yet. Press Add or drop a folder here. ChatGPT sees short names', 'まだ共有フォルダーはありません。「追加」を押すか、ここへフォルダーをドロップしてください。ChatGPTには短い名前だけが表示されます'],
  ['your real system paths are never sent.', '実際のシステムパスは送信されません。'],
  ['Six steps, once. Custom MCP apps need ChatGPT', '最初に6つの手順を実行します。カスタムMCPアプリにはChatGPTの'],
  ['web. Full write/modify MCP is currently available to Business, Enterprise and Edu; Pro custom MCP is limited to read/fetch access.', 'Web版が必要です。MCPの書き込み・変更機能の利用可否はChatGPTのプランとワークスペース設定に依存します。'],
  ['Nothing outside the folders you approve is reachable. Do this first — the tunnel will not start with nothing to serve.', '承認したフォルダーの外にはアクセスできません。共有対象がない状態ではTunnelを開始できないため、最初にフォルダーを選択してください。'],
  ['Screen and mouse/keyboard control are a separate connector, so they need a second tunnel. Create another one and paste its ID here. Leave it empty to keep desktop control off in ChatGPT.', '画面表示とマウス・キーボード操作は別コネクタのため、2つ目のTunnelが必要です。別のTunnelを作成してIDを貼り付けてください。空欄のままならChatGPT側のデスクトップ操作は無効です。'],
  ['Leave it running while you use the connector. It stays available when you close the window.', 'コネクタを使用している間は起動したままにしてください。ウィンドウを閉じてもバックグラウンドで利用できます。'],
  ['Use the exact name and description from the card — copy them, do not invent your own.', 'カードに表示された名前と説明をそのままコピーしてください。独自の文言へ変更しないでください。'],
  ['For authentication, scroll to the very bottom and pick', '認証方式は一番下までスクロールして'],
  ['No authentication', 'No authentication（認証なし）'],
  ['This app is protected by a secret address, not by a login.', 'を選択してください。このアプリはログインではなく秘密URLで保護されます。'],
  ['In ChatGPT, open Settings → Plugins (or Apps), select this plugin, and set its action permissions to', 'ChatGPTで Settings → Plugins（またはApps）を開き、このプラグインを選択してアクション権限を'],
  ['Allow all actions', 'Allow all actions（すべて許可）'],
  ['Repeat for the Desktop plugin if you added it.', 'Desktopプラグインを追加した場合も同じ設定を行ってください。'],
  ['This lets ChatGPT use the plugin without asking for each action. Otherwise, approval prompts can pause Goal, Loop and agent tasks. Your folder and tool permissions in this app still apply.', 'これによりChatGPTがアクションごとに確認を求めずプラグインを利用できます。このアプリ側のフォルダー権限・ツール権限は引き続き適用されます。'],
  ['Open', '開く'],
  ['Quit', '終了'],
  ['No internet', 'インターネット接続なし'],
  ['Keep app-created ChatGPT tabs in the background.', 'アプリが作成したChatGPTタブをバックグラウンドで保持します。'],
  ['Show recorded local activity in the ChatGPT page.', '記録したローカルアクティビティをChatGPTページ上に表示します。'],
  ['Uses the same preference as the extension popup.', 'Chrome拡張機能ポップアップと同じ設定を使用します。'],
  ['Then delete them. 0 keeps everything. Recording itself is a permission.', '指定日数を過ぎた記録を削除します。0ならすべて保持します。記録機能自体も権限設定です。'],
  ['API is the most reliable. Offline uses completion markers and 200 prepared messages.', 'APIが最も安定しています。オフラインでは完了マーカーと準備済みメッセージを使用します。'],
  ['Loop keeps going until you switch it off.', 'Loopはオフにするまで継続します。'],
  ['Model for ChatGPT-generated messages and plans. Select GPT-5.6 and High below for planning.', 'ChatGPTが生成するメッセージとプランに使用するモデルです。'],
  ['Used with the ChatGPT model above; independent from API reasoning.', '上のChatGPTモデルで使用します。API側の推論設定とは独立しています。'],
  ['Goal receives recorded tool arguments and results. Handoff briefs retain tool details.', 'Goalへ記録済みツール引数・結果を渡し、引き継ぎにもツール詳細を残します。'],
  ['Create staged tasks. ChatGPT uses the Goal, Loop and Plan model above; API uses the model and reasoning in API provider settings.', '段階的なタスクを作成します。ChatGPT生成では上のGoal・Loop・Planモデルを、API生成ではAPIプロバイダー設定を使用します。'],
  ['Ask Astra to keep the turn open for your next instruction. Tool changes refresh the connector automatically after 20 seconds.', 'Astraへ次の指示を受け取れるようターンの継続を要求します。ツール変更後はコネクタが自動更新されます。'],
  ['Automatic follow-ups use your Loop instructions and selected Loop source.', '自動フォローアップにはLoopの指示と選択した生成元を使用します。'],
  ['A request to the model, not a guaranteed countdown.', 'モデルへの要求であり、厳密なカウントダウンではありません。'],
  ['Confirmed in ChatGPT before a worker starts.', 'ワーカー開始前にChatGPT上で確認します。'],
  ['Selected independently from the model.', 'モデルとは独立して選択します。'],
  ['Keeps as many app chat tabs as your worker limit. Above that, the longest-idle chats close after one minute without work. Active turns and unsent drafts stay open.', 'ワーカー上限までアプリ管理のチャットタブを保持します。上限超過時は、作業のない状態が最も長いチャットから閉じます。実行中のターンと未送信下書きは保持されます。'],
  ['Default lets the provider decide, which is right for nearly every model. The rest cost more and take longer.', '標準ではプロバイダーに任せます。通常はこれで十分です。高い推論レベルほど処理時間やコストが増える場合があります。'],
  ['Reads the goal from your messages and stops when it is complete.', 'メッセージから目標を読み取り、完了したら停止します。'],
  ['Uses the objective saved in the chat controls. Stops when every requirement is met.', 'チャット設定に保存した目標を使用し、すべての要件を満たしたら停止します。'],
  ['Writes the next instruction after each answer, until you turn Loop off.', 'Loopをオフにするまで、回答のたびに次の指示を生成します。'],
  ['Requires the Chrome extension to be loaded and connected. This sets the most worker chats one run may open.', 'Chrome拡張機能の読み込みと接続が必要です。1回の実行で開けるワーカーチャットの最大数を設定します。'],
  ['Run self-contained calls even when the extension cannot prove which chat sent them. Activity stays visible as Unattributed.', '拡張機能が送信元チャットを証明できない場合でも自己完結型の呼び出しを実行します。安全性のため通常はオフを推奨します。'],
  ['Restore missing or unresponsive work chats. Goal and Loop chats recover automatically.', '見失った、または応答しない作業チャットを復旧します。Goal・Loopチャットは自動的に復旧します。'],
  ['No supported choices', '対応する候補がありません'],
  ['Usage token divisor', '使用量トークン除数'],
  ['Cached-input cost multiplier', 'キャッシュ入力コスト倍率']
]);

const EXTRA_PATTERNS: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^(.+) cached-input USD per million tokens$/, (_all, model) => `${model} キャッシュ入力 100万トークンあたりUSD`],
  [/^(.+) \+ unpriced$/, (_all, cost) => `${cost} + 単価未設定分`],
  [/^([\d,.]+) tokens have no rate\.$/, (_all, tokens) => `${tokens}トークンは単価未設定です。`],
  [/^([\d,.]+) estimated tokens; ([\d,.]+) have no comparison rate\. Cached-input equivalent, not a bill\.$/, (_all, tokens, missing) => `推定${tokens}トークン。うち${missing}トークンは比較単価未設定です。実際の請求額ではありません。`],
  [/^Final frontend context × unique tool calls ÷ (.+) × each model’s cached-input rate ÷ 1M × (.+)\.$/, (_all, divisor, multiplier) => `最終フロントエンドコンテキスト × 一意なツール呼び出し数 ÷ ${divisor} × 各モデルのキャッシュ入力単価 ÷ 100万 × ${multiplier}。`],
  [/^(.+) estimated equivalent\. (.+)?This is a comparison, not a bill\.$/, (_all, cost, extra = '') => `推定相当額 ${cost}。${extra ? `${extra}` : ''}これは比較用の見積もりであり、実際の請求額ではありません。`],
  [/^Weekly · (.+)$/, (_all, rest) => `週間枠 · ${translateJapaneseUiText(rest)}`],
  [/^(\d+)h window · (.+)$/, (_all, hours, rest) => `${hours}時間枠 · ${translateJapaneseUiText(rest)}`],
  [/^Resets (.+)$/, (_all, at) => `リセット: ${at}`],
  [/^(.+) remaining$/, (_all, value) => `残り ${value}`],
  [/^(.+) · checked (.+)$/, (_all, label, at) => `${label} · 確認 ${at}`]
];

export function translateJapaneseUiText(value: string): string {
  const base = translateUiText(value);
  if (base !== value) return base;
  const normalized = normalize(value);
  const exact = EXTRA.get(normalized);
  if (exact) return exact;
  for (const [pattern, replacer] of EXTRA_PATTERNS) {
    const match = pattern.exec(normalized);
    if (match) return replacer(...match);
  }
  return value;
}

/**
 * User-authored, model-authored, diagnostic, identifier, or copy-as-contract surfaces.
 * Presentation localization must never mutate these values in the DOM.
 */
const PROTECTED = [
  'script',
  'style',
  'code',
  'pre',
  'textarea',
  '#timeline',
  '#handoffBox',
  '#sessionList',
  '#inputQueue',
  '#taskPlanPreview',
  '#finishQueue',
  '#activeGoalRow',
  '#composerImages',
  '#rootList',
  '#connectorCards',
  '#fullFeed',
  '#homeFeed',
  '#swarmList',
  '#goalModelList'
].join(',');

function protectedNode(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(PROTECTED));
}

function translateTextNode(node: Text): void {
  if (protectedNode(node)) return;
  const current = node.data;
  const translated = translateJapaneseUiText(current);
  if (translated === current) return;
  const leading = current.match(/^\s*/)?.[0] ?? '';
  const trailing = current.match(/\s*$/)?.[0] ?? '';
  node.data = `${leading}${translated}${trailing}`;
}

function translateElement(element: Element): void {
  if (protectedNode(element)) return;
  for (const attribute of ATTRIBUTES) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    const translated = translateJapaneseUiText(current);
    if (translated !== current) element.setAttribute(attribute, translated);
  }
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) translateTextNode(child as Text);
    else if (child.nodeType === Node.ELEMENT_NODE) translateElement(child as Element);
  }
}

let installed = false;

/** Japanese presentation for app-owned chrome only; user/model content remains byte-for-byte untouched. */
export function installJapaneseUi(): void {
  if (
    installed ||
    typeof document === 'undefined' ||
    typeof MutationObserver === 'undefined' ||
    typeof Node === 'undefined' ||
    typeof Element === 'undefined'
  ) return;
  installed = true;
  document.documentElement.lang = 'ja';
  translateElement(document.documentElement);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) {
        translateTextNode(record.target as Text);
        continue;
      }
      if (record.type === 'attributes' && record.target instanceof Element) {
        translateElement(record.target);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...ATTRIBUTES]
  });
}
