export class LazyConstructor<T> {
  private obj: T;

  public get: () => T = this.getFirstTime;

  public constructor(private construct: () => T) {}

  private getFirstTime(): T {
    this.obj = this.construct();
    this.get = this.getObj;
    return this.get();
  }

  private getObj(): T {
    return this.obj;
  }
}
