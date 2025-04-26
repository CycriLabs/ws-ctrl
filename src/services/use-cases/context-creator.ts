import { Context } from '../../types/index.js';
import { inject, OS } from '../../utils/index.js';
import { TemplatesAccess } from '../access/index.js';
import { RepositoriesRepository } from '../repositories.repository.js';
import { ServersRepository } from '../servers.repository.js';

export class ContextCreator {
  templatesAccess = inject(TemplatesAccess);
  serversRepository = inject(ServersRepository);
  repositoriesRepository = inject(RepositoriesRepository);

  async createContext(userContext: Context = {}): Promise<Context> {
    return {
      ...userContext,
      WORKSPACE_PATH: this.templatesAccess.getWorkspacePath(),
      WORKING_DIR: this.templatesAccess.getWorkingDir(),
      SERVERS: await this.serversRepository.loadServers(),
      REPOSITORIES: await this.repositoriesRepository.loadRepositories(),
      OS,
    };
  }
}
