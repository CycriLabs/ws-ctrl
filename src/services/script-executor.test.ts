import { beforeEach, describe, expect, test } from 'vitest';
import { DefaultInjector, inject } from '../utils/index.js';
import { ScriptExecutor } from './script-executor.js';

describe('ScriptExecutor', () => {
  let sut: ScriptExecutor;

  beforeEach(() => {
    DefaultInjector.getInstance([
      [ScriptExecutor, { factory: () => new ScriptExecutor() }],
    ]);
    sut = inject(ScriptExecutor);
  });

  describe('executeFormula', () => {
    test('should execute formula', () => {
      const context = { a: 1, b: 2 };
      const formula = 'a + b';

      expect(sut.executeFormula(formula, context)).toBe(3);
    });

    test('should evaluate text', () => {
      const context = {};
      const formula = '`./services.env`';

      expect(sut.executeFormula(formula, context)).toBe('./services.env');
    });

    test('should evaluate text with context', () => {
      const context = { WORKSPACE_PATH: './main' };
      const formula = '`${WORKSPACE_PATH}/services.env`';

      expect(sut.executeFormula(formula, context)).toBe('./main/services.env');
    });

    test('should throw error on invalid formula', () => {
      const context = { a: 1, b: 2 };
      const formula = 'a + b +';

      expect(() => sut.executeFormula(formula, context)).toThrow();
    });
  });
});
