import { Context } from '../types/index.js';

export class ScriptExecutor {
  static create() {
    return new ScriptExecutor();
  }

  executeFormula<T = unknown>(formula: string, context: Context): T {
    try {
      const script = this.#prepareScriptExecution(formula, context);
      return (0, eval)(script);
    } catch (error) {
      throw new Error(`Error executing formula: ${error}`);
    }
  }

  #prepareScriptExecution(script: string, context: Context): string {
    const scriptContext = Object.entries(context).reduce(
      (acc, [key, value]) => `${acc}const ${key} = ${JSON.stringify(value)};`,
      ''
    );
    return `${scriptContext}${script}`;
  }
}
