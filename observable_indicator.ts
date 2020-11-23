// An indicator for code generator to generate specific event hooks.
export interface ObservableIndicator {
  // Generated property change event hook per each property.
  // on<property name>Change: (newValue: T, oldValue: T) => void;

  // Property change event hook for each property without specific details.
  onOverallChange: () => void;

  // Emits property change events for all properties, with oldValue set to
  // undefined and newValue set to be the current value.
  emitInitialEvents: () => void;
}
