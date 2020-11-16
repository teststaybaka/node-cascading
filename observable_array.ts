export class ObservableArray<T> {
  private actualArray: T[] = [];

  public get(index: number): T {
    return this.actualArray[index];
  }

  public set(index: number, value: T): void {
    this.actualArray[index] = value;
  }

  public length(): number {
    return this.actualArray.length;
  }

  public push(value: T): void {
    this.actualArray.push(value);
  }
}
