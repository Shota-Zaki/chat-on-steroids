export const RELEASE_REPOSITORY = 'Shota-Zaki/chat-on-steroids';

export const LATEST_RELEASE_API = `https://api.github.com/repos/${RELEASE_REPOSITORY}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${RELEASE_REPOSITORY}/releases/latest`;

/** Build a release asset URL owned by this hardened fork. */
export function releaseAssetUrl(version: string, name: string): string {
  return `https://github.com/${RELEASE_REPOSITORY}/releases/download/v${encodeURIComponent(version)}/${name}`;
}
