import { execSync } from 'node:child_process';
import { afterEach, describe, expect, Mock, test, vi } from 'vitest';

import { execCommand } from './processes.js';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

describe('processes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execCommand', () => {
    test('should return the output if captureStdout is true', async () => {
      const command = 'ls -la';
      const cwd = '/';
      const expectedOutput = 'total 0';
      (execSync as Mock).mockReturnValue(expectedOutput);

      const output = await execCommand(command, cwd, true);

      expect(execSync).toHaveBeenCalledWith(command, {
        cwd,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      expect(output).toBe(expectedOutput);
    });

    test('should run with stdio=inherit if captureStdout is false', async () => {
      const command = 'ls -la';
      const cwd = '/';
      (execSync as Mock).mockReturnValue('');

      await execCommand(command, cwd, false);

      expect(execSync).toHaveBeenCalledWith(command, {
        cwd,
        encoding: 'utf-8',
        stdio: 'inherit',
      });
    });
  });
});
