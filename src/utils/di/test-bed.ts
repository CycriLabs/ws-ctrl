import { DefaultInjector } from './default-injector.js';
import { inject } from './index.js';
import { ProviderToken } from './interfaces.js';

export declare interface TestModuleMetadata {
  providers?: Array<[ProviderToken<unknown>, factory: () => unknown]>;
}

export class TestBed {
  static configureTestingModule(moduleDef: TestModuleMetadata): void {
    DefaultInjector.getInstance([]);

    if (moduleDef.providers?.length) {
      moduleDef.providers.forEach(provider => {
        DefaultInjector.getInstance().register(provider[0], provider[1]);
      });
    }
  }

  static resetTestingModule(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    DefaultInjector.instance = null as unknown as DefaultInjector;
  }

  static inject<T>(token: ProviderToken<T>) {
    return inject(token);
  }
}
