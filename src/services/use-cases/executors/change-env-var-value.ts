import { Context, UseCaseStep } from '../../../types/index.js';
import { readFile, writeFile } from '../../../utils/index.js';
import { Executor } from '../executor.js';

export class ChangeEnvVarValue extends Executor {
  async execute(step: UseCaseStep, executorContext: Context): Promise<Context> {
    const { inputFile, outputFile, context } = step;
    if (!inputFile) {
      throw new Error('No input file provided.');
    }

    if (!context?.name || !context?.value) {
      throw new Error('Missing replacement target or value.');
    }

    // this is already loaded in the runner and available in the context,
    // but we reload again because someone may have changed within the context
    const fileInputPath = this.scriptExecutor.executeFormula<string>(
      inputFile,
      executorContext
    );
    const fileInput = await readFile(fileInputPath);

    const { name, value } = context as { name: string; value: string };
    // Escape special regex chars
    const escapedName = this.scriptExecutor
      .executeFormula<string>(name, executorContext)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceValue = this.scriptExecutor.executeFormula(
      value,
      executorContext
    );

    const result = fileInput.replace(
      new RegExp(`${escapedName}=.*`),
      `${escapedName}=${replaceValue}`
    );

    const outputFilePath = this.scriptExecutor.executeFormula<string>(
      outputFile || inputFile,
      executorContext
    );
    await writeFile(outputFilePath, result);

    return executorContext;
  }
}
