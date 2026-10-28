#!/usr/bin/env node
import { Command } from 'commander';
import packageJson from '../package.json';
import { completion, init, run, sync } from './commands/index.js';
import {
  TemplatesAccess,
  UseCaseRunner,
  UseCasesRepository,
} from './services/index.js';
import { RepositoriesRepository } from './services/repositories.repository.js';
import { ScriptExecutor } from './services/script-executor.js';
import { ServersRepository } from './services/servers.repository.js';
import { ContextCreator } from './services/use-cases/context-creator.js';
import { createInjector } from './utils/di/create-injector.js';
import { setInjectImplementation } from './utils/di/di.js';
import { inject, Logger } from './utils/index.js';

const handleSigTerm = () => process.exit(0);
process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);
process.on('uncaughtException', err => {
  inject(Logger).error(err.message);
  process.exit(1);
});

const injector = createInjector([
  Logger,
  ScriptExecutor,
  TemplatesAccess,
  RepositoriesRepository,
  ServersRepository,
  UseCasesRepository,
  ContextCreator,
  UseCaseRunner,
]);
setInjectImplementation(injector);

new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .addCommand(init)
  .addCommand(run)
  .addCommand(sync)
  .addCommand(completion)
  .parseAsync()
  .catch(err => {
    inject(Logger).error(err.message);
    process.exit(1);
  })
  .finally(() => {
    // the completion script is printed to stdout, so it must stay clean
    if (process.argv[2] !== 'completion') {
      inject(Logger).success('Finished execution.');
    }
  });
