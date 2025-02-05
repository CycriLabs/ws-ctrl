import Conf from 'conf';
import {
  getWorkspacePathIdentifier,
  isExistingWorkspace,
  resolveWorkspacePath,
} from './utils/index.js';

interface Config {
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

export function loadConfig(workspacePath: string): WorkspaceConfig {
  config = new Conf<Config>({
    schema,
    cwd: resolveWorkspacePath(workspacePath),
    configName: getWorkspacePathIdentifier(workspacePath),
  });
  return config;
}

export async function loadWorkspaceConfig(workspacePathRaw: string) {
  const workspacePath = workspacePathRaw.trim();
  const existingWorkspace = await isExistingWorkspace(workspacePath);
  if (!existingWorkspace) {
    throw new Error(`The given path is no valid workspace.`);
  }
  return loadConfig(workspacePath);
}
