export abstract class BaseSingleton<T> {
  private static instances = new Map<string, unknown>()

  protected constructor() {
    // Protected constructor to prevent direct construction calls with the `new` operator
  }

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
