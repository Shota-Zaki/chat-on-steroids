import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: () => '/tmp/chat-on-steroids-update-test',
    isPackaged: true,
    relaunch: () => undefined
  }
}));
vi.mock('../src/main/logger.js', () => ({ logInfo: () => undefined, logWarn: () => undefined }));

const { checkForUpdates, resetUpdateForTests, updateStatus } = await import('../src/main/update.js');

beforeEach(() => {
  resetUpdateForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('treats a hardened fork with no published release as checked and up to date', async () => {
  const fetch = vi.fn(async () => new Response('{"message":"Not Found"}', { status: 404 }));
  vi.stubGlobal('fetch', fetch);

  await checkForUpdates();

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(updateStatus()).toMatchObject({ latest: null, stage: 'idle', error: null });
  expect(updateStatus().checkedAt).toBeGreaterThan(0);
});
