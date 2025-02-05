import { execSync } from 'node:child_process';

export async function execCommand(command: string, cwd: string) {
  return execSync(command, {
    cwd,
    stdio: 'inherit',
  });
}
