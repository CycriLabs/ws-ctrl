import { BaseEntity } from './base-entity.js';

/**
 * A context is a record that can hold any type of value. It is used to pass
 * information from one step to another or provide initial data.
 */
export type Context = Record<string | symbol, unknown>;

/**
 * A flag for the use case to control where to show and use:
 * - ENABLED: default; will be set automatically if not defined
 * - DISABLED: use case is not shown and can't be executed
 * - INITIAL: use case can only be executed during workspace init phase
 * - HIDDEN: use case can be executed/referenced but is hidden from selection lists
 */
export type UseCaseState = 'ENABLED' | 'DISABLED' | 'INITIAL' | 'HIDDEN';

/**
 * A step in a use case. It can be a formula, a command, an executor, a use case
 * or a prompt. The step is executed in the order they are defined in the use
 * case.
 */
export interface UseCaseStep {
  /**
   * Type of the step. Depending on the type, only specific attributes are
   * take into account for this step.
   */
  type: 'FORMULA' | 'COMMAND' | 'EXECUTOR' | 'USE_CASE' | 'PROMPT';
  /**
   * A description of the step. It will be printed in the console.
   */
  description?: string;
  /**
   * A loop to be executed. It
   * - iterates over a list of items
   * - sets a variable to the current item
   */
  loop?: {
    list: string;
    name: string;
  };
  /**
   * The input file to be used in the step. It is read in and passed to the formula.
   */
  inputFile?: string;
  /**
   * The output file to be used in the step. It is written to by the formula.
   */
  outputFile?: string;
  /**
   * A Javascript expression that is evaluated to determine if the step is valid
   * and can be executed. If not, the whole execution use case is stopped.
   */
  abortIf?: string;
  /**
   * A Javascript expression that is evaluated to determine if the step is valid
   * and can be executed. If not, the step is skipped.
   */
  skipIf?: string;
  /**
   * The use case to be executed. It is a reference to another use case.
   */
  useCase?: string;
  /**
   * Allows to execute a Javascript expression. It is evaluated using eval().
   */
  formula?: string;
  /**
   * Allows to execute a command in the shell.
   */
  command?: string;
  /**
   * Use one of the built-in executors. They are implemented programmatically
   * within the package and have arbitrary complexity.
   */
  executor?: string;
  /**
   * The variable to store the result of the formula. It is stored in the context.
   * If not provided, STEP_RESULT is used.
   */
  resultVariable?: string;
  /**
   * Context passed to the executor. Can be anything, but is always specific to
   * what the executor can consume.
   */
  context?: Context;
}

/**
 * A use case is a sequence of steps that are executed in order. It can be used
 * to automate a process.
 */
export interface UseCase extends BaseEntity {
  /**
   * A description of the use case. It will be printed in the console.
   */
  description?: string;
  /**
   * A flag for the use case to control where to show and use.
   */
  state?: UseCaseState;
  /**
   * The steps of the use case. They are executed in the order they are defined
   * in the use case.
   */
  steps: UseCaseStep[];
}
