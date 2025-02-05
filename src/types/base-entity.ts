/**
 * The base entity interface that all entities should implement. Each prompt
 * expects an entity that implements this interface.
 */
export interface BaseEntity {
  /**
   * The unique identifier of the entity. This is used to identify the entity
   * in selections from prompts.
   */
  id: string;
  /**
   * The name of the entity. Is mainly used as the display name throughout
   * all prompts.
   */
  name: string;
}
