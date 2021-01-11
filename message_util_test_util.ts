import { MessageDescriptor } from "./message_descriptor";
import { eqObservableArray } from "./observable_array_test_util";
import { MatchFn, assertThat, eq, eqArray } from "@selfage/test_base/matcher";

export function eqMessage<T>(
  expected: T | undefined,
  descriptor: MessageDescriptor<T>
): MatchFn<T> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    let expectedAny = expected as any;
    let actualAny = actual as any;
    for (let field of descriptor.fields) {
      let eqField: MatchFn<any>;
      if (field.primitiveType || field.enumDescriptor) {
        if (field.arrayFactoryFn || field.observableArrayFactoryFn) {
          let eqElementArray: Array<MatchFn<any>>;
          if (expectedAny[field.name] !== undefined) {
            eqElementArray = expectedAny[field.name].map((element: any) =>
              eq(element)
            );
          }
          if (field.arrayFactoryFn) {
            eqField = eqArray(eqElementArray);
          } else {
            eqField = eqObservableArray(eqElementArray);
          }
        } else {
          eqField = eq(expectedAny[field.name]);
        }
      } else if (field.messageDescriptor) {
        if (field.arrayFactoryFn || field.observableArrayFactoryFn) {
          let eqElementArray: Array<MatchFn<any>>;
          if (expectedAny[field.name] !== undefined) {
            eqElementArray = expectedAny[field.name].map((element: any) =>
              eqMessage(element, field.messageDescriptor)
            );
          }
          if (field.arrayFactoryFn) {
            eqField = eqArray(eqElementArray);
          } else {
            eqField = eqObservableArray(eqElementArray);
          }
        } else {
          eqField = eqMessage(expectedAny[field.name], field.messageDescriptor);
        }
      } else {
        throw new Error(
          `Field type of ${field.name} is not supported. Field definition ` +
            `is ${JSON.stringify(field)}`
        );
      }
      assertThat(actualAny[field.name], eqField, `${field.name} field`);
    }
  };
}
