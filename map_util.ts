export function findWithDefault<Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  defaultValue: Value
): Value {
  let value = map.get(key);
  if (value === undefined) {
    return defaultValue;
  } else {
    return value;
  }
}
