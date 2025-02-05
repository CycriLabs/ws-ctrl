import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export async function gitUpdate(
  url: string,
  cwd: string,
  targetDir: string
): Promise<void> {
  const existing = existsSync(join(targetDir, '.git'));
  if (existing) {
    spawnSync('git', ['pull'], {
      cwd: targetDir,
      stdio: 'inherit',
    });
  } else {
    spawnSync('git', ['clone', url, targetDir], {
      cwd,
      stdio: 'inherit',
    });
  }
  return Promise.resolve();
}
