import { WorkspaceConfig } from '../config.js';
import { Repository } from '../types/index.js';
import { loadFilesFromDirectory } from '../utils/index.js';
import { TemplatesAccess } from './access/index.js';

export class RepositoriesRepository {
  static create(config: WorkspaceConfig, templatesAccess: TemplatesAccess) {
    return new RepositoriesRepository(config, templatesAccess);
  }

  constructor(
    private readonly config: WorkspaceConfig,
    private readonly templatesAccess: TemplatesAccess
  ) {}

  async loadRepositories(): Promise<Required<Repository>[]> {
    return this.loadFiles().then(repositories =>
      repositories.map(repository => this.#mapRepository(repository))
    );
  }

  async loadFiles(): Promise<Repository[]> {
    return loadFilesFromDirectory<Repository>(
      this.templatesAccess.getRepositoriesDir()
    );
  }

  #mapRepository(repository: Repository): Required<Repository> {
    return {
      ...repository,
      alias: repository.alias || repository.name,
      url:
        repository.url ||
        this.templatesAccess.createRepositoryUrl(
          this.config.get('organization'),
          repository.name
        ),
      attributes: {
        type: 'UNKNOWN',
        ...repository.attributes,
      },
    };
  }
}
