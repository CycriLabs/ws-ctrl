import { DefaultInjector } from './default-injector.js';
import { ProviderToken } from './interfaces.js';

export function inject<T>(token: ProviderToken<T>) {
  const injector = DefaultInjector.getInstance();
  return injector.get(token) as T;
}
