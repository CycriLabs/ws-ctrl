import { UseCase, UseCaseState } from '../types/index.js';
import { inject, loadFilesFromDirectory } from '../utils/index.js';
import { TemplatesAccess } from './access/index.js';

export class UseCasesRepository {
  templatesAccess = inject(TemplatesAccess);

  async loadUseCases(...exclude: UseCaseState[]): Promise<UseCase[]> {
    const stateExclusion: UseCaseState[] = ['DISABLED', ...exclude];
    return this.loadFiles()
      .then(useCases => useCases.map(useCase => this.#mapUseCase(useCase)))
      .then(useCases =>
        useCases.filter(useCase => !stateExclusion.includes(useCase.state))
      );
  }

  async loadFiles(): Promise<UseCase[]> {
    return loadFilesFromDirectory<UseCase>(
      this.templatesAccess.getUseCasesDir()
    );
  }

  #mapUseCase(useCase: UseCase): Required<UseCase> {
    return {
      ...useCase,
      description: useCase.description || '',
      state: useCase.state || 'ENABLED',
    };
  }
}
