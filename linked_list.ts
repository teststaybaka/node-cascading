class LinkedNode<T> {
  public prev: LinkedNode<T>;
  public next: LinkedNode<T>;

  public constructor(private value?: T) {}

  public getValue(): T {
    return this.value;
  }
}

export class LinkedListIterator<T> {
  public constructor(
    private list: LinkedList<T>,
    private node: LinkedNode<T>
  ) {}

  public getValue(): T {
    return this.node.getValue();
  }

  public isStart(): boolean {
    return this.list.isStart(this.node);
  }

  public isEnd(): boolean {
    return this.list.isEnd(this.node);
  }

  public next(): void {
    this.node = this.node.next;
  }

  public prev(): void {
    this.node = this.node.prev;
  }

  public removeAndNext(): void {
    let next = this.node.next;
    this.list.remove(this.node);
    this.node = next;
  }

  public removeAndPrev(): void {
    let prev = this.node.prev;
    this.list.remove(this.node);
    this.node = prev;
  }
}

export class LinkedList<T> {
  private start = new LinkedNode<T>();
  private end = new LinkedNode<T>();
  private size = 0;

  public constructor() {
    this.clear();
  }

  public clear(): void {
    this.start.next = this.end;
    this.end.prev = this.start;
    this.size = 0;
  }

  public pushBack(value: T): void {
    let node = new LinkedNode(value);
    let prev = this.end.prev;
    prev.next = node;
    this.end.prev = node;
    node.prev = prev;
    node.next = this.end;
    this.size++;
  }

  // External check: Node has to be belonged to this list.
  public remove(node: LinkedNode<T>): void {
    let next = node.next;
    let prev = node.prev;
    prev.next = next;
    next.prev = prev;
    this.size--;
  }

  public popFront(): T {
    let node = this.start.next;
    this.remove(node);
    return node.getValue();
  }

  public getSize(): number {
    return this.size;
  }

  public isStart(node: LinkedNode<T>): boolean {
    return node === this.start;
  }

  public isEnd(node: LinkedNode<T>): boolean {
    return node === this.end;
  }

  public createLeftIterator(): LinkedListIterator<T> {
    return new LinkedListIterator(this, this.start.next);
  }

  public createRightIterator(): LinkedListIterator<T> {
    return new LinkedListIterator(this, this.end.prev);
  }

  public sort(shouldKeep?: (l: T, r: T) => boolean): void {
    for (let subLength = 1; subLength < this.size; subLength *= 2) {
      let pointer = this.start.next;
      while (pointer !== this.end) {
        let lStart = pointer;
        for (let i = 0; i < subLength && pointer !== this.end; i++) {
          pointer = pointer.next;
        }

        let rStart = pointer;
        for (let i = 0; i < subLength && pointer !== this.end; i++) {
          pointer = pointer.next;
        }

        this.merge(lStart, rStart, subLength, shouldKeep);
      }
    }
  }

  private merge(
    lStart: LinkedNode<T>,
    rStart: LinkedNode<T>,
    length: number,
    shouldKeep?: (l: T, r: T) => boolean
  ): void {
    for (
      let lCount = 0, rCount = 0;
      lCount < length && rCount < length && rStart !== this.end;

    ) {
      let lValue = lStart.getValue();
      let rValue = rStart.getValue();
      if (
        (shouldKeep && shouldKeep(lValue, rValue)) ||
        (!shouldKeep && lValue <= rValue)
      ) {
        lStart = lStart.next;
        lCount++;
      } else {
        let node = rStart;
        rStart = rStart.next;
        rCount++;

        let rPrev = node.prev;
        rPrev.next = rStart;
        rStart.prev = rPrev;

        let lPrev = lStart.prev;
        lPrev.next = node;
        lStart.prev = node;
        node.next = lStart;
        node.prev = lPrev;
      }
    }
  }
}
