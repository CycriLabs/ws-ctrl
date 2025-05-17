import { Command } from 'commander';
import { CONFIG, initConfig } from '../../config.js';
import { TemplatesAccess, UseCaseRunner } from '../../services/index.js';
import { promptTextInput } from '../../shared/index.js';
import {
  inject,
  Injector,
  isExistingWorkspace,
  resolveWorkspacePath,
} from '../../utils/index.js';
import { workspacePathArgument } from '../arguments.js';

export async function initAction(
  workspacePathRaw: string,
  options: InitActionOptions
): Promise<void> {
  const userWorkspacePath = await promptTextInput(
    'Path to the new template repository directory',
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
  inject(Injector).register({
    provide: CONFIG,
    useFactory: () => config.store,
  });

  // copy templates from package/repo to workspace
  const templatesAccess = inject(TemplatesAccess);
  await templatesAccess.initWorkspace();

  const useCaseRunner = inject(UseCaseRunner);
  await useCaseRunner.run('init');
}

export const init = new Command()
  .name('init')
  .description('initialize the workspace')
  .addArgument(workspacePathArgument)
  .addOption(templatesRepository)
  .action(initAction);
