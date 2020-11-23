import {
  NestedObservablePropagator,
  NonPropagator,
  ObservableArray,
} from "./observable_array";
import { ObservableIndicator } from "./observable_indicator";
import { TestCase, TestSet, assert } from "./test_base";

class PushFirst implements TestCase {
  public name = "PushFirst";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === 100);
      assert(oldValue === undefined);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };

    // Execute
    arr.push(100);

    // Verify
    assert(arr.get(0) === 100);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class PushSecond implements TestCase {
  public name = "PushSecond";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    arr.push(100);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 1);
      assert(newValue === 200);
      assert(oldValue === undefined);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };

    // Execute
    arr.push(200);

    // Verify
    assert(arr.get(1) === 200);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class Iterate implements TestCase {
  public name = "Iterate";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    arr.push(100);
    arr.push(200);
    let i = 0;

    // Execute
    for (let element of arr) {
      // Verify
      assert(element === arr.get(i));
      i++;
    }
  }
}

class SetFirst implements TestCase {
  public name = "SetFirst";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    arr.push(100);
    arr.push(200);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === 1);
      assert(oldValue === 100);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };

    // Execute
    arr.set(0, 1);

    // Verify
    assert(arr.get(0) === 1);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class SetSecond implements TestCase {
  public name = "SetSecond";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    arr.push(100);
    arr.push(200);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 1);
      assert(newValue === 2);
      assert(oldValue === 200);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };

    // Execute
    arr.set(1, 2);

    // Verify
    assert(arr.get(1) === 2);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class PopFirst implements TestCase {
  public name = "PopFirst";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    arr.push(100);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === undefined);
      assert(oldValue === 100);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };

    // Execute
    let value = arr.pop();

    // Verify
    assert(value === 100);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class PopSecond implements TestCase {
  public name = "PopSecond";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>(new NonPropagator());
    arr.push(100);
    arr.push(200);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 1);
      assert(newValue === undefined);
      assert(oldValue === 200);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };

    // Execute
    let value = arr.pop();

    // Verify
    assert(value === 200);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class Fact implements ObservableIndicator {
  public onOverallChange: () => void;

  public emitInitialEvents(): void {}
}

class PushObservable implements TestCase {
  public name = "PushObservable";

  public execute() {
    // Prepare
    let arr = new ObservableArray<Fact>(new NestedObservablePropagator());
    let fact = new Fact();
    
    // Execute
    arr.push(fact);
    
    // Verify
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === fact);
      assert(oldValue === fact);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };
    fact.onOverallChange();
    assert(arr.get(0) === fact);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
  }
}

class SetObservable implements TestCase {
  public name = "SetObservable";

  public execute() {
    // Prepare
    let arr = new ObservableArray<Fact>(new NestedObservablePropagator());
    let fact = new Fact();
    arr.push(fact);
    let fact2 = new Fact();
    
    // Execute
    arr.set(0, fact2);
    
    // Verify
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === fact2);
      assert(oldValue === fact2);
    };
    let overallChangeCount = 0;
    arr.onOverallChange = () => {
      overallChangeCount++;
    };
    fact2.onOverallChange();
    assert(arr.get(0) === fact2);
    assert(elementChangeCount === 1);
    assert(overallChangeCount === 1);
    assert(fact.onOverallChange === undefined);
  }
}

export let OBSERVABLE_ARRAY_TEST: TestSet = {
  name: "ObservableArrayTest",
  cases: [
    new PushFirst(),
    new PushSecond(),
    new Iterate(),
    new SetFirst(),
    new SetSecond(),
    new PopFirst(),
    new PopSecond(),
    new PushObservable(),
    new SetObservable(),
  ],
};
