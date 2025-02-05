import { vol } from 'memfs';
import { temporaryDirectory } from 'tempy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initConfig } from '../../config.js';
import { UseCase } from '../../types/use-case.js';
import { TemplatesAccess } from '../access/templates-access.js';
import { ScriptExecutor } from '../script-executor.js';
import { UseCaseRunner } from './use-case-runner.js';

vi.mock('node:fs');

const path = temporaryDirectory();

describe('UseCaseRunner', () => {
  let scriptExecutor: ScriptExecutor;
  let sut: UseCaseRunner;

  beforeEach(() => {
    const config = initConfig(path, 'acme', null);

    scriptExecutor = ScriptExecutor.create();
    sut = UseCaseRunner.create(
      config,
      TemplatesAccess.create(config),
      scriptExecutor
    );
  });

  afterEach(() => {
    vol.reset();
  });

  describe('run', () => {
    it('should error; use case not found', async () => {
      vol.fromJSON(
        {
          './config/servers': null,
          './config/repositories': null,
          './config/use-cases': null,
        },
        path
      );

      await expect(() => sut.run('some-id')).rejects.toThrowError(
        'Use case not found: some-id'
      );
    });

    it('should execute use case; by object', async () => {
      const useCase: UseCase = {
        id: 'pull',
        name: 'pull images',
        steps: [],
      };
      vol.fromJSON(
        {
          './config/servers': null,
          './config/repositories': null,
          './config/use-cases': null,
        },
        path
      );

      await sut.run(useCase);
    });

    it('should execute use case; by id', async () => {
      const useCase: UseCase = {
        id: 'pull',
        name: 'pull images',
        steps: [],
      };
      vol.fromJSON(
        {
          './config/servers': null,
          './config/repositories': null,
          './config/use-cases/pull.json': JSON.stringify(useCase),
        },
        path
      );

      await sut.run(useCase.id);
    });
  });

  describe('execute steps', () => {
    let useCase: UseCase;

    beforeEach(() => {
      vol.fromJSON(
        {
          './services.env': 'ENV=dev',
          './config/servers': null,
          './config/repositories': null,
          './config/use-cases': null,
        },
        path
      );

      useCase = {
        id: 'pull',
        name: 'pull images',
        steps: [
          {
            type: 'FORMULA',
            formula: 'a === b',
          },
        ],
      };
    });

    it('should load input file to context; is provided', async () => {
      useCase.steps = [
        {
          type: 'FORMULA',
          formula: 'true',
          inputFile: '`${WORKSPACE_PATH}/services.env`',
        },
      ];

      const context = await sut.run(useCase);

      expect(context.INPUT).toEqual('ENV=dev');
    });

    it('should not load input file to context; is not provided', async () => {
      useCase.steps = [
        {
          type: 'FORMULA',
          formula: 'true',
        },
      ];

      const context = await sut.run(useCase);

      expect(context.INPUT).toBeUndefined();
    });

    it('should abort execution; abortIf condition is met', async () => {
      useCase.steps = [{ type: 'FORMULA', abortIf: 'true' }];

      await expect(() => sut.run(useCase)).rejects.toThrowError(
        `Stopping because 'abortIf' formula is met.`
      );
    });

    it('should skip step; skipIf condition is met', async () => {
      const spy = vi.spyOn(scriptExecutor, 'executeFormula');

      useCase.steps = [{ type: 'FORMULA', skipIf: 'true' }];

      await sut.run(useCase);

      expect(spy).toHaveBeenCalledWith('true', expect.any(Object));
      expect(spy).not.toHaveBeenCalledWith('a === b', expect.any(Object));
    });

    describe('type FORMULA', () => {
      it('should error; formula missing', async () => {
        useCase.steps = [
          {
            type: 'FORMULA',
          },
        ];

        await expect(() => sut.run(useCase)).rejects.toThrowError(
          'Formula missing in step.'
        );
      });
    });
  });
});
