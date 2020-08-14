import { LinkedList } from "./linked_list";
import { Expectation, TestCase, assert, runTests } from "./test_base";

class CreateEmptyList implements TestCase {
  public name = "CreateEmptyList";

  public execute() {
    // Execute
    let linkedList = new LinkedList<number>();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 0);
    assert(iter.isEnd());
  }
}

class PushBackOneValue implements TestCase {
  public name = "PushBackOneValue";

  public execute() {
    // Execute
    let value = 12311;
    let linkedList = new LinkedList<number>();

    // Execute
    linkedList.pushBack(value);

    // Verify
    assert(linkedList.getSize() === 1);
    let iter = linkedList.createLeftIterator();
    assert(!iter.isEnd());
    Expectation.expect(iter.getValue() === value);
    iter.next();
    assert(iter.isEnd());
  }
}

class PushBackTwoValues implements TestCase {
  public name = "PushBackTwoValues";

  public execute() {
    // Execute
    let value = 12311;
    let value2 = 4332;
    let linkedList = new LinkedList<number>();

    // Execute
    linkedList.pushBack(value);
    linkedList.pushBack(value2);

    // Verify
    assert(linkedList.getSize() === 2);
    let iter = linkedList.createLeftIterator();
    assert(!iter.isEnd());
    Expectation.expect(iter.getValue() === value);
    iter.next();
    assert(!iter.isEnd());
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    assert(iter.isEnd());
  }
}

class ClearWithTwoValues implements TestCase {
  public name = "ClearWithTwoValues";

  public execute() {
    // Execute
    let value = 12311;
    let value2 = 4332;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);

    // Execute
    linkedList.clear();

    // Verify
    assert(linkedList.getSize() === 0);
    let iter = linkedList.createLeftIterator();
    assert(iter.isEnd());
  }
}

class RemoveFirstOutOfTwo implements TestCase {
  public name = "RemoveFirstOutOfTwo";

  public execute() {
    // Execute
    let value = 31;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(value);
    let iter = linkedList.createLeftIterator();

    // Execute
    iter.removeAndNext();

    // Verify
    assert(linkedList.getSize() === 1);
    assert(!iter.isEnd());
    Expectation.expect(iter.getValue() === value);
    iter.next();
    assert(iter.isEnd());
    iter.prev();
    iter.prev();
    assert(iter.isStart());
  }
}

class RemoveSecondOutOfTwo implements TestCase {
  public name = "RemoveSecondOutOfTwo";

  public execute() {
    // Execute
    let value = 31;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(333);
    let iter = linkedList.createLeftIterator();

    // Execute
    iter.next();
    iter.removeAndNext();

    // Verify
    assert(linkedList.getSize() === 1);
    assert(iter.isEnd());
    iter.prev();
    Expectation.expect(iter.getValue() === value);
    iter.prev();
    assert(iter.isStart());
  }
}

class RemoveTwoOutOfTwo implements TestCase {
  public name = "RemoveTwoOutOfTwo";

  public execute() {
    // Execute
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(12121);
    linkedList.pushBack(333);
    let iter = linkedList.createLeftIterator();

    // Execute
    iter.removeAndNext();
    iter.removeAndNext();

    // Verify
    assert(linkedList.getSize() === 0);
    assert(iter.isEnd());
    iter.prev();
    assert(iter.isStart());
  }
}

class PopFirstOutOfTwo implements TestCase {
  public name = "PopFirstOutOfTwo";

  public execute() {
    // Execute
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);

    // Execute
    let value = linkedList.popFront();

    // Verify
    assert(linkedList.getSize() === 1);
    Expectation.expect(value === 132);
    let iter = linkedList.createLeftIterator();
    assert(!iter.isEnd());
    Expectation.expect(iter.getValue() === 31);
    iter.next();
    assert(iter.isEnd());
  }
}

class PopTwoOutOfTwo implements TestCase {
  public name = "PopTwoOutOfTwo";

  public execute() {
    // Execute
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);
    linkedList.popFront();

    // Execute
    let value = linkedList.popFront();

    // Verify
    assert(linkedList.getSize() === 0);
    Expectation.expect(value === 31);
    let iter = linkedList.createLeftIterator();
    assert(iter.isEnd());
  }
}

class SortOneNumber implements TestCase {
  public name = "SortOneNumber";

