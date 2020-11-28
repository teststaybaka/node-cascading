// Depends on code generator to supplement specific event hooks.
export interface Observable {
  // Generated property change event hook per each property.
  // on<property name>Change: (newValue: T, oldValue: T) => void;

  // Another property change event hook for each property but neglecting
  // specific details.
  onChange: () => void;

  // Emits property change events for all properties, with oldValue set to
  // undefined and newValue set to be the current value.
  emitInitialEvents: () => void;
}
