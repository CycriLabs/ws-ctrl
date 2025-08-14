import { execSync } from 'node:child_process';

export const OS = process.platform;

export async function execCommand(
  command: string,
  cwd: string,
  captureStdout = false
) {
  return execSync(command, {
    cwd,
    encoding: 'utf-8',
    stdio: captureStdout ? 'pipe' : 'inherit',
  });
}