  public execute() {
    // Execute
    let value = 1312;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 1);
    Expectation.expect(iter.getValue() === value);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortTwoNumbers implements TestCase {
  public name = "SortTwoNumbers";

  public execute() {
    // Execute
    let value = 1312;
    let value2 = 132;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 2);
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortThreeNumbers implements TestCase {
  public name = "SortThreeNumbers";

  public execute() {
    // Execute
    let value = 5;
    let value2 = 3;
    let value3 = 4;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 3);
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortFourNumbers implements TestCase {
  public name = "SortFourNumbers";

  public execute() {
    // Execute
    let value = 5;
    let value2 = 3;
    let value3 = 4;
    let value4 = 9;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);
    linkedList.pushBack(value4);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 4);
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    Expectation.expect(iter.getValue() === value4);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortFiveNumbers implements TestCase {
  public name = "SortFiveNumbers";

  public execute() {
    // Execute
    let value = 5;
    let value2 = 3;
    let value3 = 4;
    let value4 = 9;
    let value5 = 1;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);
    linkedList.pushBack(value4);
    linkedList.pushBack(value5);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 5);
    Expectation.expect(iter.getValue() === value5);
    iter.next();
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    Expectation.expect(iter.getValue() === value4);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortSixNumbers implements TestCase {
  public name = "SortSixNumbers";

  public execute() {
    // Execute
    let value = 5;
    let value2 = 3;
    let value3 = 4;
    let value4 = 9;
    let value5 = 1;
    let value6 = 7;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);
    linkedList.pushBack(value4);
    linkedList.pushBack(value5);
    linkedList.pushBack(value6);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 6);
    Expectation.expect(iter.getValue() === value5);
    iter.next();
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    Expectation.expect(iter.getValue() === value6);
    iter.next();
    Expectation.expect(iter.getValue() === value4);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortSevenNumbers implements TestCase {
  public name = "SortSevenNumbers";

  public execute() {
    // Execute
    let value = 5;
    let value2 = 3;
    let value3 = 4;
    let value4 = 9;
    let value5 = 1;
    let value6 = 7;
    let value7 = 2;
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);
    linkedList.pushBack(value4);
    linkedList.pushBack(value5);
    linkedList.pushBack(value6);
    linkedList.pushBack(value7);

    // Execute
    linkedList.sort();

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 7);
    Expectation.expect(iter.getValue() === value5);
    iter.next();
    Expectation.expect(iter.getValue() === value7);
    iter.next();
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    Expectation.expect(iter.getValue() === value6);
    iter.next();
    Expectation.expect(iter.getValue() === value4);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortObjects implements TestCase {
  public name = "SortObjects";

  public execute() {
    // Execute
    let value = { num: 5 };
    let value2 = { num: 3 };
    let value3 = { num: 4 };
    let value4 = { num: 9 };
    let linkedList = new LinkedList<{ num: number }>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);
    linkedList.pushBack(value4);

    // Execute
    linkedList.sort((l, r) => {
      return l.num <= r.num;
    });

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 4);
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    Expectation.expect(iter.getValue() === value4);
    iter.next();
    assert(iter.isEnd());
  }
}

class SortObjectsStable implements TestCase {
  public name = "SortObjectsStable";

  public execute() {
    // Execute
    let value = { num: 5 };
    let value2 = { num: 3 };
    let value3 = { num: 3 };
    let value4 = { num: 9 };
    let linkedList = new LinkedList<{ num: number }>();
    linkedList.pushBack(value);
    linkedList.pushBack(value2);
    linkedList.pushBack(value3);
    linkedList.pushBack(value4);

    // Execute
    linkedList.sort((l, r) => {
      return l.num <= r.num;
    });

    // Verify
    let iter = linkedList.createLeftIterator();
    assert(linkedList.getSize() === 4);
    Expectation.expect(iter.getValue() === value2);
    iter.next();
    Expectation.expect(iter.getValue() === value3);
    iter.next();
    Expectation.expect(iter.getValue() === value);
    iter.next();
    Expectation.expect(iter.getValue() === value4);
    iter.next();
    assert(iter.isEnd());
  }
}

runTests("LinkedListTest", [
  new CreateEmptyList(),
  new PushBackOneValue(),
  new PushBackTwoValues(),
  new ClearWithTwoValues(),
  new RemoveFirstOutOfTwo(),
  new RemoveSecondOutOfTwo(),
  new RemoveTwoOutOfTwo(),
  new PopFirstOutOfTwo(),
  new PopTwoOutOfTwo(),
  new SortOneNumber(),
  new SortTwoNumbers(),
  new SortThreeNumbers(),
  new SortFourNumbers(),
  new SortFiveNumbers(),
  new SortSixNumbers(),
  new SortSevenNumbers(),
  new SortObjects(),
  new SortObjectsStable(),
]);
