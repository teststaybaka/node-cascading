import { ObservableIndicator } from "./observable_indicator";

export interface NestedChangePropagator<T> {
  setPropagator: (newValue: T, onOverallChange: () => void) => void;
  unsetPropagator: (oldValue: T) => void;
}

export class NestedObservablePropagator<T extends ObservableIndicator> {
  public setPropagator(newValue: T, onOverallChange: () => void): void {
    newValue.onOverallChange = onOverallChange;
  }

  public unsetPropagator(oldValue: T): void {
    oldValue.onOverallChange = undefined;
  }
}

export class NonPropagator<T> {
  public setPropagator(newValue: T, onOverallChange: () => void): void {}

  public unsetPropagator(oldValue: T): void {}
}

export class ObservableArray<T> implements Iterable<T>, ObservableIndicator {
  public onElementChange: (index: number, newValue: T, oldValue: T) => void;
  public onOverallChange: () => void;
  private actualArray: T[] = [];

  public constructor(
    private nestedChangePropagator: NestedChangePropagator<T>
  ) {}

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
    this.nestedChangePropagator.unsetPropagator(oldValue);
    this.nestedChangePropagator.setPropagator(newValue, () => {
      if (this.onElementChange) {
        this.onElementChange(index, newValue, newValue);
      }
      if (this.onOverallChange) {
        this.onOverallChange();
      }
    });
    if (this.onElementChange) {
      this.onElementChange(index, newValue, oldValue);
    }
    if (this.onOverallChange) {
      this.onOverallChange();
    }
  }

  public push(newValue: T): void {
    this.actualArray.push(newValue);
    let index = this.actualArray.length - 1;
    this.nestedChangePropagator.setPropagator(newValue, () => {
      if (this.onElementChange) {
        this.onElementChange(index, newValue, newValue);
      }
      if (this.onOverallChange) {
        this.onOverallChange();
      }
    });
    if (this.onElementChange) {
      this.onElementChange(index, newValue, undefined);
    }
    if (this.onOverallChange) {
      this.onOverallChange();
    }
  }

  public pop(): T {
    let oldValue = this.actualArray.pop();
    let index = this.actualArray.length;
    this.nestedChangePropagator.unsetPropagator(oldValue);
    if (this.onElementChange) {
      this.onElementChange(index, undefined, oldValue);
    }
    if (this.onOverallChange) {
      this.onOverallChange();
    }
    return oldValue;
  }

  public length(): number {
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
}
