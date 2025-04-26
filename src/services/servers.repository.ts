import { Server } from '../types/index.js';
import { inject, loadFilesFromDirectory } from '../utils/index.js';
import { TemplatesAccess } from './access/index.js';

export class ServersRepository {
  templatesAccess = inject(TemplatesAccess);

  async loadServers(): Promise<Server[]> {
    return this.loadFiles();
  }

  async loadFiles(): Promise<Server[]> {
    return loadFilesFromDirectory<Server>(this.templatesAccess.getServersDir());
  }
}
