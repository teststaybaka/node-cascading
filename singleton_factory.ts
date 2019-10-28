export class SingletonFactory<T> {
  private singleton: T;

  public get: (() => T) = this.getFirstTime;

  public constructor(private constructSingleton: (() => T)) {  }

  private getFirstTime(): T {
    this.singleton = this.constructSingleton();
    this.get = this.getSingleton;
    return this.get();
  }

  private getSingleton(): T {
    return this.singleton;
  }
}
