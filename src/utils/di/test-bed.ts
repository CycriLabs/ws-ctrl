import { createInjector } from './create-injector.js';
import { setInjectImplementation } from './di.js';
import { inject } from './index.js';
import { ProviderToken } from './interfaces.js';
import { Provider } from './providers.js';

export declare interface TestModuleMetadata {
  providers?: Array<Provider>;
}

export class TestBed {
  static configureTestingModule(moduleDef: TestModuleMetadata): void {
    const injector = createInjector([]);
    setInjectImplementation(injector);

    if (moduleDef.providers?.length) {
      moduleDef.providers.forEach(provider => {
        injector.register(provider);
      });
    }
  }

  static resetTestingModule(): void {
    setInjectImplementation(undefined);
  }

  static inject<T>(token: ProviderToken<T>) {
    return inject(token);
  }
}
