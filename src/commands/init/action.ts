import { initConfig } from '../../config.js';
import { TemplatesAccess, UseCaseRunner } from '../../services/index.js';
import {
  hasUserInput,
  OptionInput,
  promptInput,
  promptTextInput,
} from '../../shared/index.js';
import {
  isExistingWorkspace,
  resolveWorkspacePath,
} from '../../utils/index.js';

interface InitActionOptions {
  templatesRepository: OptionInput;
}

async function promptTemplateRepository(
  templatesRepository?: OptionInput
): Promise<string | null> {
  if (
    hasUserInput(templatesRepository) &&
    typeof templatesRepository === 'string'
  ) {
    return templatesRepository.trim();
  }

  const useTemplateRepository = await promptInput<boolean>(
    'toggle',
    'Do you want to use a template repository?'
  );
  return useTemplateRepository
    ? await promptInput<string>(
        'text',
        'Enter the name of the template repository'
      )
    : null;
}

export async function init(
  workspacePathRaw: string,
  options: InitActionOptions
): Promise<void> {
  const userWorkspacePath = await promptTextInput(
    'Path to the target workspace directory',
    workspacePathRaw
  );
  const workspacePath = resolveWorkspacePath(userWorkspacePath);
  const existingWorkspace = await isExistingWorkspace(workspacePath);
  if (existingWorkspace) {
    throw new Error('A workspace for the given path is already existing.');
  }

  // prompt whether to use a template repository
  const organization = await promptTextInput(
    'What is the name of your organization?'
  );

  // prompt whether to use a template repository
  const templatesRepository = await promptTemplateRepository(
    options.templatesRepository
  );

  // init config
  const config = initConfig(workspacePath, organization, templatesRepository);

  // copy templates from package/repo to workspace
  const templatesAccess = TemplatesAccess.create(config.store);
  await templatesAccess.initWorkspace();

  const useCaseRunner = UseCaseRunner.create(templatesAccess);
  await useCaseRunner.run('init');
}
