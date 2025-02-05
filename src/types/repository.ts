import { BaseEntity } from './base-entity.js';

/**
 * The attributes of the repository that are related to the business
 * use cases.
 */
export interface RepositoryAttributes {
  /**
   * Purpose of the code in the repository. Can be a library, a service or an
   * application.
   */
  type?: 'LIB' | 'SERVICE' | 'APP' | 'UNKNOWN';
  /**
   * The context of the service on which it listens for REST requests.
   */
  context?: string;
  /**
   * The variable name that is used to reference the target service URL in configurations.
   */
  serviceVariable?: string;
  /**
   * The port on which the service listens for REST requests.
   */
  port?: number;
}

/**
 * Reflects properties of a git repository as well as some additional attributes
 * that are related to the business logic of the repository.
 */
export interface Repository extends BaseEntity {
  /**
   * The alias of the repository. If not provided, the name will be used. Can
   * be e.g. used to always check out the repository to the same directory. The
   * "data-repo-customer-a" may be checked out as "data-repo".
   */
  alias?: string;
  /**
   * The URL of the repository. If not provided, the default workspace
   * configuration URL will be used.
   */
  url?: string;
  /**
   * The attributes of the repository that are related to the business
   * use cases.
   */
  attributes?: RepositoryAttributes;
}
