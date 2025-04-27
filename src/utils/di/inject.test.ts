import { afterEach, describe, expect, test } from 'vitest';
import { createInjector } from './create-injector.js';
import { setInjectImplementation } from './di.js';
import { inject } from './inject.js';

class TestService {}

describe('inject()', () => {
  afterEach(() => {
    setInjectImplementation(undefined);
  });

  test('should error, injector not initialized', () => {
    expect(() => inject(TestService)).toThrowError(
      'The `TestService` token injection failed because the injector is not set.'
    );
  });

  test('should error, token not defined', () => {
    setInjectImplementation(createInjector([]));

    expect(() => inject(TestService)).toThrowError(
      'Could not find the token TestService'
    );
  });

  test('should get a token', () => {
    setInjectImplementation(createInjector([TestService]));

    const service = inject(TestService);

    expect(service).toBeInstanceOf(TestService);
  });
});
