import { Command } from 'commander';
import { CONFIG, loadWorkspaceConfig } from '../../config.js';
import { TemplatesAccess, UseCaseRunner } from '../../services/index.js';
import { inject, Injector } from '../../utils/index.js';
import { defaultWorkspacePathArgument } from '../arguments.js';

async function syncAction(workspacePathRaw: string): Promise<void> {
  const config = await loadWorkspaceConfig(workspacePathRaw);
  inject(Injector).register({
    provide: CONFIG,
    useFactory: () => config,
  });

  const templatesAccess = inject(TemplatesAccess);
  const useCaseRunner = inject(UseCaseRunner);

  await templatesAccess.syncTemplates();
  await useCaseRunner.run('sync');
}

export const sync = new Command()
  .name('sync')
  .description(
    'syncs the workspace templates with the package & configured repository'
  )
  .addArgument(defaultWorkspacePathArgument)
  .action(syncAction);
