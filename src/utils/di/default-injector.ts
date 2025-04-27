/* eslint-disable @typescript-eslint/no-empty-object-type */
import { stringify } from '../stringify.js';
import { Injector, ProviderToken } from './interfaces.js';
import { isFactoryProvider, isTypeProvider } from './provider-collection.js';
import { Provider } from './providers.js';

interface Record<T> {
  factory: (() => T) | undefined;
  value: T | {};
}

export class DefaultInjector extends Injector {
  private records = new Map<ProviderToken<unknown>, Record<unknown> | null>();

  constructor(providers: Array<Provider>) {
    super();

    forEachSingleProvider(providers as Array<Provider>, provider =>
      this.processProvider(provider)
    );

    this.records.set(Injector, makeRecord(undefined, this));
  }

  private processProvider(provider: Provider): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token: any = isTypeProvider(provider)
      ? provider
      : provider && provider.provide;
    const record = providerToRecord(provider);

    const existing = this.records.get(token);
    if (existing) {
      throw new Error(`Token ${stringify(token)} already registered.`);
    }

    this.records.set(token, record);
  }

  register(provider: Provider): void {
    this.processProvider(provider);
  }

  get<T>(token: ProviderToken<T>): T {
    if (!this.records.has(token)) {
      throw new Error(`Could not find the token ${stringify(token)}`);
    }

    const record = this.records.get(token)!;
    if (!record.value) {
      record.value = record.factory!();
    }

    return record.value as T;
  }
}

export function providerToFactory(provider: Provider): () => unknown {
  if (isTypeProvider(provider)) {
    return () => new provider();
  } else if (isFactoryProvider(provider)) {
    return () => provider.useFactory();
  }
  throw new Error(`Invalid provider: ${stringify(provider)}`);
}

function providerToRecord(provider: Provider): Record<unknown> {
  const factory: (() => unknown) | undefined = providerToFactory(provider);
  return makeRecord(factory, undefined);
}

function makeRecord<T>(
  factory: (() => T) | undefined,
  value: T | {}
): Record<T> {
  return {
    factory: factory,
    value: value,
  };
}

function forEachSingleProvider(
  providers: Array<Provider>,
  fn: (provider: Provider) => void
): void {
  for (const provider of providers) {
    fn(provider as Provider);
  }
}
