import prompts from 'prompts';
import { onPromptState, promptInput } from '../../../shared/index.js';
import { BaseEntity, Context, UseCaseStep } from '../../../types/index.js';
import { bold } from '../../../utils/index.js';
import { Executor } from '../executor.js';

export interface CustomPromptContext extends Context {
  name: string;
  message: string;
  type: 'text' | 'number' | 'confirm' | 'select' | 'multiselect';
  entities?: BaseEntity[];
  entityKey?: string;
}

// TODO: use entity-selection-prompt.ts
async function triggerPrompt(
  type: 'select' | 'multiselect',
  message: string,
  entities: BaseEntity[]
): Promise<string> {
  return prompts({
    onState: onPromptState,
    type,
    name: 'input',
    message,
    choices: entities.map(({ id, name }) => ({
      title: name,
      value: id,
    })),
  }).then(({ input }) => input);
}

function getEntitiesById(
  selection: string | string[],
  entities: BaseEntity[]
): BaseEntity | BaseEntity[] {
  const entityMap: { [id: string]: BaseEntity } = entities.reduce(
    (acc, val) => ({ ...acc, [val.id]: val }),
    {}
  );

  if (typeof selection === 'string') {
    const entity = entityMap[selection.trim()];
    if (entity) {
      return entity;
    }
  } else if (Array.isArray(selection)) {
    return selection.map(selected => entityMap[selected.trim()]);
  } else {
    throw new Error(`Can find entity for value ${selection}.`);
  }

  throw new Error(`Entity for selection ${bold(selection)} not found.`);
}

export class CustomPrompt extends Executor {
  async execute(step: UseCaseStep, context: Context): Promise<Context> {
    const { name, message, type, entities, entityKey } =
      step.context as CustomPromptContext;
    if (!name || !message || !type) {
      throw new Error('Prompt name, message or type missing.');
    }

    let selection;

    switch (type) {
      case 'select':
      case 'multiselect': {
        const choices =
          (entityKey ? (context[entityKey] as BaseEntity[]) : entities) || [];
        const userSelection = await triggerPrompt(type, message, choices);
        selection = getEntitiesById(userSelection, choices);
        break;
      }
      default: {
        selection = await promptInput(type, message);
        break;
      }
    }

    return { ...context, [name]: selection };
  }
}
