import { vol } from 'memfs';
import { temporaryDirectory } from 'tempy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG, initConfig } from '../config.js';
import { DefaultInjector, inject, Logger } from '../utils/index.js';
import { TemplatesAccess } from './access/templates-access.js';
import { UseCasesRepository } from './use-cases.repository.js';

vi.mock('node:fs');

const path = temporaryDirectory();

describe('UseCasesRepository', () => {
  let sut: UseCasesRepository;

  beforeEach(() => {
    const config = initConfig(path, 'acme', null).store;

    DefaultInjector.getInstance([
      [CONFIG, { factory: () => config }],
      [Logger, { factory: () => new Logger() }],
      [TemplatesAccess, { factory: () => new TemplatesAccess() }],
      [UseCasesRepository, { factory: () => new UseCasesRepository() }],
    ]);

    sut = inject(UseCasesRepository);
  });

  it('should load use cases; empty list', async () => {
    vol.fromJSON(
      {
        './config/use-cases': null,
      },
      path
    );

    const useCases = await sut.loadUseCases();

    expect(useCases).toEqual([]);
  });

  it('should normalize use cases; minimal use case provided', async () => {
    vol.fromJSON(
      {
        './config/use-cases/pull.json': JSON.stringify({
          id: 'pull',
          name: 'pull images',
          steps: [],
        }),
      },
      path
    );

    const useCases = await sut.loadUseCases();

    expect(useCases).toEqual([
      {
        id: 'pull',
        name: 'pull images',
        description: '',
        state: 'ENABLED',
        steps: [],
      },
    ]);
  });
});
