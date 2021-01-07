export class DefaultMap<K, V> {
  private actualMap = new Map<K, V>();

  public constructor(private defaultValueFactoryFn: () => V) {}

  // Typically for value of primitive type.
  public static createWithValue<K, V>(
    defaultValue: V
  ): DefaultMap<K, V> {
    return new DefaultMap<K, V>(() => defaultValue);
  }

  // Typically for value of object type.
  public static createWithFactory<K, V>(
    defaultFactoryFn: () => V
  ): DefaultMap<K, V> {
    return new DefaultMap<K, V>(defaultFactoryFn);
  }

  public get(key: K): V {
    let value = this.actualMap.get(key);
    if (!value) {
      value = this.defaultValueFactoryFn();
      this.actualMap.set(key, value);
    }
    return value;
  }

  public set(key: K, value: V): this {
    this.actualMap.set(key, value);
    return this;
  }

  public delete(key: K): boolean {
    return this.actualMap.delete(key);
  }

  public has(key: K): boolean {
    return this.actualMap.has(key);
  }

  public size(): number {
    return this.actualMap.size;
  }

  public [Symbol.iterator](): Iterator<[K, V]> {
    return this.actualMap[Symbol.iterator]();
  }

  public entries(): Iterator<[K, V]> {
    return this.actualMap.entries();
  }

  public keys(): Iterator<K> {
    return this.actualMap.keys();
  }

  public values(): Iterator<V> {
    return this.actualMap.values();
  }

  public forEach(
    callbackFn: (value: V, key: K, map: DefaultMap<K, V>) => void
  ): void {
    this.actualMap.forEach((value, key) => callbackFn(value, key, this));
  }
}
