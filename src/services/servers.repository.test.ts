import { vol } from 'memfs';
import { temporaryDirectory } from 'tempy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initConfig } from '../config.js';
import { TemplatesAccess } from './access/templates-access.js';
import { ServersRepository } from './servers.repository.js';

vi.mock('node:fs');

const path = temporaryDirectory();

describe('ServersRepository', () => {
  let sut: ServersRepository;

  beforeEach(() => {
    const config = initConfig(path, 'acme', null).store;

    sut = ServersRepository.create(TemplatesAccess.create(config));
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
