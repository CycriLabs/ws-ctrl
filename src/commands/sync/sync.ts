import { Command } from 'commander';
import { loadWorkspaceConfig } from '../../config.js';
import { TemplatesAccess, UseCaseRunner } from '../../services/index.js';
import { defaultWorkspacePathArgument } from '../arguments.js';

async function syncAction(workspacePathRaw: string): Promise<void> {
  const config = await loadWorkspaceConfig(workspacePathRaw);
  const templatesAccess = TemplatesAccess.create(config);
  await templatesAccess.syncTemplates();

  const useCaseRunner = UseCaseRunner.create(config, templatesAccess);
  await useCaseRunner.run('sync');
}

export const sync = new Command()
  .name('sync')
  .description(
    'syncs the workspace templates with the package & configured repository'
  )
  .addArgument(defaultWorkspacePathArgument)
  .action(syncAction);
