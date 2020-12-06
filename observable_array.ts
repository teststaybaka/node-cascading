import { Observable } from "./observable";

export class ObservableArray<T> implements Iterable<T>, Observable {
  public onElementChange: (index: number, newValue: T, oldValue: T) => void;
  public onChange: () => void;
  private actualArray: T[] = [];

  public constructor() {}

  public emitInitialEvents(): void {
    for (let i = 0; i < this.actualArray.length; i++) {
      this.onElementChange(i, this.actualArray[i], undefined);
    }
  }

  public get(index: number): T {
    return this.actualArray[index];
  }

  public set(index: number, newValue: T): void {
    let oldValue = this.actualArray[index];
    this.actualArray[index] = newValue;
    this.unsetPropagator(oldValue);
    this.setPropagator(newValue, () => {
      if (this.onChange) {
        this.onChange();
      }
    });
    if (this.onElementChange) {
      this.onElementChange(index, newValue, oldValue);
    }
    if (this.onChange) {
      this.onChange();
    }
  }

  public push(...newValues: Array<T>): void {
    for (let newValue of newValues) {
      this.actualArray.push(newValue);
      let index = this.actualArray.length - 1;
      this.setPropagator(newValue, () => {
        if (this.onChange) {
          this.onChange();
        }
      });
      if (this.onElementChange) {
        this.onElementChange(index, newValue, undefined);
      }
      if (this.onChange) {
        this.onChange();
      }
    }
  }

  public pop(): T {
    let oldValue = this.actualArray.pop();
    let index = this.actualArray.length;
    this.unsetPropagator(oldValue);
    if (this.onElementChange) {
      this.onElementChange(index, undefined, oldValue);
    }
    if (this.onChange) {
      this.onChange();
    }
    return oldValue;
  }

  get length(): number {
    return this.actualArray.length;
  }

  public [Symbol.iterator](): Iterator<T> {
    return this.actualArray[Symbol.iterator]();
  }

  public indexOf(value: T): number {
    return this.actualArray.indexOf(value);
  }

  public includes(value: T, start?: number): boolean {
    return this.actualArray.includes(value, start);
  }

  protected setPropagator(newValue: T, onChange: () => void): void {}

  protected unsetPropagator(oldValue: T): void {}
}

export class ObservableNestedArray<
  T extends Observable
> extends ObservableArray<T> {
  protected setPropagator(newValue: T, onChange: () => void): void {
    newValue.onChange = onChange;
  }

  protected unsetPropagator(oldValue: T): void {
    oldValue.onChange = undefined;
  }
}
