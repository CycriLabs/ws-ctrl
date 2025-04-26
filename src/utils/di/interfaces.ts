/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export interface AbstractType<T> extends Function {
  prototype: T;
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

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
  abstract register<T>(token: ProviderToken<T>, factory: () => T): void;

  abstract get<T>(token: ProviderToken<T>): T;
}
