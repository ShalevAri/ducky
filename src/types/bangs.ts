/**
 * Interface for a Bang search command
 */
export interface Bang {
  /**
   * The unique name/identifier for the bang
   */
  t: string

  /**
   * Short description/title of the bang
   */
  s: string

  /**
   * The domain to use for the bang
   */
  d: string

  /**
   * The URL pattern for search with placeholder {{{s}}} for query
   */
  u: string
}
