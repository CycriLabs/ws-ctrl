import { BaseEntity } from './base-entity.js';

/**
 * The attributes of the server that are related to the business use cases.
 */
export interface ServerAttributes {
  /**
   * The password of the keycloak admin user that is used to load secrets from
   * the keycloak server. If not provided, the user will be prompted for the
   * password.
   */
  authPassword?: string;
}

/**
 * Reflects properties of a server as well as some additional attributes
 * that are useful to interact with the server.
 */
export interface Server extends BaseEntity {
  /**
   * The host of the server. This is the URL that is used to connect to the
   * server.
   */
  host: string;
  /**
   * The attributes of the server that are related to the business use cases.
   */
  attributes?: ServerAttributes;
}
