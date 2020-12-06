import {
  ObservableNestedArray,
  ObservableArray,
} from "./observable_array";
import { Observable } from "./observable";
import { TestCase, TestSet, assert } from "./test_base";

class PushFirst implements TestCase {
  public name = "PushFirst";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>();
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === 100);
      assert(oldValue === undefined);
    };
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };

    // Execute
    arr.push(100);

    // Verify
    assert(arr.get(0) === 100);
    assert(elementChangeCount === 1);
    assert(changeCount === 1);
  }
}

class PushSecond implements TestCase {
  public name = "PushSecond";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>();
    arr.push(100);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 1);
      assert(newValue === 200);
      assert(oldValue === undefined);
    };
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };

    // Execute
    arr.push(200);

    // Verify
    assert(arr.get(1) === 200);
    assert(elementChangeCount === 1);
    assert(changeCount === 1);
  }
}

class Iterate implements TestCase {
  public name = "Iterate";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>();
    arr.push(100, 200);
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
    let arr = new ObservableArray<number>();
    arr.push(100, 200);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === 1);
      assert(oldValue === 100);
    };
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };

    // Execute
    arr.set(0, 1);

    // Verify
    assert(arr.get(0) === 1);
    assert(elementChangeCount === 1);
    assert(changeCount === 1);
  }
}

class SetSecond implements TestCase {
  public name = "SetSecond";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>();
    arr.push(100, 200);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 1);
      assert(newValue === 2);
      assert(oldValue === 200);
    };
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };

    // Execute
    arr.set(1, 2);

    // Verify
    assert(arr.get(1) === 2);
    assert(elementChangeCount === 1);
    assert(changeCount === 1);
  }
}

class PopFirst implements TestCase {
  public name = "PopFirst";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>();
    arr.push(100);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 0);
      assert(newValue === undefined);
      assert(oldValue === 100);
    };
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };

    // Execute
    let value = arr.pop();

    // Verify
    assert(value === 100);
    assert(elementChangeCount === 1);
    assert(changeCount === 1);
  }
}

class PopSecond implements TestCase {
  public name = "PopSecond";

  public execute() {
    // Prepare
    let arr = new ObservableArray<number>();
    arr.push(100, 200);
    let elementChangeCount = 0;
    arr.onElementChange = (index, newValue, oldValue) => {
      elementChangeCount++;
      assert(index === 1);
      assert(newValue === undefined);
      assert(oldValue === 200);
    };
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };

    // Execute
    let value = arr.pop();

    // Verify
    assert(value === 200);
    assert(elementChangeCount === 1);
    assert(changeCount === 1);
  }
}

class Fact implements Observable {
  public onChange: () => void;

  public emitInitialEvents(): void {}
}

class PushObservable implements TestCase {
  public name = "PushObservable";

  public execute() {
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
    assert(arr.get(0) === fact);
    assert(changeCount === 1);
  }
}

class SetObservable implements TestCase {
  public name = "SetObservable";

  public execute() {
    // Prepare
    let arr = new ObservableNestedArray<Fact>();
    let fact = new Fact();
    arr.push(fact);
    let fact2 = new Fact();
    
    // Execute
    arr.set(0, fact2);
    
    // Verify
    let changeCount = 0;
    arr.onChange = () => {
      changeCount++;
    };
    fact2.onChange();
    assert(arr.get(0) === fact2);
    assert(changeCount === 1);
    assert(fact.onChange === undefined);
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
