import { join } from 'node:path';
import { CONFIG } from '../../config.js';
import { copyDirectory, gitUpdate, inject, Logger } from '../../utils/index.js';
import {
  DIR_CONFIG,
  DIR_DEVELOPMENT,
  DIR_DOCKER,
  DIR_GIT_TEMPLATES,
  DIR_REPOSITORIES,
  DIR_SERVERS,
  DIR_TEMPLATES,
  DIR_USE_CASES,
} from './constants.js';
import { getPackageDir } from './get-package-dir.js';

enum Location {
  WORKSPACE,
  PACKAGE,
}

export class TemplatesAccess {
  logger = inject(Logger);
  config = inject(CONFIG);

  getPackageTemplatesDir(): string {
    return join(this.#getBaseDir(Location.PACKAGE), DIR_TEMPLATES);
  }

  getGitTemplatesDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG, DIR_GIT_TEMPLATES);
  }

  getConfigDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG);
  }

  getDockerDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG, DIR_DOCKER);
  }

  getServersDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG, DIR_SERVERS);
  }

  getUseCasesDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG, DIR_USE_CASES);
  }

  getRepositoriesDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG, DIR_REPOSITORIES);
  }

  getDevelopmentDir(): string {
    return join(this.#getBaseDir(), DIR_CONFIG, DIR_DEVELOPMENT);
  }

  getWorkingDir(): string {
    return join(this.#getBaseDir(), DIR_DEVELOPMENT);
  }

  #getBaseDir(location = Location.WORKSPACE): string {
    return location === Location.WORKSPACE
      ? this.getWorkspacePath()
      : getPackageDir();
  }

  getWorkspacePath(): string {
    return this.config.workspacePath;
  }

  getTemplatesRepository(): string | null {
    return this.config.templatesRepository;
  }

  createRepositoryUrl(name: string): string {
    // TODO:
    // - add support for HTTPS URLs when provided in config
    // - add support for different repository hosts
    // - add support for different tenants
    return `git@bitbucket.org:${this.config.organization}/${name}.git`;
  }

  async initWorkspace(): Promise<void> {
    await this.syncTemplates();
    // create the target dir
    await this.copyDevelopmentDirectory();
  }

  async syncTemplates(): Promise<void> {
    // always sync the templates from the package
    const templatesDirPackage = this.getPackageTemplatesDir();
    this.logger.log(`Syncing templates from ${templatesDirPackage}...`);
    await copyDirectory(templatesDirPackage, this.getWorkspacePath());
    // sync the templates from the repository
    await this.syncRepositoryTemplates();
  }

  async syncRepositoryTemplates(): Promise<void> {
    // sync the templates from the repository if configured
    const templatesRepository = this.getTemplatesRepository();
    if (templatesRepository) {
      const url = this.createRepositoryUrl(templatesRepository);
      this.logger.log(`Syncing templates from repository ${url}...`);

      await gitUpdate(url, this.getWorkspacePath(), this.getGitTemplatesDir());
      await copyDirectory(this.getGitTemplatesDir(), this.getConfigDir(), [
        '.git',
      ]);
    }
  }

  async copyDevelopmentDirectory(): Promise<void> {
    await copyDirectory(this.getDevelopmentDir(), this.getWorkingDir());
  }
}
