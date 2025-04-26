import Conf from 'conf';
import {
  getWorkspacePathIdentifier,
  isExistingWorkspace,
  logger,
  resolveWorkspacePath,
} from './utils/index.js';

export interface Config {
  workspacePath: string;
  organization: string;
  templatesRepository: string | null;
}

export type WorkspaceConfig = Conf<Config>;

const schema = {
  workspacePath: {
    type: 'string',
  },
  organization: {
    type: 'string',
  },
  templatesRepository: {
    type: ['string', 'null'],
  },
};

export let config: WorkspaceConfig;

function loadConfig(workspacePath: string): WorkspaceConfig {
  config = new Conf<Config>({
    schema,
    cwd: resolveWorkspacePath(workspacePath),
    configName: getWorkspacePathIdentifier(workspacePath),
  });
  return config;
}

function loadBlankConfig(workspacePath: string): Config {
  return {
    workspacePath: resolveWorkspacePath(workspacePath),
    organization: 'none',
    templatesRepository: null,
  };
}

export function initConfig(
  workspacePath: string,
  organization: string,
  templatesRepository: string | null
): WorkspaceConfig {
  config = loadConfig(workspacePath);
  config.set('workspacePath', resolveWorkspacePath(workspacePath));
  config.set('organization', organization);
  config.set('templatesRepository', templatesRepository);
  return config;
}

export async function loadWorkspaceConfig(
  workspacePathRaw: string,
  debug: boolean = false
): Promise<Config> {
  const workspacePath = workspacePathRaw.trim();
  if (debug) {
    logger.log('Running within non-workspace directory...');
    return loadBlankConfig(workspacePath);
  }

  const existingWorkspace = await isExistingWorkspace(workspacePath);
  if (!existingWorkspace) {
    throw new Error(`The given path is no valid workspace.`);
  }
  return loadConfig(workspacePath).store;
}
