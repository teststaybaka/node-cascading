export interface MessageSerializer<T> {
  fromObj: ((obj?: any, output?: object) => T),
  toString: ((value: T) => string),
}

