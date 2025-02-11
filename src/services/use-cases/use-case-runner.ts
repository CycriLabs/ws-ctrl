import { WorkspaceConfig } from '../../config.js';
import { Context, UseCase, UseCaseStep } from '../../types/index.js';
import {
  bold,
  execCommand,
  logger,
  readFile,
  writeFile,
} from '../../utils/index.js';
import { TemplatesAccess } from '../access/index.js';
import { UseCasesRepository } from '../index.js';
import { ScriptExecutor } from '../script-executor.js';
import { ContextCreator } from './context-creator.js';
import { Executor } from './executor.js';
import { executorMapping } from './executors/index.js';

export class UseCaseRunner {
  static create(
    config: WorkspaceConfig,
    templatesAccess: TemplatesAccess,
    scriptExecutor?: ScriptExecutor
  ): UseCaseRunner {
    return new UseCaseRunner(
      templatesAccess,
      UseCasesRepository.create(templatesAccess),
      ContextCreator.create(config, templatesAccess),
      scriptExecutor || ScriptExecutor.create()
    );
  }

  constructor(
    private readonly templatesAccess: TemplatesAccess,
    private readonly useCasesRepository: UseCasesRepository,
    private readonly contextCreator: ContextCreator,
    private readonly scriptExecutor: ScriptExecutor
  ) {}

  async run(
    useCase: UseCase | string,
    userContext: Context = {}
  ): Promise<Context> {
    if (typeof useCase === 'string') {
      const useCases = await this.useCasesRepository.loadUseCases();
      const foundUseCase = useCases.find(({ id }) => id === useCase);
      if (!foundUseCase) {
        throw new Error(`Use case not found: ${useCase}`);
      }

      return await this.#run(foundUseCase, userContext);
    } else {
      return await this.#run(useCase, userContext);
    }
  }

  async #run(useCase: UseCase, userContext: Context = {}): Promise<Context> {
    const { name, description, steps } = useCase;
    const runnerContext = await this.contextCreator.createContext(userContext);

    logger.log(`Running use case ${bold(name)}...`);
    if (description) {
      logger.log(`${description}`);
    }

    if (steps && steps.length !== 0) {
      logger.log(`Executing steps...`);

      return await this.#executeSteps(steps, runnerContext);
    }
    return runnerContext;
  }

  async #executeSteps(
    steps: UseCaseStep[],
    context: Context
  ): Promise<Context> {
    const stepsContext: Context = { ...context, STEPS: steps };
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      logger.log(`Step ${i + 1}: ${step.description || ''}`);

      const updatedContext = await this.#executeStep(step, stepsContext);
      Object.assign(stepsContext, updatedContext);
    }

    return stepsContext;
  }

  async #executeStep(step: UseCaseStep, context: Context): Promise<Context> {
    const stepContext: Context = { ...context, STEP: step };
    const { inputFile, abortIf, skipIf, loop } = step;

    if (inputFile) {
      const filePath = this.scriptExecutor.executeFormula<string>(
        inputFile,
        stepContext
      );
      stepContext.INPUT = await readFile(filePath);
    }

    if (abortIf) {
      const abort = this.scriptExecutor.executeFormula(abortIf, stepContext);

      if (abort) {
        throw new Error(`Stopping because 'abortIf' formula is met.`);
      }
    }

    if (skipIf) {
      const skip = this.scriptExecutor.executeFormula(skipIf, stepContext);

      if (skip) {
        logger.log(`Skipping step.`);
        return stepContext;
      }
    }

    if (loop) {
      const list = this.scriptExecutor.executeFormula<string>(
        loop.list,
        stepContext
      );
      if (!list || !Array.isArray(list)) {
        throw new Error(`List ${bold(loop.list)} not found in context.`);
      }

      const loopContext = { ...stepContext };
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const loopContextItem = { ...loopContext, [loop.name]: item };
        await this.#executeTypeStep(step, loopContextItem);
      }

      return stepContext;
    } else {
      return await this.#executeTypeStep(step, stepContext);
    }
  }

  async #executeTypeStep(
    step: UseCaseStep,
    stepContext: Context
  ): Promise<Context> {
    switch (step.type) {
      case 'FORMULA':
        return await this.#executeTypeFormula(step, stepContext);
      case 'COMMAND':
        return await this.#executeTypeCommand(step, stepContext);
      case 'EXECUTOR':
        return await this.#executeTypeExecutor(step, stepContext);
      case 'PROMPT':
        return await this.#executeTypePrompt(step, stepContext);
      case 'USE_CASE':
        return await this.#executeTypeUseCase(step, stepContext);
      default:
        throw new Error(`Unknown step type ${step.type}. Stopping.`);
    }
  }

  async #executeTypeFormula(
    step: UseCaseStep,
    context: Context
  ): Promise<Context> {
    if (!step.formula) {
      throw new Error('Formula missing in step.');
    }

    return await this.#executeInErrorBoundary(step, context, async () => {
      const result = this.scriptExecutor.executeFormula(step.formula!, context);
      if (step.outputFile && typeof result === 'string') {
        await writeFile(step.outputFile, result);
      }

      return { ...context, [step.resultVariable || 'STEP_RESULT']: result };
    });
  }

  async #executeTypeCommand(
    step: UseCaseStep,
    context: Context
  ): Promise<Context> {
    if (!step.command) {
      throw new Error('Command missing in step.');
    }

    return await this.#executeInErrorBoundary(step, context, async () => {
      const command = this.scriptExecutor.executeFormula<string>(
        step.command!,
        context
      );
      await execCommand(command, this.templatesAccess.getWorkspacePath());
      return context;
    });
  }

  async #executeTypeExecutor(
    step: UseCaseStep,
    context: Context
  ): Promise<Context> {
    if (!step.executor || !executorMapping[step.executor]) {
      throw new Error('Executor missing or not found: ' + step.executor);
    }

    const executor = this.#createExecutor(step.executor);
    return executor.execute(step, context);
  }

  async #executeTypePrompt(
    step: UseCaseStep,
    context: Context
  ): Promise<Context> {
    const executor = this.#createExecutor('custom-prompt');
    return executor.execute(step, context);
  }

  #createExecutor(name: string): Executor {
    return new executorMapping[name](this.scriptExecutor, this.templatesAccess);
  }

  async #executeTypeUseCase(
    step: UseCaseStep,
    context: Context
  ): Promise<Context> {
    if (!step.useCase) {
      throw new Error('Use case missing in step.');
    }

    const useCases = await this.useCasesRepository.loadUseCases('INITIAL');
    const useCase = useCases.find(useCase => useCase.id === step.useCase);
    if (!useCase) {
      throw new Error(`Use case not found: ${step.useCase}`);
    }

    logger.log(`Starting to run references use case...`);
    await this.run(useCase, context);
    return context;
  }

  async #executeInErrorBoundary(
    step: UseCaseStep,
    context: Context,
    callback: () => Promise<Context>
  ): Promise<Context> {
    try {
      return await callback();
    } catch (error: unknown) {
      if (step.catchErrors) {
        logger.error(`Error caught: ${(error as Error).message}. Continuing.`);
        return context;
      } else {
        throw error;
      }
    }
  }
}
