import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../src/main/config.js';
import { DEFAULT_CAPABILITIES } from '../src/shared/types.js';

describe('hardened fresh-install defaults', () => {
  it.each(['win32', 'darwin', 'linux'] as const)(
    'starts read-only with only portable read capabilities on %s',
    (platform) => {
      const config = defaultConfig(platform);

      expect(config.capabilities).toEqual(DEFAULT_CAPABILITIES);
      expect(config.readOnly).toBe(true);
      expect(config.sessions.record).toBe(true);
      expect(config.multiAgent.enabled).toBe(true);
      expect(config.multiAgent.allowUnattributedCalls).toBe(false);
      expect(config.multiAgent.recoverAgentTabs).toBe(false);
    }
  );
});
