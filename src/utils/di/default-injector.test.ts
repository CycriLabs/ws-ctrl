import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { DefaultInjector } from './default-injector.js';
import { setInjectImplementation } from './di.js';
import { inject } from './inject.js';
import { Injector } from './interfaces.js';

class TestService {}

class NestedService {
  testService = inject(TestService);
}

describe('DefaultInjector', () => {
  let sut: Injector;

  beforeEach(() => {
    sut = new DefaultInjector([]);
    setInjectImplementation(sut);
  });

  afterEach(() => {
    setInjectImplementation(undefined);
  });

  test('should error, token not defined', () => {
    expect(() => sut.get(TestService)).toThrowError(
      'Could not find the token TestService'
    );
  });

  test('should register and get a token', () => {
    sut.register(TestService);

    const service = sut.get(TestService);

    expect(service).toBeInstanceOf(TestService);
  });

  test('should error, token already registered', () => {
    sut.register(TestService);

    expect(() => sut.register(TestService)).toThrowError(
      'Token TestService already registered.'
    );
  });

  test('should get a token with dependencies', () => {
    sut.register(TestService);
    sut.register(NestedService);

    const service = sut.get(NestedService);

    expect(service).toBeInstanceOf(NestedService);
    expect(service.testService).toBeInstanceOf(TestService);
  });
});
