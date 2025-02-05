import { Command, Option } from 'commander';
import { workspacePathArgument } from '../arguments.js';
import { init as initAction } from './action.js';

const templatesRepository = new Option(
  '--templates-repository <templatesRepository>',
  'use a template repository'
);

export const init = new Command()
  .name('init')
  .description('initialize the workspace')
  .addArgument(workspacePathArgument)
  .addOption(templatesRepository)
  .action(initAction);
