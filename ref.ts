// Shorthand for reference.
export interface Ref<T> {
  value?: T;
}

export function assignRef<T>(ref: Ref<T>, value: T): T {
  ref.value = value;
  return value;
}
