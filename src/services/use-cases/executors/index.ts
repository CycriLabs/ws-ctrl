import { Executor } from '../executor.js';
import { ChangeEnvVarValue } from './change-env-var-value.js';
import { CustomPrompt } from './custom-prompt.js';
import { GenerateServiceConfiguration } from './generate-service-configuration.js';

export const executorMapping: { [key: string]: typeof Executor } = {
  'custom-prompt': CustomPrompt,
  'generate-service-configuration': GenerateServiceConfiguration,
  'change-env-var-value': ChangeEnvVarValue,
};
