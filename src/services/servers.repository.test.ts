import { vol } from 'memfs';
import { temporaryDirectory } from 'tempy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG, initConfig } from '../config.js';
import { Logger, TestBed } from '../utils/index.js';
import { TemplatesAccess } from './access/templates-access.js';
import { ServersRepository } from './servers.repository.js';

vi.mock('node:fs');

const path = temporaryDirectory();

describe('ServersRepository', () => {
  let sut: ServersRepository;

  beforeEach(() => {
    const config = initConfig(path, 'acme', null).store;

    TestBed.configureTestingModule({
      providers: [
        [CONFIG, () => config],
        [Logger, () => new Logger()],
        [TemplatesAccess, () => new TemplatesAccess()],
        [ServersRepository, () => new ServersRepository()],
      ],
    });

    sut = TestBed.inject(ServersRepository);
  });

  afterEach(() => {
    vol.reset();
    TestBed.resetTestingModule();
  });

  it('should load servers; empty list', async () => {
    vol.fromJSON(
      {
        './config/servers': null,
      },
      path
    );

    const servers = await sut.loadServers();

    expect(servers).toEqual([]);
  });

  it('should normalize servers; minimal server provided', async () => {
    vol.fromJSON(
      {
        './config/servers/dev.json': JSON.stringify({
          id: 'dev',
          name: 'dev.acme.com',
          host: 'https://dev.acme.com',
        }),
      },
      path
    );

    const servers = await sut.loadServers();

    expect(servers).toEqual([
      {
        id: 'dev',
        name: 'dev.acme.com',
        host: 'https://dev.acme.com',
      },
    ]);
  });
});
