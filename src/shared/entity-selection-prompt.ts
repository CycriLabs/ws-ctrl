import prompts from 'prompts';
import { BaseEntity } from '../types/index.js';
import { bold } from '../utils/index.js';
import { onPromptState } from './on-prompt-state.js';
import { hasUserInput } from './option-helpers.js';
import { OptionInput } from './options.js';

interface PromptOptions<T> {
  createTitle?(entity: T): string;
  displayFilter?: (entity: T) => boolean;
}

async function triggerPrompt<T extends BaseEntity>(
  type: 'select' | 'multiselect',
  entityName: string,
  entities: T[],
  options: PromptOptions<T> = {}
): Promise<string> {
  return prompts({
    onState: onPromptState,
    type,
    name: 'entity',
    message: `Select the ${entityName}`,
    choices: entities
      .filter(options.displayFilter || (() => true))
      .map(entity => ({
        title: options.createTitle ? options.createTitle(entity) : entity.name,
        value: entity.id,
      })),
  }).then(({ entity }) => entity);
}

function getEntitiesById<T extends BaseEntity>(
  selection: string | string[],
  entities: T[]
): T[] {
  const entityMap: { [id: string]: T } = entities.reduce(
    (acc, val) => ({ ...acc, [val.id]: val }),
    {}
  );

  if (typeof selection === 'string') {
    const entity = entityMap[selection.trim()];
    if (entity) {
      return [entity];
    }
  } else if (Array.isArray(selection)) {
    return selection.map(selected => entityMap[selected.trim()]);
  } else {
    throw new Error(`Can find entity for value ${selection}.`);
  }

  throw new Error(`Entity for selection ${bold(selection)} not found.`);
}

async function promptSelection<T extends BaseEntity>(
  type: 'select' | 'multiselect',
  entityName: string,
  entity: OptionInput,
  entities: T[],
  options: PromptOptions<T> = {}
): Promise<T[]> {
  const selection =
    hasUserInput(entity) && typeof entity === 'string'
      ? entity
      : await triggerPrompt(type, entityName, entities, options);
  return getEntitiesById(selection, entities);
}

export async function promptEntityMultiSelection<T extends BaseEntity>(
  entityName: string,
  entity: OptionInput,
  entities: T[],
  options: PromptOptions<T> = {}
): Promise<T[]> {
  return promptSelection('multiselect', entityName, entity, entities, options);
}

export async function promptEntitySelection<T extends BaseEntity>(
  entityName: string,
  entity: OptionInput,
  entities: T[],
  options: PromptOptions<T> = {}
): Promise<T> {
  const [selection] = await promptSelection(
    'select',
    entityName,
    entity,
    entities,
    options
  );
  return selection;
}
