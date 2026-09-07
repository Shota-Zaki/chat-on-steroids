export interface RendererLocationLike {
  protocol: string;
  hostname: string;
}

/**
 * Enable presentation localization only in the actual Electron renderer origins.
 * Packaged builds load from file:// and electron-vite development uses localhost.
 * Tests and any unexpected embedded origin remain untouched unless they opt in explicitly.
 */
export function shouldInstallJapaneseUi(location: RendererLocationLike | null | undefined): boolean {
  if (!location) return false;
  if (location.protocol === 'file:') return true;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return false;
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1';
}
