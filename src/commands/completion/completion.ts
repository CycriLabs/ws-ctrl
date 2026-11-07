import { Argument, Command } from 'commander';
import { basename } from 'node:path';

const SHELLS = ['bash', 'zsh', 'fish'] as const;
type Shell = (typeof SHELLS)[number];

/**
 * Prints the ids of the use cases selectable via `run -u` that start with the
 * prefix given as first argument, one per line. The remaining arguments are
 * the words typed after `run`; like `run`, it takes the workspace from the
 * first positional one (default: the current directory) and reads its
 * `config/use-cases`. A leading `~` or `~/` is expanded here, since the
 * shells pass the typed word as is.
 * Runs on every tab press, so it stays a plain node call instead of going
 * through npx. The rules mirror `UseCasesRepository` (DISABLED, plus INITIAL
 * and HIDDEN as `run` hides them) and `loadFilesFromDirectory` (.json in any
 * case); keep them in sync.
 * Contains no single quotes, so it can be single-quoted in every shell.
 */
const listUseCasesJs = `const fs = require("fs"), path = require("path"), os = require("os");
const [prefix, ...words] = process.argv.slice(1);
let workspace = ".";
for (let i = 0; i < words.length; i++) {
  if (words[i] === "-u" || words[i] === "--use-case") i += words[i + 1] === "=" ? 2 : 1;
  else if (!words[i].startsWith("-") && words[i] !== "=") { workspace = words[i]; break; }
}
const dir = path.join(workspace.replace(/^~(?=\\/|$)/, os.homedir()), "config", "use-cases");
for (const file of fs.readdirSync(dir)) {
  if (path.extname(file).toLowerCase() !== ".json") continue;
  try {
    const useCase = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    if (!["DISABLED", "INITIAL", "HIDDEN"].includes(useCase.state) && String(useCase.id).startsWith(prefix)) console.log(useCase.id);
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
# $1: prefix the ids must start with, $2: prepended to each id; one id per
# line, so ids are never expanded by the shell
_ws_ctrl_use_cases() {
  local id
  COMPREPLY=()
  while IFS= read -r id; do
    COMPREPLY+=("$2$id")
  done < <(node -e '${listUseCasesJs}' -- "$1" "\${COMP_WORDS[@]:2:$((COMP_CWORD-2))}" 2>/dev/null)
}

_ws_ctrl_cli() {
  local cur="\${COMP_WORDS[COMP_CWORD]}" prev="\${COMP_WORDS[COMP_CWORD-1]}" words=""
  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=($(compgen -W "${commandNames(program).join(' ')}" -- "$cur"))
    return
  fi
  # bash splits --use-case=<id> at the =, zsh keeps it as one word
  case "$prev" in
    ${USE_CASE_FLAGS.join('|')})
      if [ "$cur" = "=" ]; then _ws_ctrl_use_cases ""; else _ws_ctrl_use_cases "$cur"; fi
      return ;;
    =)
      if [ "\${COMP_WORDS[COMP_CWORD-2]}" = "--use-case" ]; then
        _ws_ctrl_use_cases "$cur"
        return
      fi ;;
  esac
  case "$cur" in
    --use-case=*)
      _ws_ctrl_use_cases "\${cur#--use-case=}" "--use-case="
      return ;;
  esac
  case "\${COMP_WORDS[1]}" in
${words.join('\n')}
  esac
  COMPREPLY=($(compgen -W "$words" -- "$cur"))
}

complete -o default -F _ws_ctrl_cli cli.sh ./cli.sh
`;
}

function createFishScript(program: Command): string {
  const lines = [
    `complete $target -f`,
    `complete $target -n __fish_use_subcommand -a "${commandNames(program).join(' ')}"`,
  ];
  for (const command of program.commands) {
    const condition = `-n "__ws_ctrl_subcommand_is ${command.name()}"`;
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

function __ws_ctrl_subcommand_is
    set -l words (commandline -opc)
    test "$words[2]" = "$argv[1]"
end

# fish filters by the typed prefix itself
function __ws_ctrl_use_cases
    node -e '${listUseCasesJs}' -- "" (commandline -opc)[3..-1] 2>/dev/null
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
