import { describe, expect, it } from 'vitest';
import { extensionDownloadUrl } from '../src/main/version.js';
import { LATEST_RELEASE_API, RELEASE_REPOSITORY } from '../src/shared/release.js';
import { RELEASES_PAGE } from '../src/shared/types.js';

describe('hardened fork release source', () => {
  it('keeps every release endpoint on the hardened fork', () => {
    expect(RELEASE_REPOSITORY).toBe('Shota-Zaki/chat-on-steroids');
    expect(LATEST_RELEASE_API).toBe(
      'https://api.github.com/repos/Shota-Zaki/chat-on-steroids/releases/latest'
    );
    expect(RELEASES_PAGE).toBe('https://github.com/Shota-Zaki/chat-on-steroids/releases/latest');
    expect(extensionDownloadUrl('2.0.6')).toBe(
      'https://github.com/Shota-Zaki/chat-on-steroids/releases/download/v2.0.6/Chat-On-Steroids-Extension.zip'
    );
  });
});
