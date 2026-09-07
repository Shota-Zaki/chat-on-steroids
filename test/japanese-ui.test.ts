import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { translateJapaneseUiText } from '../src/renderer/ja-ui.js';
import { shouldInstallJapaneseUi } from '../src/renderer/ja-origin.js';

describe('Japanese UI localization', () => {
  it('translates human-facing app labels and dynamic status text', () => {
    expect(translateJapaneseUiText('Workspace')).toBe('ワークスペース');
    expect(translateJapaneseUiText('Allow unattributed calls')).toBe('出所不明の呼び出しを許可');
    expect(translateJapaneseUiText('Connected · Port 8765')).toBe('接続済み · ポート 8765');
    expect(translateJapaneseUiText('Rename /project')).toBe('/project の名前を変更');
    expect(translateJapaneseUiText('Open this chat in Chrome')).toBe('このチャットをChromeで開く');
    expect(translateJapaneseUiText('Starting')).toBe('起動中');
    expect(translateJapaneseUiText('3 of 8 permissions')).toBe('8件中3件の権限がオン');
    expect(translateJapaneseUiText('Usage could not be loaded. Try Refresh.')).toBe(
      '使用状況を読み込めませんでした。「更新」をお試しください。'
    );
  });

  it('preserves dynamic payload bytes while translating surrounding UI chrome', () => {
    expect(translateJapaneseUiText('Rename /My  Folder')).toBe('/My  Folder の名前を変更');
    expect(translateJapaneseUiText('Extension folder: C:\\My  Folder')).toBe(
      '拡張機能フォルダー: C:\\My  Folder'
    );
    expect(translateJapaneseUiText('Could not check for a newer version: E  42.')).toBe(
      '新しいバージョンを確認できませんでした: E  42。'
    );
  });

  it('installs automatic localization only in packaged and local development renderer origins', () => {
    expect(shouldInstallJapaneseUi({ protocol: 'file:', hostname: '' })).toBe(true);
    expect(shouldInstallJapaneseUi({ protocol: 'http:', hostname: 'localhost' })).toBe(true);
    expect(shouldInstallJapaneseUi({ protocol: 'http:', hostname: '127.0.0.1' })).toBe(true);
    expect(shouldInstallJapaneseUi({ protocol: 'http:', hostname: '::1' })).toBe(true);
    expect(shouldInstallJapaneseUi({ protocol: 'http:', hostname: '[::1]' })).toBe(true);
    expect(shouldInstallJapaneseUi({ protocol: 'https:', hostname: 'local.test' })).toBe(false);
    expect(shouldInstallJapaneseUi({ protocol: 'https:', hostname: 'example.com' })).toBe(false);
    expect(shouldInstallJapaneseUi(null)).toBe(false);
  });

  it('does not translate protocol contracts, tool names, stop markers, or arbitrary user text', () => {
    for (const value of [
      'exec_command',
      'write_stdin',
      'session_finish',
      'NO_REPLY',
      'CALLER_IDENTITY_REQUIRED',
      'My folder is named Settings and this sentence must stay exact.'
    ]) {
      expect(translateJapaneseUiText(value)).toBe(value);
    }
  });

  it('ships the Japanese companion script in both ChatGPT and popup surfaces', () => {
    const manifest = JSON.parse(readFileSync(new URL('../extension/manifest.json', import.meta.url), 'utf8')) as {
      name: string;
      description: string;
      content_scripts: Array<{ js?: string[] }>;
    };
    const popup = readFileSync(new URL('../extension/popup.html', import.meta.url), 'utf8');

    expect(manifest.name).toContain('コンパニオン');
    expect(manifest.description).toContain('セッション');
    expect(manifest.content_scripts[0]?.js).toContain('ja.js');
    expect(popup).toContain('<html lang="ja">');
    expect(popup).toContain('<script src="ja.js"></script>');
    expect(popup).toContain('セッション記録');
  });

  it('keeps user/model content and exact contract surfaces outside renderer localization', () => {
    const source = readFileSync(new URL('../src/renderer/ja-ui.ts', import.meta.url), 'utf8');
    for (const protectedSelector of [
      '#timeline',
      '#handoffBox',
      '#activeGoalRow',
      '#composerImages',
      '#connectorCards',
      '#fullFeed',
      '#homeFeed',
      '#swarmList',
      '.sess-top > b',
      '.project-name',
      '.root > b',
      '.root > span'
    ]) {
      expect(source).toContain(`'${protectedSelector}'`);
    }
    expect(source).not.toContain("'#sessionList'");
    expect(source).not.toContain("'#rootList'");
  });

  it('keeps dynamic pattern captures byte-preserving across renderer localization layers', () => {
    for (const file of ['ja.ts', 'ja-runtime.ts', 'ja-ui.ts', 'ja-timeline.ts', 'ja-composite.ts', 'ja-setup.ts']) {
      const source = readFileSync(new URL(`../src/renderer/${file}`, import.meta.url), 'utf8');
      expect(source).not.toContain('pattern.exec(normalized)');
    }
  });

  it('keeps tool payloads, bootstrap text, and goal/model data outside the companion localization boundary', () => {
    const source = readFileSync(new URL('../extension/ja.js', import.meta.url), 'utf8');
    for (const protectedSelector of [
      '.clf-stream-text',
      '.clf-stream-tool-panel',
      '.clf-stream-tool-change',
      '.clf-tool-detail',
      '.clf-boot-preview',
      '.clf-stage-detail',
      '.clf-stage-body',
      '.clf-menu-goal-text',
      '.clf-menu-goal-note[data-clf-warn="1"]'
    ]) {
      expect(source).toContain(`'${protectedSelector}'`);
    }
  });

  it('covers transient extension-owned controls while preserving dynamic model and run identifiers', () => {
    const source = readFileSync(new URL('../extension/ja.js', import.meta.url), 'utf8');
    for (const [english, japanese] of [
      ['copied', 'コピーしました'],
      ['copy failed', 'コピーに失敗しました'],
      ['Starting…', '開始中…'],
      ['Handoff saved, opening the fresh chat', '引き継ぎを保存しました。新しいチャットを開いています'],
      ['OpenRouter key required', 'OpenRouter APIキーが必要です'],
      ['add specific goal', '具体的なGoalを追加'],
      ['add specific loop', '具体的なLoopを追加'],
      ['working…', '処理中…'],
      ['A worker chat is already driven by its prime.', 'ワーカーチャットはすでにPrimeによって制御されています。'],
      ['This chat is blocked in the app. Release it there to drive it again.', 'このチャットはアプリでブロックされています。再開するにはアプリ側でブロックを解除してください。'],
      ['Add an OpenRouter API key in the app first.', '先にアプリでOpenRouter APIキーを追加してください。'],
      ['Pick Goal or Loop above first — Off writes nothing.', '先にGoalまたはLoopを選択してください。Offではメッセージを生成しません。']
    ]) {
      expect(source).toContain(english);
      expect(source).toContain(japanese);
    }
    expect(source).toContain('Replies as you until this chat’s goal is reached, then stops. Written with');
    expect(source).toContain('このチャットのGoalを達成するまであなたの代わりに返信し、達成後に停止します。');
    expect(source).toContain('Change or clear what this chat has to reach');
    expect(source).toContain('このチャットで達成する内容を変更またはクリアします');
    expect(source).toContain('/^fiber v(.+) · run (.+)$/');
    expect(source).toContain('`fiber v${version} · 実行 ${runId}`');
  });

  it('keeps renderer DOM localization under one protected observer owner', () => {
    const dictionary = readFileSync(new URL('../src/renderer/ja.ts', import.meta.url), 'utf8');
    const runtime = readFileSync(new URL('../src/renderer/ja-runtime.ts', import.meta.url), 'utf8');
    const presentation = readFileSync(new URL('../src/renderer/ja-ui.ts', import.meta.url), 'utf8');
    const dom = readFileSync(new URL('../src/renderer/dom.ts', import.meta.url), 'utf8');
    expect(dictionary).not.toContain('new MutationObserver');
    expect(dictionary).not.toContain('export function installJapaneseUi');
    expect(runtime).not.toContain('new MutationObserver');
    expect(runtime).not.toContain('installJapaneseRuntimeUi');
    expect(presentation).toContain('new MutationObserver');
    expect(presentation).toContain('export function installJapaneseUi');
    expect(dom).not.toContain('installJapaneseRuntimeUi');
  });

  it('requires the Japanese companion file in packaged runtime and release zip gates', () => {
    const smoke = readFileSync(new URL('../scripts/smoke-packaged-runtime.mjs', import.meta.url), 'utf8');
    const release = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
    expect(smoke).toContain("'extension/ja.js'");
    expect(release).toContain('content.js ja.js fiber.js');
  });
});
