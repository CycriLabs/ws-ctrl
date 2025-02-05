import { Server } from '../types/index.js';
import { loadFilesFromDirectory } from '../utils/index.js';
import { TemplatesAccess } from './access/index.js';

export class ServersRepository {
  static create(templatesAccess: TemplatesAccess) {
    return new ServersRepository(templatesAccess);
  }

  constructor(private readonly templatesAccess: TemplatesAccess) {}

  async loadServers(): Promise<Server[]> {
    return this.loadFiles();
  }

  async loadFiles(): Promise<Server[]> {
    return loadFilesFromDirectory<Server>(this.templatesAccess.getServersDir());
  }
}
