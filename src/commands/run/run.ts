import { Command, Option } from 'commander';
import { CONFIG, loadWorkspaceConfig } from '../../config.js';
import { UseCaseRunner } from '../../services/index.js';
import { UseCasesRepository } from '../../services/use-cases.repository.js';
import { promptEntitySelection } from '../../shared/entity-selection-prompt.js';
import { OptionInput } from '../../shared/index.js';
import { inject, Injector } from '../../utils/index.js';
import { defaultWorkspacePathArgument } from '../arguments.js';

const useCaseOption = new Option(
  '-u, --use-case [use-case]',
  'execute the use case with the given name'
);
const debugOption = new Option('--debug', 'enable debug mode');

interface RunActionOptions {
  useCase: OptionInput;
  debug: boolean;
}

export async function runAction(
  workspacePathRaw: string,
  options: RunActionOptions
) {
  const config = await loadWorkspaceConfig(workspacePathRaw, options.debug);
  inject(Injector).register(CONFIG, () => config);

  const useCaseRunner = inject(UseCaseRunner);
  const useCaseRepository = inject(UseCasesRepository);

  const useCases = await useCaseRepository.loadUseCases('INITIAL');
  const useCase = await promptEntitySelection(
    'Use case',
    options.useCase,
    useCases,
    {
      createTitle: useCase => `${useCase.name} (${useCase.id})`,
      displayFilter: useCase => useCase.state !== 'HIDDEN',
    }
  );

  await useCaseRunner.run(useCase);
}

export const run = new Command()
  .name('run')
  .description('run a use case in the workspace')
  .addArgument(defaultWorkspacePathArgument)
  .addOption(useCaseOption)
  .addOption(debugOption)
  .action(runAction);
