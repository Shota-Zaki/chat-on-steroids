import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const script = path.join(process.cwd(), 'scripts', 'verify-public-history.mjs');
const repositories: string[] = [];
const maintainerName = 'Shota-Zaki';
const safeEmail = '246847859+Shota-Zaki@users.noreply.github.com';
const unsafeEmail = ['Shota-Zaki', 'example.invalid'].join('@');
const forkHttps = 'https://github.com/Shota-Zaki/chat-on-steroids.git';
const upstreamHttps = 'https://github.com/totec448-spec/chat-on-steroids.git';

function makeRepository(): string {
  const repository = mkdtempSync(path.join(tmpdir(), 'public-history-privacy-'));
  repositories.push(repository);
  execFileSync('git', ['init', '--initial-branch=main'], { cwd: repository });
  writeFileSync(path.join(repository, 'README.md'), 'clean\n');
  execFileSync('git', ['add', 'README.md'], { cwd: repository });
  commit(repository, 'Clean root', safeEmail);
  return repository;
}

function commit(repository: string, message: string, email: string): void {
  execFileSync('git', ['commit', '--allow-empty', '-m', message], {
    cwd: repository,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: maintainerName,
      GIT_AUTHOR_EMAIL: email,
      GIT_COMMITTER_NAME: maintainerName,
      GIT_COMMITTER_EMAIL: email,
    },
  });
}

function tag(repository: string, name: string, message: string, email: string): void {
  execFileSync('git', ['tag', '-a', name, '-m', message], {
    cwd: repository,
    env: {
      ...process.env,
      GIT_COMMITTER_NAME: maintainerName,
      GIT_COMMITTER_EMAIL: email,
      GIT_AUTHOR_NAME: maintainerName,
      GIT_AUTHOR_EMAIL: email,
    },
  });
}

function verify(repository: string) {
  return spawnSync(process.execPath, [script], {
    cwd: repository,
    encoding: 'utf8',
    windowsHide: true,
  });
}

afterEach(() => {
  for (const repository of repositories.splice(0)) {
    rmSync(repository, { recursive: true, force: true });
  }
});

