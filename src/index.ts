#!/usr/bin/env node
import { Command } from 'commander';
import packageJson from '../package.json';
import { init, run, sync } from './commands/index.js';
import {
  TemplatesAccess,
  UseCaseRunner,
  UseCasesRepository,
} from './services/index.js';
import { RepositoriesRepository } from './services/repositories.repository.js';
import { ScriptExecutor } from './services/script-executor.js';
import { ServersRepository } from './services/servers.repository.js';
import { ContextCreator } from './services/use-cases/context-creator.js';
import { DefaultInjector, inject, Logger } from './utils/index.js';

const handleSigTerm = () => process.exit(0);
process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);
process.on('uncaughtException', err => {
  inject(Logger).error(err.message);
  process.exit(1);
});

DefaultInjector.getInstance([
  [Logger, { factory: () => new Logger() }],
  [ScriptExecutor, { factory: () => new ScriptExecutor() }],
  [TemplatesAccess, { factory: () => new TemplatesAccess() }],
  [RepositoriesRepository, { factory: () => new RepositoriesRepository() }],
  [ServersRepository, { factory: () => new ServersRepository() }],
  [UseCasesRepository, { factory: () => new UseCasesRepository() }],
  [ContextCreator, { factory: () => new ContextCreator() }],
  [UseCaseRunner, { factory: () => new UseCaseRunner() }],
]);

new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .addCommand(init)
  .addCommand(run)
  .addCommand(sync)
  .parseAsync()
  .catch(err => {
    inject(Logger).error(err.message);
    process.exit(1);
  })
  .finally(() => inject(Logger).success('Finished execution.'));
