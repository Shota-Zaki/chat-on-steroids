import { describe, expect, it } from 'vitest';
import { extensionDownloadUrl } from '../src/main/version.js';
import { RELEASES_PAGE } from '../src/shared/types.js';

describe('hardened fork release source', () => {
  it('keeps manual and extension recovery downloads on the hardened fork', () => {
    expect(RELEASES_PAGE).toBe('https://github.com/Shota-Zaki/chat-on-steroids/releases/latest');
    expect(extensionDownloadUrl('2.0.6')).toBe(
      'https://github.com/Shota-Zaki/chat-on-steroids/releases/download/v2.0.6/Chat-On-Steroids-Extension.zip'
    );
  });
});