describe('public-history privacy gate', () => {
  it('accepts the numeric GitHub noreply identity', () => {
    const repository = makeRepository();
    const result = verify(repository);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('privacy check passed');
  });

  it('rejects a non-noreply maintainer identity without printing the address', () => {
    const repository = makeRepository();
    commit(repository, 'Unsafe identity', unsafeEmail);

    const result = verify(repository);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('non-noreply maintainer email');
    expect(result.stderr).not.toContain(unsafeEmail);
  });

  it('rejects Claude session provenance in commit messages without echoing it', () => {
    const repository = makeRepository();
    const sessionUrl = ['https://claude.ai/code/', 'session_exampleIdentifier'].join('');
    commit(repository, `Unsafe trailer\n\n${['Claude', 'Session'].join('-')}: ${sessionUrl}`, safeEmail);

    const result = verify(repository);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Claude session');
    expect(result.stderr).not.toContain(sessionUrl);
  });

  /**
   * A full clone carries refs this branch will never contain: other contributors' fetched
   * branches, abandoned local experiments. Those cannot enter the releasable line, so they
   * are not this gate's business — and failing on them made a clean branch look unsafe.
   */
  it('passes a clean checked-out line even when an unrelated ref carries unsafe identity', () => {
    const repository = makeRepository();
    execFileSync('git', ['checkout', '-q', '-b', 'unrelated'], { cwd: repository });
    commit(repository, 'Unsafe identity on a ref this branch never contains', unsafeEmail);
    execFileSync('git', ['checkout', '-q', 'main'], { cwd: repository });

    const result = verify(repository);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('privacy check passed');
  });

  it('still rejects unsafe identity that is an ancestor of HEAD', () => {
    const repository = makeRepository();
    commit(repository, 'Unsafe identity in ancestry', unsafeEmail);
    commit(repository, 'Clean commit on top', safeEmail);

    const result = verify(repository);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('non-noreply maintainer email');
    expect(result.stderr).not.toContain(unsafeEmail);
  });

  /**
   * Once an unsafe commit is already on this fork's published main, a local hook cannot
   * unpublish it. The exemption is intentionally tied to the exact hardened-fork remote,
   * never merely to a ref named origin/main.
   */
  it('exempts unsafe identity that is already published on the hardened fork main', () => {
    const repository = makeRepository();
    execFileSync('git', ['remote', 'add', 'origin', forkHttps], { cwd: repository });
    commit(repository, 'Unsafe identity merged through the forge', unsafeEmail);
    execFileSync('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: repository });
    commit(repository, 'Clean local commit on top', safeEmail);

    const result = verify(repository);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('privacy check passed');
  });

  it.each([
    'https://github.com/Shota-Zaki/chat-on-steroids.git',
    'git@github.com:Shota-Zaki/chat-on-steroids.git',
    'ssh://git@github.com/Shota-Zaki/chat-on-steroids'
  ])('recognizes hardened fork main under an arbitrary remote name (%s)', (url) => {
    const repository = makeRepository();
    execFileSync('git', ['remote', 'add', 'origin', upstreamHttps], { cwd: repository });
    execFileSync('git', ['remote', 'add', 'published', url], { cwd: repository });
    execFileSync('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: repository });
    commit(repository, 'Already public hardened-fork commit', unsafeEmail);
    execFileSync('git', ['update-ref', 'refs/remotes/published/main', 'HEAD'], { cwd: repository });
    commit(repository, 'Local clean change', safeEmail);
    expect(verify(repository).status).toBe(0);
    commit(repository, 'New unpublished unsafe identity', unsafeEmail);
    expect(verify(repository).status).toBe(1);
  });

  it.each([
    'https://github.com/totec448-spec/chat-on-steroids.git',
    'https://github.com/Shota-Zaki/chat-on-steroids-extra.git',
    'https://github.com.example/Shota-Zaki/chat-on-steroids.git'
  ])('does not trust an unrelated or upstream origin/main (%s)', (url) => {
    const repository = makeRepository();
    execFileSync('git', ['remote', 'add', 'origin', url], { cwd: repository });
    commit(repository, 'Unpublished identity', unsafeEmail);
    execFileSync('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: repository });
    expect(verify(repository).status).toBe(1);
  });

  it('does not fall back to upstream when the hardened fork main has not been fetched', () => {
    const repository = makeRepository();
    execFileSync('git', ['remote', 'add', 'origin', upstreamHttps], { cwd: repository });
    execFileSync('git', ['remote', 'add', 'published', forkHttps], { cwd: repository });
    commit(repository, 'Only published on upstream-shaped origin/main', unsafeEmail);
    execFileSync('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: repository });
    expect(verify(repository).status).toBe(1);
  });

  it('still rejects unsafe identity a push would add ahead of hardened fork main', () => {
    const repository = makeRepository();
    execFileSync('git', ['remote', 'add', 'origin', forkHttps], { cwd: repository });
    execFileSync('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: repository });
    commit(repository, 'Unsafe identity not published yet', unsafeEmail);

    const result = verify(repository);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('non-noreply maintainer email');
    expect(result.stderr).not.toContain(unsafeEmail);
  });

  it('keeps annotated tags reachable from HEAD under the same checks', () => {
    const repository = makeRepository();
    const sessionUrl = ['https://claude.ai/code/', 'session_taggedIdentifier'].join('');
    tag(repository, 'v0.0.1-test', `Release\n\n${['Claude', 'Session'].join('-')}: ${sessionUrl}`, safeEmail);

    const result = verify(repository);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Claude session');
    expect(result.stderr).not.toContain(sessionUrl);
  });

  it('ignores an annotated tag that is not reachable from HEAD', () => {
    const repository = makeRepository();
    const sessionUrl = ['https://claude.ai/code/', 'session_otherLineIdentifier'].join('');
    execFileSync('git', ['checkout', '-q', '-b', 'other-line'], { cwd: repository });
    commit(repository, 'Only on the other line', safeEmail);
    tag(repository, 'v0.0.2-other', `Release\n\n${['Claude', 'Session'].join('-')}: ${sessionUrl}`, safeEmail);
    execFileSync('git', ['checkout', '-q', 'main'], { cwd: repository });

    const result = verify(repository);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('privacy check passed');
  });
});
