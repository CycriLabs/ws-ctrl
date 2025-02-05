import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  return fs.writeFile(filePath, content, 'utf8');
}

/**
 * Copies a directory from the source to the destination. The source directory
 * is copied recursively to the destination directory.
 *
 * @param source the source directory to copy from
 * @param destination the destination directory to copy to
 */
export async function copyDirectory(
  source: string,
  destination: string,
  exclude: string[] = []
): Promise<void> {
  // Create destination directory if it doesn't exist
  try {
    await fs.mkdir(destination, { recursive: true });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Read all files/folders in the source directory
  const files = await fs.readdir(source);
  await Promise.all(
    files
      .filter(file => !exclude.includes(file))
      .map(async file => {
        const sourcePath = join(source, file);
        const destPath = join(destination, file);

        // Get file's stats
        const stats = await fs.stat(sourcePath);

        if (stats.isDirectory()) {
          // Recursively copy subdirectories
          await copyDirectory(sourcePath, destPath);
        } else {
          // Copy file
          await fs.copyFile(sourcePath, destPath);
        }
      })
  );
}

/**
 * Loads and parses all JSON files from a directory into an array of specified type.
 *
 * @param directoryPath Path to the directory containing JSON files
 * @returns Promise resolving to an array of parsed objects of type T
 * @throws Error if directory reading or JSON parsing fails
 */
export async function loadFilesFromDirectory<T>(
  directoryPath: string
): Promise<T[]> {
  try {
    // Get all files from directory
    const files = await fs.readdir(directoryPath);

    // Filter for JSON files and create array of promises
    const jsonFiles = files.filter(
      file => extname(file).toLowerCase() === '.json'
    );
    const filePromises = jsonFiles.map(async file => {
      const filePath = join(directoryPath, file);
      const content = await readFile(filePath);

      try {
        // Parse JSON and validate type
        const parsed = JSON.parse(content) as T;
        return parsed;
      } catch (parseError) {
        throw new Error(
          `Failed to parse JSON in file ${file}: ${(<Error>parseError).message}`
        );
      }
    });

    // Wait for all files to be processed
    const results = await Promise.all(filePromises);
    return results;
  } catch (error) {
    throw new Error(`Error loading JSON files: ${(<Error>error).message}`);
  }
}
