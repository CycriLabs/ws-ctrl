/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export interface AbstractType<T> extends Function {
  prototype: T;
}

export interface Type<T> extends Function {
  new (...args: unknown[]): T;
}

export interface FactoryProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: unknown;

  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;
}

/**
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TypeProvider extends Type<unknown> {}

export type Provider = TypeProvider | FactoryProvider;
