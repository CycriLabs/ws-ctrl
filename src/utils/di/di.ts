import { Injector } from './interfaces.js';

let _injectImplementation: Injector | undefined;

export function getInjectImplementation() {
  return _injectImplementation;
}

export function setInjectImplementation(
  impl: Injector | undefined
): Injector | undefined {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}
