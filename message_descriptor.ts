export interface MessageDescriptor<T> {
  from: ((obj?: any) => T),
}

