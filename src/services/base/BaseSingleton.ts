/**
 * Abstract base class implementing the Singleton pattern
 * Ensures only one instance of a service exists throughout the application
 * @template T - The type of the singleton class
 */
export abstract class BaseSingleton<T> {
  private static instances = new Map<string, unknown>()

  /**
   * Protected constructor to prevent direct instantiation
   * Derived classes should also make their constructors private/protected
   */
  protected constructor() {
    // Protected constructor to prevent direct construction calls with the `new` operator
  }

  /**
   * Gets the singleton instance of the class
   * Creates a new instance if one doesn't exist for the class
   * @template U - The type of the class extending BaseSingleton
   * @returns The singleton instance of the class
   */
  public static getInstance<U extends BaseSingleton<U>>(this: new () => U): U {
    const className = this.name
    const instance = BaseSingleton.instances.get(className) as U

    if (!instance) {
      const newInstance = new this()
      BaseSingleton.instances.set(className, newInstance)
      return newInstance
    }

    return instance
  }
}
