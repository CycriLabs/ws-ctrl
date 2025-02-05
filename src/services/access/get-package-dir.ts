import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Returns the directory where the package is installed to be used as a base
 * path for other file operations, e.g. copying distributed files of the package
 * to local workspaces.
 *
 * @returns {string} The directory where the package is installed
 */
export function getPackageDir() {
  const __filename = fileURLToPath(import.meta.url);
  const packageDir = dirname(__filename);
  return packageDir;
}
