import { Context } from '../../types/index.js';
import { TemplatesAccess } from '../access/index.js';
import { RepositoriesRepository } from '../repositories.repository.js';
import { ServersRepository } from '../servers.repository.js';

export class ContextCreator {
  static create(templatesAccess: TemplatesAccess) {
    return new ContextCreator(
      templatesAccess,
      ServersRepository.create(templatesAccess),
      RepositoriesRepository.create(templatesAccess)
    );
  }

  constructor(
    private readonly templatesAccess: TemplatesAccess,
    private readonly serversRepository: ServersRepository,
    private readonly repositoriesRepository: RepositoriesRepository
  ) {}

  async createContext(userContext: Context = {}): Promise<Context> {
    return {
      ...userContext,
      WORKSPACE_PATH: this.templatesAccess.getWorkspacePath(),
      WORKING_DIR: this.templatesAccess.getWorkingDir(),
      SERVERS: await this.serversRepository.loadServers(),
      REPOSITORIES: await this.repositoriesRepository.loadRepositories(),
    };
  }
}
