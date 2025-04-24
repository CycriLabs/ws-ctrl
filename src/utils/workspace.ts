import { createHash } from 'node:crypto';
import { access, constants } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { logger } from './logger.js';

/**
 * Converts the file path to the workspace directory provided by the user to
 * an absolute filepath.
 *
 * @param workspacePath workspace path provided by the user
 * @returns absolute file path to the given workspace path
 */
export function resolveWorkspacePath(workspacePath: string) {
  return resolve(workspacePath);
}

/**
 * Converts the absolute file path to the workspace directory to an
 * md5 hash for unique workspace identification.
 *
 * @param workspacePath workspace path provided by the user
 * @returns a shortened md5 hash
 */
export function getWorkspacePathIdentifier(workspacePath: string) {
  const absolutePath = resolveWorkspacePath(workspacePath);
  const pathHash = createHash('md5').update(absolutePath).digest('hex');
  return pathHash.substring(0, 10);
}

/**
 * Check if the given path is an existing workspace directory.
 * This tests if the directory exists and if it contains a config
 * file.
 *
 * @param workspacePath the path to the workspace directory
 */
export async function isExistingWorkspace(workspacePath: string) {
  try {
    await access(workspacePath);
  } catch {
    logger.error('The provided workspacePath "' + workspacePath + '" does not exist.');
    return false;
  }
  
  const identifier = getWorkspacePathIdentifier(workspacePath);
  try {
    await access(join(workspacePath, `${identifier}.json`), constants.F_OK);
    return true;
  } catch {
    logger.error('Expected to find the file "' + identifier + '.json" but was not found.');
    return false;
  }
}
