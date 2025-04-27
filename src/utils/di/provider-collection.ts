import { FactoryProvider, Provider, TypeProvider } from './providers.js';

export function isTypeProvider(value: Provider): value is TypeProvider {
  return typeof value === 'function';
}

export function isFactoryProvider(value: Provider): value is FactoryProvider {
  return !!(value && (value as FactoryProvider).useFactory);
}
