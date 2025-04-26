import { afterEach, describe, expect, test } from 'vitest';
import { DefaultInjector } from './default-injector.js';
import { inject } from './inject.js';

class TestService {}

describe('inject()', () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    DefaultInjector.instance = null as unknown as DefaultInjector;
  });

  test('should error, injector not initialized', () => {
    expect(() => inject(TestService)).toThrowError(
      'Injector not initialized. Please provide providers.'
    );
  });

  test('should error, token not defined', () => {
    DefaultInjector.getInstance([]);

    expect(() => inject(TestService)).toThrowError(
      'Could not find the token TestService'
    );
  });

  test('should get a token', () => {
    DefaultInjector.getInstance([
      [TestService, { factory: () => new TestService() }],
    ]);

    const service = inject(TestService);

    expect(service).toBeInstanceOf(TestService);
  });
});
