import { DefaultInjector } from './default-injector.js';
import { setInjectImplementation } from './di.js';
import { inject } from './index.js';
import { ProviderToken } from './interfaces.js';

export declare interface TestModuleMetadata {
  providers?: Array<[ProviderToken<unknown>, factory: () => unknown]>;
}

export class TestBed {
  static configureTestingModule(moduleDef: TestModuleMetadata): void {
    setInjectImplementation(DefaultInjector.getInstance([]));

    if (moduleDef.providers?.length) {
      moduleDef.providers.forEach(provider => {
        DefaultInjector.getInstance().register(provider[0], provider[1]);
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
