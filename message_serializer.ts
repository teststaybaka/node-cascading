export interface MessageSerializer<T> {
  fromObj: ((obj?: any) => T),
  toString: ((value: T) => string),
}

