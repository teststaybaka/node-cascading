export interface MessageParser<T> {
  from: (obj?:any, output?: object) => T;
}

