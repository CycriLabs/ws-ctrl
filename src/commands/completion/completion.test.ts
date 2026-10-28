import { Command } from 'commander';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';
import { describe, expect, test } from 'vitest';
import { createCompletionScript } from './completion.js';

const program = new Command()
  .addCommand(
    new Command('run').option('-u, --use-case [use-case]').option('--debug')
  )
  .addCommand(new Command('sync'));

function createWorkspace(): string {
  const workspace = temporaryDirectory();
  const useCases = join(workspace, 'config', 'use-cases');
  mkdirSync(useCases, { recursive: true });
  const states = {
    enabled: 'ENABLED',
    hidden: 'HIDDEN',
    disabled: 'DISABLED',
    initial: 'INITIAL',
  };
  for (const [id, state] of Object.entries(states)) {
    writeFileSync(
      join(useCases, `${id}-file.json`),
      JSON.stringify({ id, state })
    );
  }
  writeFileSync(
    join(useCases, 'no-state.json'),
    JSON.stringify({ id: 'no-state' })
  );
  return workspace;
}

function complete(...words: string[]): string[] {
  return completeCli(join(createWorkspace(), 'cli.sh'), {}, ...words);
}

function completeCli(
  cli: string,
  env: Record<string, string>,
  ...words: string[]
): string[] {
  const script = `${createCompletionScript(program, 'bash')}
COMP_WORDS=("${cli}" ${words.map(word => `"${word}"`).join(' ')})
COMP_CWORD=${words.length}
_ws_ctrl_cli
printf '%s\\n' "\${COMPREPLY[@]}"`;
  return execFileSync('bash', ['-c', script], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
    .split('\n')
    .filter(Boolean)
    .sort();
}

const hasFish = spawnSync('fish', ['--version']).status === 0;

describe('completion', () => {
  test('should complete the commands', () => {
    expect(complete('')).toEqual(['help', 'run', 'sync']);
  });

  test('should complete the options of a command', () => {
    expect(complete('run', '-')).toEqual(['--debug', '--use-case', '-u']);
  });

  test('should complete the selectable use case ids, not the file names', () => {
    expect(complete('run', '-u', '')).toEqual(['enabled', 'no-state']);
    expect(complete('run', '--use-case', 'no')).toEqual(['no-state']);
  });

  test('should complete the use case ids of a cli.sh given with ~', () => {
    const workspace = createWorkspace();
    const cli = `~/${basename(workspace)}/cli.sh`;
    const env = { HOME: dirname(workspace) };
    expect(completeCli(cli, env, 'run', '-u', '')).toEqual([
      'enabled',
      'no-state',
    ]);
  });

  test('should create fish completions for commands, options and use cases', () => {
    const script = createCompletionScript(program, 'fish');
    expect(script).toContain(
      'complete $target -n __fish_use_subcommand -a "run sync help"'
    );
    expect(script).toContain(
      'complete $target -n "__fish_seen_subcommand_from run" -s u -l use-case -x -a "(__ws_ctrl_use_cases)"'
    );
    expect(script).toContain(
      'complete $target -n "__fish_seen_subcommand_from run" -l debug'
    );
  });

  test.skipIf(!hasFish)('should complete the use case ids in fish', () => {
    const cli = join(createWorkspace(), 'cli.sh');
    const output = execFileSync(
      'fish',
      [
        '-c',
        `${createCompletionScript(program, 'fish')}\ncomplete -C "${cli} run -u "`,
      ],
      { encoding: 'utf8' }
    );
    expect(output.split('\n').filter(Boolean).sort()).toEqual([
      'enabled',
      'no-state',
    ]);
  });
});
