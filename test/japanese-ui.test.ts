import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { translateJapaneseUiText } from '../src/renderer/ja-ui.js';

describe('Japanese UI localization', () => {
  it('translates human-facing app labels and dynamic status text', () => {
    expect(translateJapaneseUiText('Workspace')).toBe('ワークスペース');
    expect(translateJapaneseUiText('Allow unattributed calls')).toBe('出所不明の呼び出しを許可');
    expect(translateJapaneseUiText('Connected · Port 8765')).toBe('接続済み · ポート 8765');
    expect(translateJapaneseUiText('Usage could not be loaded. Try Refresh.')).toBe(
      '使用状況を読み込めませんでした。「更新」をお試しください。'
    );
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

  it('keeps user/model content and diagnostic surfaces outside the renderer localization boundary', () => {
    const source = readFileSync(new URL('../src/renderer/ja-ui.ts', import.meta.url), 'utf8');
    for (const protectedId of [
      '#timeline',
      '#handoffBox',
      '#sessionList',
      '#rootList',
      '#connectorCards',
      '#fullFeed',
      '#homeFeed',
      '#swarmList'
    ]) {
      expect(source).toContain(`'${protectedId}'`);
    }
  });

  it('keeps tool payloads and bootstrap text outside the companion localization boundary', () => {
    const source = readFileSync(new URL('../extension/ja.js', import.meta.url), 'utf8');
    for (const protectedSelector of [
      '.clf-stream-text',
      '.clf-stream-tool-panel',
      '.clf-stream-tool-change',
      '.clf-tool-detail',
      '.clf-boot-preview',
      '.clf-stage-detail'
    ]) {
      expect(source).toContain(`'${protectedSelector}'`);
    }
  });
});
