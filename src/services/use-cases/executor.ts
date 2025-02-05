import { Context, UseCaseStep } from '../../types/index.js';
import { TemplatesAccess } from '../access/index.js';
import { ScriptExecutor } from '../script-executor.js';

export class Executor {
  constructor(
    protected readonly scriptExecutor: ScriptExecutor,
    protected readonly templatesAccess: TemplatesAccess
  ) {}

  /**
   * Main execution logic for the executor. Will be called by the use case runner.
   *
   * @param step the step related to the executor
   * @param context the context object
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(step: UseCaseStep, context: Context): Promise<Context> {
    throw new Error('Method not implemented.');
  }
}
