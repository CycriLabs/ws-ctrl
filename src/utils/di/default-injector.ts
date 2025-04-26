import { stringify } from '../stringify.js';
import { Injector, ProviderToken } from './interfaces.js';

export type Record = {
  factory: () => unknown;
  value?: unknown;
};

export class DefaultInjector extends Injector {
  private static instance: DefaultInjector | null = null;

  static getInstance(
    providers?: Array<[ProviderToken<unknown>, Record]>
  ): Injector {
    if (!this.instance && !providers) {
      throw new Error('Injector not initialized. Please provide providers.');
    }

    if (!this.instance) {
      this.instance = new DefaultInjector(providers || []);
    }
    return this.instance;
  }

  private records: Map<ProviderToken<unknown>, Record | null>;

  private constructor(providers: Array<[ProviderToken<unknown>, Record]>) {
    super();

    this.records = new Map(providers);
    this.records.set(Injector, { factory: () => this, value: this });
  }

  register<T>(token: ProviderToken<T>, factory: () => unknown): void {
    if (this.records.has(token)) {
      throw new Error(`Token ${stringify(token)} already registered.`);
    }

    this.records.set(token, { factory });
  }

  get<T>(token: ProviderToken<T>): T {
    if (!this.records.has(token)) {
      throw new Error(`Could not find the token ${stringify(token)}`);
    }

    const record = this.records.get(token)!;
    if (!record.value) {
      record.value = record.factory();
    }

    return record.value as T;
  }
}
