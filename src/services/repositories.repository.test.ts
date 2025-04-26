import { vol } from 'memfs';
import { temporaryDirectory } from 'tempy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG, initConfig } from '../config.js';
import { Logger, TestBed } from '../utils/index.js';
import { TemplatesAccess } from './access/templates-access.js';
import { RepositoriesRepository } from './repositories.repository.js';

vi.mock('node:fs');

const path = temporaryDirectory();

describe('RepositoriesRepository', () => {
  let sut: RepositoriesRepository;

  beforeEach(() => {
    const config = initConfig(path, 'acme', null).store;

    TestBed.configureTestingModule({
      providers: [
        [CONFIG, () => config],
        [Logger, () => new Logger()],
        [TemplatesAccess, () => new TemplatesAccess()],
        [RepositoriesRepository, () => new RepositoriesRepository()],
      ],
    });

    sut = TestBed.inject(RepositoriesRepository);
  });

  afterEach(() => {
    vol.reset();
    TestBed.resetTestingModule();
  });

  it('should load repositories; empty list', async () => {
    vol.fromJSON(
      {
        './config/repositories': null,
      },
      path
    );

    const repositories = await sut.loadRepositories();

    expect(repositories).toEqual([]);
  });

  it('should normalize repositories; minimal repository provided', async () => {
    vol.fromJSON(
      {
        './config/repositories/minimal.json': JSON.stringify({
          id: 'minimal',
          name: 'minimal',
        }),
      },
      path
    );

    const repositories = await sut.loadRepositories();

    expect(repositories).toEqual([
      {
        id: 'minimal',
        name: 'minimal',
        alias: 'minimal',
        url: 'git@bitbucket.org:acme/minimal.git',
        attributes: {
          type: 'UNKNOWN',
        },
      },
    ]);
  });
});
