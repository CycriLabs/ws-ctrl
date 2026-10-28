import { Argument, Command } from 'commander';
import { basename } from 'node:path';

const SHELLS = ['bash', 'zsh', 'fish'] as const;
type Shell = (typeof SHELLS)[number];

/**
 * Prints the ids of the use cases selectable via `run -u`, read directly from
 * `config/use-cases` of the workspace given as first argument. Runs on every
 * tab press, so it stays a plain node call instead of going through npx.
 * A leading ~ is expanded here, since the shells pass the typed word as is.
 * Contains no single quotes, so it can be single-quoted in every shell.
 */
const listUseCasesJs = `const fs = require("fs"), path = require("path"), dir = path.join(process.argv[1].replace(/^~/, require("os").homedir()), "config", "use-cases");
for (const file of fs.readdirSync(dir).filter(file => file.endsWith(".json"))) {
  try {
    const useCase = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    if (!["DISABLED", "INITIAL", "HIDDEN"].includes(useCase.state)) console.log(useCase.id);
  } catch {}
}`;

const USE_CASE_FLAGS = ['-u', '--use-case'];

function optionWords(command: Command): string[] {
  const options = command.options.flatMap(option => [
    option.short,
    option.long,
  ]);
  const choices = command.registeredArguments.flatMap(arg => arg.argChoices);
  return [...options, ...choices].filter((word): word is string => !!word);
}

function commandNames(program: Command): string[] {
  return [...program.commands.map(command => command.name()), 'help'];
}

function createPosixScript(program: Command, shell: Shell): string {
  const zshPrelude = `(( $+functions[compdef] )) || { autoload -U +X compinit && compinit; }
autoload -U +X bashcompinit && bashcompinit
`;
  const words = program.commands.map(
    command =>
      `    ${command.name()}) words="${optionWords(command).join(' ')}" ;;`
  );

  return `# tab completion for the workspace cli.sh, created by: cli.sh completion ${shell}
${shell === 'zsh' ? zshPrelude : ''}
_ws_ctrl_use_cases() {
  node -e '${listUseCasesJs}' "$1" 2>/dev/null
}

_ws_ctrl_cli() {
  local cur="\${COMP_WORDS[COMP_CWORD]}" prev="\${COMP_WORDS[COMP_CWORD-1]}" words=""
  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=($(compgen -W "${commandNames(program).join(' ')}" -- "$cur"))
    return
  fi
  case "$prev" in
    ${USE_CASE_FLAGS.join('|')})
      COMPREPLY=($(compgen -W "$(_ws_ctrl_use_cases "$(dirname -- "\${COMP_WORDS[0]}")")" -- "$cur"))
      return ;;
  esac
  case "\${COMP_WORDS[1]}" in
${words.join('\n')}
  esac
  COMPREPLY=($(compgen -W "$words" -- "$cur"))
}

complete -F _ws_ctrl_cli cli.sh ./cli.sh
`;
}

function createFishScript(program: Command): string {
  const lines = [
    `complete $target -f`,
    `complete $target -n __fish_use_subcommand -a "${commandNames(program).join(' ')}"`,
  ];
  for (const command of program.commands) {
    const condition = `-n "__fish_seen_subcommand_from ${command.name()}"`;
    for (const option of command.options) {
      const flags = [
        option.short && `-s ${option.short.slice(1)}`,
        option.long && `-l ${option.long.slice(2)}`,
      ].filter(Boolean);
      const value = USE_CASE_FLAGS.includes(option.long ?? '')
        ? ' -x -a "(__ws_ctrl_use_cases)"'
        : option.required || option.optional
          ? ' -r'
          : '';
      lines.push(`complete $target ${condition} ${flags.join(' ')}${value}`);
    }
    const choices = command.registeredArguments.flatMap(
      arg => arg.argChoices ?? []
    );
    if (choices.length) {
      lines.push(`complete $target ${condition} -a "${choices.join(' ')}"`);
    }
  }

  return `# tab completion for the workspace cli.sh, created by: cli.sh completion fish

function __ws_ctrl_use_cases
    node -e '${listUseCasesJs}' (dirname -- (commandline -opc)[1]) 2>/dev/null
end

for target in "-c cli.sh" "-p */cli.sh"
    set target (string split -m 1 " " -- $target)
${lines.map(line => `    ${line}`).join('\n')}
end
`;
}

/**
 * Creates the tab completion script for the workspace `cli.sh`. Commands,
 * options and argument choices are taken from the given program; zsh uses the
 * bash script via bashcompinit.
 */
export function createCompletionScript(program: Command, shell: Shell): string {
  return shell === 'fish'
    ? createFishScript(program)
    : createPosixScript(program, shell);
}

const currentShell = basename(process.env.SHELL ?? '') as Shell;

const shellArgument = new Argument(
  '[shell]',
  'the shell to create the script for'
)
  .choices(SHELLS)
  .default(SHELLS.includes(currentShell) ? currentShell : 'bash');

export const completion = new Command()
  .name('completion')
  .description('prints a tab completion script for the workspace cli.sh')
  .addArgument(shellArgument)
  .action((shell: Shell, _options, command: Command) => {
    process.stdout.write(createCompletionScript(command.parent!, shell));
  });
