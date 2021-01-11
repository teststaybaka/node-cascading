import { Observable } from "./observable";
import { ObservableArray, ObservableNestedArray } from "./observable_array";
import { eqObservableArray } from "./observable_array_test_util";
import { assertThat, eq } from "@selfage/test_base/matcher";
import { TEST_RUNNER } from "@selfage/test_base/runner";

class Fact implements Observable {
  public onChange: () => void;

  public emitInitialEvents(): void {}

  public toJSON(): Object {
    return new Object();
  }
}

TEST_RUNNER.run({
  name: "ObservableArrayTest",
  cases: [
    {
      name: "PushAndIterate",
      execute: () => {
        // Prepare
        let arr = new ObservableArray<number>();
        let elementChangeCount = 0;
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          assertThat(index, eq(0), "index");
          assertThat(newValue, eq(100), "newValue");
          assertThat(oldValue, eq(undefined), "oldValue");
        };
        let changeCount = 0;
        arr.onChange = () => {
          changeCount++;
        };

        // Execute
        arr.push(100);

        // Verify
        assertThat(arr, eqObservableArray([eq(100)]), "arr");
        assertThat(elementChangeCount, eq(1), "elementChangeCount");
        assertThat(changeCount, eq(1), "changeCount");

        // Prepare
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          assertThat(index, eq(1), "index");
          assertThat(newValue, eq(200), "newValue");
          assertThat(oldValue, eq(undefined), "oldValue");
        };

        // Execute
        arr.push(200);

        // Verify
        assertThat(arr, eqObservableArray([eq(100), eq(200)]), "arr");
        assertThat(elementChangeCount, eq(2), "elementChangeCount");
        assertThat(changeCount, eq(2), "changeCount");

        // Execute
        let i = 0;
        for (let element of arr) {
          // Verify
          assertThat(element, eq(arr.get(i)), `${i}th element of arr`);
          i++;
        }
      },
    },
    {
      name: "SetElements",
      execute: () => {
        // Prepare
        let arr = new ObservableArray<number>();
        arr.push(100, 200);
        let elementChangeCount = 0;
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          assertThat(index, eq(0), "index");
          assertThat(newValue, eq(1), "newValue");
          assertThat(oldValue, eq(100), "oldValue");
        };
        let changeCount = 0;
        arr.onChange = () => {
          changeCount++;
        };

        // Execute
        arr.set(0, 1);

        // Verify
        assertThat(arr, eqObservableArray([eq(1), eq(200)]), "arr");
        assertThat(elementChangeCount, eq(1), "elementChangeCount");
        assertThat(changeCount, eq(1), "changeCount");

        // Prepare
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          assertThat(index, eq(1), "index");
          assertThat(newValue, eq(2), "newValue");
          assertThat(oldValue, eq(200), "oldValue");
        };

        // Execute
        arr.set(1, 2);

        // Verify
        assertThat(arr, eqObservableArray([eq(1), eq(2)]), "arr");
        assertThat(elementChangeCount, eq(2), "elementChangeCount");
        assertThat(changeCount, eq(2), "changeCount");
      },
    },
    {
      name: "PopElements",
      execute: () => {
        // Prepare
        let arr = new ObservableArray<number>();
        arr.push(100, 200);
        let elementChangeCount = 0;
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          assertThat(index, eq(1), "index");
          assertThat(newValue, eq(undefined), "newValue");
          assertThat(oldValue, eq(200), "oldValue");
        };
        let changeCount = 0;
        arr.onChange = () => {
          changeCount++;
        };

        // Execute
        let value = arr.pop();

        // Verify
        assertThat(arr, eqObservableArray([eq(100)]), "arr");
        assertThat(value, eq(200), "value");
        assertThat(elementChangeCount, eq(1), "elementChangeCount");
        assertThat(changeCount, eq(1), "changeCount");

        // Prepare
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          assertThat(index, eq(0), "index");
          assertThat(newValue, eq(undefined), "newValue");
          assertThat(oldValue, eq(100), "oldValue");
        };

        // Execute
        value = arr.pop();

        // Verify
        assertThat(arr, eqObservableArray([]), "arr");
        assertThat(value, eq(100), "value");
        assertThat(elementChangeCount, eq(2), "elementChangeCount");
        assertThat(changeCount, eq(2), "changeCount");
      },
    },
    {
      name: "EmitInitialEvents",
      execute: () => {
        // Prepare
        let arr = new ObservableArray<number>();
        arr.push(100, 200);
        let elementChangeCount = 0;
        arr.onElementChange = (index, newValue, oldValue) => {
          elementChangeCount++;
          // TODO: Refactor a counter.
          if (index === 0) {
            assertThat(newValue, eq(100), "newValue");
            assertThat(oldValue, eq(undefined), "oldValue");
          } else {
            assertThat(newValue, eq(200), "newValue");
            assertThat(oldValue, eq(undefined), "oldValue");
          }
        };
        let changeCount = 0;
        arr.onChange = () => {
          changeCount++;
        };

        // Execute
        arr.emitInitialEvents();

        // Verify
        assertThat(elementChangeCount, eq(2), "elementChangeCount");
        assertThat(changeCount, eq(0), "changeCount");
      },
    },
    {
      name: "JsonStringify",
      execute: () => {
        // Prepare
        let arr = new ObservableArray<number>();
        arr.push(100, 200);

        // Execute
        let serailzied = JSON.stringify(arr);

        // Verify
        assertThat(serailzied, eq("[100,200]"), "serailzied");
      },
    },
    {
      name: "PushAndSetObservable",
      execute: () => {
        // Prepare
        let arr = new ObservableNestedArray<Fact>();
        let fact = new Fact();

        // Execute
        arr.push(fact);

        // Verify
        let changeCount = 0;
        arr.onChange = () => {
          changeCount++;
        };
        fact.onChange();
        assertThat(arr, eqObservableArray([eq(fact)]), "arr");
        assertThat(changeCount, eq(1), "changeCount");

        // Prepare
        let fact2 = new Fact();
        arr.onChange = undefined;

        // Execute
        arr.set(0, fact2);

        // Verify
        arr.onChange = () => {
          changeCount++;
        };
        fact2.onChange();
        assertThat(arr, eqObservableArray([eq(fact2)]), "arr");
        assertThat(changeCount, eq(2), "changeCount");
        assertThat(fact.onChange, eq(undefined), "fact.onChange");
      },
    },
  ],
});
