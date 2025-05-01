import { access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TestBed } from './di/test-bed.js';
import { Logger, MemoryLogger } from './logger.js';
import {
  getWorkspacePathIdentifier,
  isExistingWorkspace,
  resolveWorkspacePath,
} from './workspace.js';

// Mock dependencies
vi.mock('node:fs/promises');
vi.mock('node:path');

describe('workspace', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(resolve).mockImplementation(path => `/absolute/path/${path}`);
    vi.mocked(join).mockImplementation((...paths) => paths.join('/'));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Logger,
          useFactory: () => new MemoryLogger(),
        },
      ],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('resolveWorkspacePath', () => {
    test('should resolve workspace path to absolute path', () => {
      const workspacePath = 'test/workspace';
      const resolvedPath = resolveWorkspacePath(workspacePath);

      expect(resolvedPath).toBe('/absolute/path/test/workspace');
    });
  });

  describe('getWorkspacePathIdentifier', () => {
    test('should return a shortened md5 hash of the absolute path', () => {
      const workspacePath = 'test/workspace';
      const identifier = getWorkspacePathIdentifier(workspacePath);

      expect(identifier).toBe('5b8583bb0c');
    });
  });

  describe('isExistingWorkspace', () => {
    test('should return false if workspace directory does not exist', async () => {
      vi.mocked(access).mockRejectedValueOnce(new Error('Directory not found'));

      const result = await isExistingWorkspace('test/workspace');

      const logger = TestBed.inject(Logger) as MemoryLogger;
      expect(result).toBe(false);
      expect(logger.getMessages().length).toBe(0);
    });

    test('should return true if workspace exists with config file', async () => {
      const result = await isExistingWorkspace('test/workspace');

      expect(result).toBe(true);
    });

    test('should return false if workspace directory exists but config file is missing', async () => {
      vi.mocked(access).mockImplementation(path => {
        if (path === 'test/workspace') {
          return Promise.resolve();
        }

        if (path.toString().includes('.json')) {
          return Promise.reject(new Error('Config file not found'));
        }

        // Default behavior for other paths
        return Promise.resolve();
      });

      const result = await isExistingWorkspace('test/workspace');

      const logger = TestBed.inject(Logger) as MemoryLogger;
      expect(result).toBe(false);
      expect(logger.getMessages().length).toBe(1);
      expect(logger.getMessages()[0].level).toBe('error');
      expect(logger.getMessages()[0].message).toBe(
        'Expected to find the file "5b8583bb0c.json" but was not found.'
      );
    });
  });
});
