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
    ['copied', 'コピーしました'],
    ['copy failed', 'コピーに失敗しました'],
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
    ['Compact', 'コンパクト'],
    ['Cancel Compact & resume', 'コンパクトして再開をキャンセル'],
    ['Paused', '一時停止'],
    ['Opening…', '新しいチャットを開いています…'],
    ['Waiting…', '待機中…'],
    ['Opened', '開きました'],
    ['Starting…', '開始中…'],
    ['Stopping…', '停止中…'],
    ['Settling…', '確定待ち…'],
    ['Asking…', '依頼中…'],
    ['Writing…', '作成中…'],
    ['Saving…', '保存中…'],
    ['Handoff saved, opening the fresh chat', '引き継ぎを保存しました。新しいチャットを開いています'],
    ['The app is trying to open the fresh chat.', 'アプリが新しいチャットを開こうとしています。'],
    ['ChatGPT is writing the handoff', 'ChatGPTが引き継ぎを作成しています'],
    ['The fresh chat is open', '新しいチャットを開きました'],
    ['Resume cancelled', '再開をキャンセルしました'],
    ['Compaction failed', 'コンパクト処理に失敗しました'],
    ['Browser connection is disconnected in Chat On Steroids.', 'Chat On Steroidsのブラウザ接続が切断されています。'],
    ['Chat On Steroids is not running on this PC.', 'このPCでChat On Steroidsが起動していません。'],
    ['Nothing to compact yet — send a message, or set a goal and it writes one.', 'まだコンパクトする内容がありません。メッセージを送信するかGoalを設定してください。'],
    ['Preparing', '準備中'],
    ['Writing the handoff', '引き継ぎを作成中'],
    ['Saving it', '保存中'],
    ['Opening the new chat', '新しいチャットを開いています'],
    ['Opening a fresh chat', '新しいチャットを開いています'],
    ['Waiting for Chrome', 'Chromeを待機中'],
    ['Answer settling', '回答の確定待ち'],
    ['Reading the chat', 'チャットを読み取り中'],
    ['Writing the reply', '返信を作成中'],
    ['Sending', '送信中'],
    ['The goal loop stopped', 'Goalの継続処理が停止しました'],
    ['Sending it to ChatGPT', 'ChatGPTへ送信中'],
    ['Goal reached', 'Goalを達成しました'],
    ['nothing was sent', '送信は行われませんでした'],
    ['Checking the answer is finished', '回答が完了したことを確認中'],
    ['Sending the answer to OpenRouter', '回答をOpenRouterへ送信中'],
    ['Goal on', 'Goal: オン'],
    ['Goal off', 'Goal: オフ'],
    ['Loop on', 'Loop: オン'],
    ['Loop off', 'Loop: オフ'],
    ['Off', 'オフ'],
    ['Nothing is written here on its own.', 'ここでは自動でメッセージを送信しません。'],
    ['off here: worker chats never auto-compact', 'ここではオフ: ワーカーチャットは自動コンパクトしません'],
    ['off here: this chat is blocked in the app', 'ここではオフ: このチャットはアプリでブロックされています'],
    ['threshold set in the app', 'しきい値はアプリで設定されています'],
    ['compact this chat by hand', 'このチャットは手動でコンパクトします'],
    ['the prime writes here', 'Primeがここへ書き込みます'],
    ['blocked in the app', 'アプリでブロックされています'],
    ['OpenRouter key required', 'OpenRouter APIキーが必要です'],
    ['replies for ever', '返信を継続します'],
    ['replies until goal reached', 'Goal達成まで返信します'],
    ['no replies written here', 'ここでは返信を生成しません'],
    ['add specific goal', '具体的なGoalを追加'],
    ['add specific loop', '具体的なLoopを追加'],
    ['working…', '処理中…'],
    ['A worker chat is already driven by its prime.', 'ワーカーチャットはすでにPrimeによって制御されています。'],
    ['Pick Goal or Loop above first — Off writes nothing.', '先にGoalまたはLoopを選択してください。Offではメッセージを生成しません。'],
    ['Write what this chat has to reach. It then prompts until it is reached, and stops there.', 'このチャットで達成する内容を入力してください。達成するまで継続し、達成後に停止します。'],
    ['Write what this chat has to reach. It then prompts for ever — nothing but the Loop slider ends it.', 'このチャットで達成する内容を入力してください。Loopスライダーをオフにするまで継続します。'],
    ['Chat blocked', 'チャットはブロック中です'],
    ['This chat is blocked in the Chat On Steroids app: its tool calls are refused and Goal, Loop and auto-compaction are off. To release it, open the app’s Chat tab, hover this chat in the sessions list and press its block symbol.', 'このチャットはChat On Steroidsアプリでブロックされています。ツール呼び出しは拒否され、Goal・Loop・自動コンパクトもオフです。解除するにはアプリのChatタブを開き、セッション一覧でこのチャットにカーソルを合わせてブロックアイコンを押してください。'],
    ['Chat On Steroids settings', 'Chat On Steroids設定'],
    ['Goal mode', 'Goalモード'],
    ['What does this chat have to reach?', 'このチャットで達成する内容は？'],
    ['Save as loop', 'Loopとして保存'],
    ['Save as goal', 'Goalとして保存'],
    ['Clear', 'クリア'],
    ['Dismiss', '閉じる'],
    ['Dismiss Goal status', 'Goal状態を閉じる'],
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
    [/^from (.+) tokens$/, (_all, value) => `${value}トークンから`],
    [/^Retrying Goal in (\d+) seconds$/, (_all, seconds) => `${seconds}秒後にGoalを再試行`],
    [/^(.+) is writing the first message$/, (_all, model) => `${model}が最初のメッセージを作成中`],
    [/^(.+) is answering$/, (_all, model) => `${model}が回答を作成中`],
    [/^(.+) wrote the next message$/, (_all, model) => `${model}が次のメッセージを作成しました`],
    [/^Replies as you until this chat’s goal is reached, then stops\. Written with (.+)\.$/, (_all, model) => `このチャットのGoalを達成するまであなたの代わりに返信し、達成後に停止します。${model}で生成します。`],
    [/^Replies as you for ever — only this slider ends it\. Written with (.+)\.$/, (_all, model) => `あなたの代わりに返信を継続します。停止できるのはこのスライダーだけです。${model}で生成します。`],
    [/^(Change or clear|Write) what this chat has to reach\. It runs as (Goal|Loop)\.$/, (_all, action, mode) => `${action === 'Change or clear' ? 'このチャットで達成する内容を変更またはクリアします' : 'このチャットで達成する内容を入力します'}。${mode}として実行します。`],
    [/^fiber v(.+) · run (.+)$/, (_all, version, runId) => `fiber v${version} · 実行 ${runId}`],
    [/^Run by (.+), not by the chat you are reading\.$/, (_all, agent) => `${agent}が実行しました。現在読んでいるチャットによる実行ではありません。`],
    [/^(\d+) earlier calls? folded into this row by ChatGPT\. Show them\.$/, (_all, count) => `ChatGPTにより以前の${count}件の呼び出しがこの行へ折りたたまれています。表示します。`],
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
    '.clf-tool-detail', '.clf-boot-preview', '.clf-stage-detail', '.clf-stage-body',
    '.clf-menu-goal-text', '.clf-menu-goal-note[data-clf-warn="1"]'
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
