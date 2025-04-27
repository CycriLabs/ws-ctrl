import { DefaultInjector } from './default-injector.js';
import { Injector } from './interfaces.js';
import { Provider } from './providers.js';

export function createInjector(
  providers: Array<Provider> | null = null
): Injector {
  return new DefaultInjector(providers || []);
}
