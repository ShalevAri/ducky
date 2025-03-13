/**
 * Interface for a Ducky Island
 */
export interface DuckyIsland {
  /**
   * The key suffix to use for the bang command
   */
  key: string

  /**
   * The descriptive name of the island
   */
  name: string

  /**
   * The prompt text to inject before the query
   */
  prompt: string
}
