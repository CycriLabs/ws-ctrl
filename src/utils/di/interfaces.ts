import { AbstractType, Provider, Type } from './providers.js';

export class InjectionToken<T> {
  constructor(
    protected _desc: string,
    options?: {
      factory: () => T;
    }
  ) {
    if (options !== undefined) {
      //   const injector = inject(Injector);
      //   injector.register(this, options.factory);
    }
  }

  toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}

export type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>;

export abstract class Injector {
  abstract register(provider: Provider): void;

  abstract get<T>(token: ProviderToken<T>): T;
}
