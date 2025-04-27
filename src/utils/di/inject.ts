import { stringify } from '../stringify.js';
import { getInjectImplementation } from './di.js';
import { ProviderToken } from './interfaces.js';

export function inject<T>(token: ProviderToken<T>) {
  const currentInjector = getInjectImplementation();
  if (currentInjector === undefined) {
    throw new Error(
      `The \`${stringify(token)}\` token injection failed because the injector is not set.`
    );
  }
  return currentInjector.get(token) as T;
}
