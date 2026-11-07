import { Command } from 'commander';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { createCompletionScript } from './completion.js';

const program = new Command()
  .addCommand(
    new Command('run').option('-u, --use-case [use-case]').option('--debug')
  )
  .addCommand(new Command('sync'));

const INJECTION = '$(touch pwned)';
const IDS = [INJECTION, 'enabled', 'no-state', 'upper'];

let workspace: string;

beforeAll(() => {
  workspace = temporaryDirectory();
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
  writeFileSync(join(useCases, 'upper.JSON'), JSON.stringify({ id: 'upper' }));
  writeFileSync(
    join(useCases, 'injection.json'),
    JSON.stringify({ id: INJECTION })
  );
});

afterAll(() => rmSync(workspace, { recursive: true, force: true }));

function complete(...words: string[]): string[] {
  return completeIn(workspace, {}, ...words);
}

function completeIn(
  cwd: string,
  env: Record<string, string>,
  ...words: string[]
): string[] {
  const script = `${createCompletionScript(program, 'bash')}
COMP_WORDS=(./cli.sh ${words.map(word => `'${word}'`).join(' ')})
COMP_CWORD=${words.length}
_ws_ctrl_cli
printf '%s\\n' "\${COMPREPLY[@]}"`;
  return execFileSync('bash', ['-c', script], {
    cwd,
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
    expect(complete('run', '-u', '')).toEqual(IDS);
    expect(complete('run', '--use-case', 'no')).toEqual(['no-state']);
  });

  test('should not expand the use case ids', () => {
    expect(complete('run', '-u', '$')).toEqual([INJECTION]);
    expect(existsSync(join(workspace, 'pwned'))).toBe(false);
  });

  test('should complete the use case ids after --use-case=', () => {
    // bash splits at the =, zsh keeps one word
    expect(complete('run', '--use-case', '=')).toEqual(IDS);
    expect(complete('run', '--use-case', '=', 'no')).toEqual(['no-state']);
    expect(complete('run', '--use-case=no')).toEqual(['--use-case=no-state']);
  });

  test('should read the use cases of the workspace given to run', () => {
    const cwd = dirname(workspace);
    expect(completeIn(cwd, {}, 'run', workspace, '-u', '')).toEqual(IDS);
    expect(
      completeIn(cwd, {}, 'run', '-u', 'x', workspace, '-u', 'no')
    ).toEqual(['no-state']);
    expect(completeIn(cwd, {}, 'run', '-u', '')).toEqual([]);
  });

  test('should expand ~ in the workspace given to run', () => {
    const env = { HOME: dirname(workspace) };
    const ws = `~/${basename(workspace)}`;
    expect(completeIn('/', env, 'run', ws, '-u', '')).toEqual(IDS);
  });

  test('should fall back to file name completion', () => {
    expect(createCompletionScript(program, 'bash')).toContain(
      'complete -o default -F _ws_ctrl_cli'
    );
  });

  test('should create fish completions for commands, options and use cases', () => {
    const script = createCompletionScript(program, 'fish');
    expect(script).toContain(
      'complete $target -n __fish_use_subcommand -a "run sync help"'
    );
    expect(script).toContain(
      'complete $target -n "__ws_ctrl_subcommand_is run" -s u -l use-case -x -a "(__ws_ctrl_use_cases)"'
    );
    expect(script).toContain(
      'complete $target -n "__ws_ctrl_subcommand_is run" -l debug'
    );
  });

  test.skipIf(!hasFish)('should complete the use case ids in fish', () => {
    const fish = (line: string) =>
      execFileSync(
        'fish',
        [
          '-c',
          `${createCompletionScript(program, 'fish')}\ncomplete -C "${line}"`,
        ],
        { cwd: workspace, encoding: 'utf8' }
      )
        .split('\n')
        .filter(Boolean)
        .map(line => line.split('\t')[0])
        .sort();
    expect(fish('./cli.sh run -u ')).toEqual(IDS);
    expect(fish(`./cli.sh run ${workspace} --use-case=no`)).toEqual([
      '--use-case=no-state',
    ]);
    expect(fish('./cli.sh sync run -')).not.toContain('--debug');
  });
});
