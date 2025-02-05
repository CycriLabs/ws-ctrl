import prompts from 'prompts';
import { onPromptState } from './on-prompt-state.js';
import { hasUserInput } from './option-helpers.js';
import { OptionInput } from './options.js';

async function triggerPrompt<T>(
  type: 'text' | 'password' | 'toggle' | 'number' | 'confirm',
  message: string
): Promise<T> {
  return prompts({
    onState: onPromptState,
    type,
    name: 'input',
    message,
    initial: type === 'toggle' ? true : undefined,
    active: 'yes',
    inactive: 'no',
  }).then(({ input }) => input);
}

export async function promptInput<T>(
  type: 'text' | 'password' | 'toggle' | 'number' | 'confirm',
  message: string,
  userInput?: OptionInput
): Promise<T> {
  return hasUserInput(userInput) ? <T>userInput : triggerPrompt(type, message);
}

export async function promptTextInput(
  message: string,
  userInput?: OptionInput
): Promise<string> {
  const result = hasUserInput(userInput)
    ? userInput
    : await triggerPrompt<string>('text', message);
  if (hasUserInput(result) && typeof result === 'string') {
    return result.trim();
  }

  throw Error('No input path provided.');
}
