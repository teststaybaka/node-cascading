export interface InterfaceDescriptor<T> {
  from: ((obj?: any) => T),
}

