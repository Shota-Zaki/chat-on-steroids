(() => {
  const entries = [
    ['Looking for the app', 'アプリを探しています'],
    ['Reload companion', '拡張機能を再読み込み'],
    ['Restarts this extension. Then reopen this popup to check its connection.', 'この拡張機能を再起動します。その後、このポップアップを開き直して接続を確認してください。'],
    ['Reload requested. Reopen this popup to verify the connection.', '再読み込みを要求しました。このポップアップを開き直して接続を確認してください。'],
    ['Session capture', 'セッション記録'],
    ['ChatGPT tab', 'ChatGPTタブ'],
    ['Recording this chat', 'このチャットを記録'],
    ['Chat ID', 'Chat ID'],
    ['Request ID', 'Request ID'],
    ['Reaching the app', 'アプリへの送信状況'],
    ['Picked up', '取得'],
    ['Sent to app', 'アプリへ送信'],
    ['App processed', 'アプリ処理済み'],
    ['Augment ChatGPT', 'ChatGPT拡張'],
    ['Overwrite ChatGPT', 'ChatGPT表示を拡張'],
    ['Timestamps', 'タイムスタンプ'],
    ['Advanced', '詳細'],
    ['Copy', 'コピー'],
    ['Try again', '再試行'],
    ['Disconnect', '切断'],
    ['Connect', '接続'],
    ['Version mismatch', 'バージョン不一致'],
    ['Disconnected', '切断済み'],
    ['App not running', 'アプリが起動していません'],
    ['No recorder in this tab. Reload the page.', 'このタブにレコーダーがありません。ページを再読み込みしてください。'],
    ['Waiting for the first message.', '最初のメッセージを待っています。'],
    ['The app is not reachable. Nothing is leaving this browser.', 'アプリに接続できません。このブラウザからデータは送信されていません。'],
    ['Queued here. Retrying delivery to the app.', 'ここで待機中です。アプリへの送信を再試行しています。'],
    ['Delivered. The app has not opened a session for this chat yet.', '送信済みです。アプリ側ではこのチャットのセッションがまだ開かれていません。'],
    ['Every tool call matched end to end.', 'すべてのツール呼び出しをエンドツーエンドで照合できました。'],
    ['Recording into the app.', 'アプリへ記録中です。'],
    ['The app and this extension speak different bridge protocols.', 'アプリと拡張機能のBridgeプロトコルのバージョンが一致していません。'],
    ['Secure credential storage is unavailable. Open Chat On Steroids for setup instructions.', '安全な認証情報ストレージを利用できません。Chat On Steroidsを開いてセットアップ手順を確認してください。'],
    ['exact request id', '正確なRequest ID'],
    ['request id not resolved', 'Request ID未解決'],
    ['agent key', 'エージェントキー'],
    ['tool block on the page', 'ページ上のツールブロック'],
    ['the only chat generating', '生成中の唯一のチャット'],
    ['not placed in a chat', 'チャットへ紐付けできず'],
    ['tool call', 'ツール呼び出し'],
    ['yes', 'はい'],
    ['no', 'いいえ'],
    ['no record', '記録なし'],
    ['ok', '正常'],
    ['app', 'アプリ'],
    ['extension', '拡張機能'],
    ['chat id', 'Chat ID'],
    ['app session', 'アプリセッション'],
    ['tab', 'タブ'],
    ['ownership', '所有状態'],
    ['recorder', 'レコーダー'],
    ['turn', 'ターン'],
    ['observed', '観測済み'],
    ['in this browser', 'このブラウザ内'],
    ['last delivery', '最終送信'],
    ['delivered', '送信済み'],
    ['page sends', 'ページ送信'],
    ['retired', '終了済み'],
    ['bound', '紐付け済み'],
    ['unbound', '未紐付け'],
    ['not attached', '未接続'],
    ['live', '稼働中'],
    ['idle', '待機中'],
    ['none open', '開いているチャットなし'],
    ['answering', '回答中'],
    ['reload', '再読み込み'],
    ['new chat', '新しいチャット'],
    ['none yet', 'まだありません'],
    ['blocked', 'ブロック中'],
    ['waiting', '待機中'],
    ['failed', '失敗'],
    ['held', '保留'],
    ['queued', '待機'],
    ['Auto-compaction', '自動コンパクト'],
    ['Auto-compaction on', '自動コンパクト: オン'],
    ['Auto-compaction off', '自動コンパクト: オフ'],
    ['Compact & resume now', '今すぐコンパクトして再開'],
    ['Compact & Resume', 'コンパクトして再開'],
    ['Goal on', 'Goal: オン'],
    ['Goal off', 'Goal: オフ'],
    ['Loop on', 'Loop: オン'],
    ['Loop off', 'Loop: オフ'],
    ['Off', 'オフ'],
    ['Settings', '設定'],
    ['Cancel', 'キャンセル'],
    ['Save', '保存'],
    ['Done', '完了'],
    ['Retry', '再試行']
  ];

  const normalize = value => String(value || '').trim().replace(/\s+/g, ' ');
  const exact = new Map(entries.map(([source, target]) => [normalize(source), target]));
  const localized = value => exact.get(normalize(value)) || value;
  const patterns = [
    [/^Reload failed: (.+)$/, (_all, error) => `再読み込みに失敗しました: ${error}`],
    [/^Connected · Port (.+)$/, (_all, port) => `接続済み · ポート ${port}`],
    [/^Port (.+) · connecting$/, (_all, port) => `ポート ${port} · 接続中`],
    [/^(\d+) held$/, (_all, count) => `${count}件保留`],
    [/^(\d+) queued$/, (_all, count) => `${count}件待機`],
    [/^(\d+) held in page$/, (_all, count) => `ページ内で${count}件保留`],
    [/^(\d+) events · (\d+) calls$/, (_all, events, calls) => `${events}イベント · ${calls}呼び出し`],
    [/^(\d+) held · (\d+) total$/, (_all, held, total) => `${held}件保留 · 合計${total}件`],
    [/^(\d+) · (\d+) failed$/, (_all, total, failed) => `${total}件 · ${failed}件失敗`],
    [/^v(.+) · protocol (.+)$/, (_all, version, protocol) => `v${version} · プロトコル ${protocol}`],
    [/^v(.+) · port (.+)$/, (_all, version, port) => `v${version} · ポート ${port}`],
    [/^(.+) · epoch (.+)$/, (_all, value, epoch) => `${value} · エポック ${epoch}`],
    [/^(.+) · live$/, (_all, value) => `${value} · 稼働中`],
    [/^(\d+)s$/, (_all, value) => `${value}秒`],
    [/^(\d+)m$/, (_all, value) => `${value}分`],
    [/^(\d+)h$/, (_all, value) => `${value}時間`],
    [/^Auto-compaction on, from (.+) tokens$/, (_all, value) => `自動コンパクト: オン · ${value}トークンから`],
    [/^The app rejected the last delivery \((.+)\)\.$/, (_all, error) => `アプリが直前の送信を拒否しました（${error}）。`],
    [/^The extension is not accepting this tab’s observations \((.+)\)\. Reload the ChatGPT tab\.$/, (_all, error) => `拡張機能がこのタブの観測を受け付けていません（${error}）。ChatGPTタブを再読み込みしてください。`],
    [/^The app could not place (a call|\d+ calls) by request id — it fell back to (.+)\.$/, (_all, calls, fallback) => `アプリは${calls === 'a call' ? '1件の呼び出し' : calls.replace(' calls', '件の呼び出し')}をRequest IDで紐付けできず、${localized(fallback)}へフォールバックしました。`],
    [/^(.+) — picked up (yes|no) · sent (yes|no) · app (.+)$/, (_all, requestId, read, sent, app) => `${requestId} — 取得 ${localized(read)} · 送信 ${localized(sent)} · アプリ ${localized(app)}`],
    [/^(.+) · (\d+) · (\d+)(s|m|h) ago$/, (_all, state, count, value, unit) => `${localized(state)} · ${count} · ${value}${unit === 's' ? '秒' : unit === 'm' ? '分' : '時間'}前`]
  ];

  const translate = value => {
    const normalized = normalize(value);
    if (!normalized) return value;
    const mapped = exact.get(normalized);
    if (mapped) return mapped;
    for (const [pattern, replace] of patterns) {
      const match = pattern.exec(normalized);
      if (match) return replace(...match);
    }
    return value;
  };

  const ownedSelector = [
    '.clf-stream', '.clf-stage', '.clf-composer', '.clf-boot',
    '[data-clf-composer]', '[data-clf-menu]', '[data-clf-field]', '[data-clf-label]',
    '[class^="clf-"]', '[class*=" clf-"]'
  ].join(',');
  const protectedSelector = [
    'script', 'style', 'code', 'pre', 'textarea',
    '.clf-stream-text', '.clf-stream-tool-panel', '.clf-stream-tool-change',
    '.clf-tool-detail', '.clf-boot-preview', '.clf-stage-detail'
  ].join(',');
  const popup = location.protocol === 'chrome-extension:';
  if (popup) document.documentElement.lang = 'ja';

  const owned = element => popup || element.matches(ownedSelector) || Boolean(element.closest(ownedSelector));
  const protectedNode = element => !popup && Boolean(element.closest(protectedSelector));
  const attrs = ['title', 'aria-label', 'placeholder'];

  const text = node => {
    const parent = node.parentElement;
    if (!parent || !owned(parent) || protectedNode(parent) || parent.matches('script, style, code, pre, textarea')) return;
    const current = node.data;
    const translated = translate(current);
    if (translated === current) return;
    const leading = current.match(/^\s*/)?.[0] || '';
    const trailing = current.match(/\s*$/)?.[0] || '';
    node.data = `${leading}${translated}${trailing}`;
  };

  const element = root => {
    if (!(root instanceof Element) || !owned(root) || protectedNode(root)) return;
    if (root.matches('script, style, code, pre, textarea')) return;
    for (const attr of attrs) {
      const current = root.getAttribute(attr);
      if (!current) continue;
      const translated = translate(current);
      if (translated !== current) root.setAttribute(attr, translated);
    }
    for (const child of root.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) text(child);
      else if (child.nodeType === Node.ELEMENT_NODE) element(child);
    }
  };

  if (popup) element(document.documentElement);
  else document.querySelectorAll(ownedSelector).forEach(element);

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') {
        text(record.target);
        continue;
      }
      if (record.type === 'attributes') {
        element(record.target);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) text(node);
        else if (node.nodeType === Node.ELEMENT_NODE) element(node);
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: attrs
  });
})();
