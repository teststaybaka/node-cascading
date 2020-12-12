import { LinkedList } from "./linked_list";
import { TestCase, TestSet, assert } from "./test_base";

function verifyFromBothSides<T>(linkedList: LinkedList<T>, expectedList: T[]) {
  assert(linkedList.getSize() === expectedList.length);
  let iter = linkedList.createLeftIterator();
  for (let i = 0; i < expectedList.length; i++, iter.next()) {
    assert(!iter.isEnd());
    assert(iter.getValue() === expectedList[i]);
  }
  assert(iter.isEnd());
  iter = linkedList.createRightIterator();
  for (let i = expectedList.length - 1; i >= 0; i--, iter.prev()) {
    assert(!iter.isStart());
    assert(iter.getValue() === expectedList[i]);
  }
  assert(iter.isStart());
}

class CreateEmptyList implements TestCase {
  public name = "CreateEmptyList";

  public execute() {
    // Execute
    let linkedList = new LinkedList<number>();

    // Verify
    assert(linkedList.getSize() === 0);
    let iter = linkedList.createLeftIterator();
    assert(iter.isEnd());
    iter = linkedList.createRightIterator();
    assert(iter.isStart());
  }
}

class PushBackOneValue implements TestCase {
  public name = "PushBackOneValue";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();

    // Execute
    linkedList.pushBack(12311);

    // Verify
    verifyFromBothSides(linkedList, [12311]);
  }
}

class PushBackTwoValues implements TestCase {
  public name = "PushBackTwoValues";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();

    // Execute
    linkedList.pushBack(12311);
    linkedList.pushBack(4332);

    // Verify
    verifyFromBothSides(linkedList, [12311, 4332]);
  }
}

class ClearWithTwoValues implements TestCase {
  public name = "ClearWithTwoValues";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(12311);
    linkedList.pushBack(4332);

    // Execute
    linkedList.clear();

    // Verify
    verifyFromBothSides(linkedList, []);
  }
}

class RemoveFirstOutOfTwo implements TestCase {
  public name = "RemoveFirstOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);
    let iter = linkedList.createLeftIterator();

    // Execute
    iter.removeAndNext();

    // Verify
    verifyFromBothSides(linkedList, [31]);
  }
}

class RemoveSecondOutOfTwo implements TestCase {
  public name = "RemoveSecondOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(31);
    linkedList.pushBack(333);
    let iter = linkedList.createLeftIterator();

    // Execute
    iter.next();
    iter.removeAndNext();

    // Verify
    verifyFromBothSides(linkedList, [31]);
  }
}

class RemoveTwoOutOfTwo implements TestCase {
  public name = "RemoveTwoOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(12121);
    linkedList.pushBack(333);
    let iter = linkedList.createLeftIterator();

    // Execute
    iter.removeAndNext();
    iter.removeAndNext();

    // Verify
    verifyFromBothSides(linkedList, []);
  }
}

class PopFrontFirstOutOfTwo implements TestCase {
  public name = "PopFrontFirstOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);

    // Execute
    let value = linkedList.popFront();

    // Verify
    assert(value === 132);
    verifyFromBothSides(linkedList, [31]);
  }
}

class PopFrontTwoOutOfTwo implements TestCase {
  public name = "PopFrontTwoOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);
    linkedList.popFront();

    // Execute
    let value = linkedList.popFront();

    // Verify
    assert(value === 31);
    verifyFromBothSides(linkedList, []);
  }
}

class PopBackLastOutOfTwo implements TestCase {
  public name = "PopBackLastOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);

    // Execute
    let value = linkedList.popBack();

    // Verify
    assert(value === 31);
    verifyFromBothSides(linkedList, [132]);
  }
}

class PopBackTwoOutOfTwo implements TestCase {
  public name = "PopBackTwoOutOfTwo";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(132);
    linkedList.pushBack(31);
    linkedList.popBack();

    // Execute
    let value = linkedList.popBack();

    // Verify
    assert(value === 132);
    verifyFromBothSides(linkedList, []);
  }
}

class SortOneNumber implements TestCase {
  public name = "SortOneNumber";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(1312);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [1312]);
  }
}

class SortTwoNumbers implements TestCase {
  public name = "SortTwoNumbers";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(1312);
    linkedList.pushBack(132);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [132, 1312]);
  }
}

class SortThreeNumbers implements TestCase {
  public name = "SortThreeNumbers";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(5);
    linkedList.pushBack(3);
    linkedList.pushBack(4);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [3, 4, 5]);
  }
}

class SortFourNumbers implements TestCase {
  public name = "SortFourNumbers";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(5);
    linkedList.pushBack(3);
    linkedList.pushBack(4);
    linkedList.pushBack(9);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [3, 4, 5, 9]);
  }
}

class SortFiveNumbers implements TestCase {
  public name = "SortFiveNumbers";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(5);
    linkedList.pushBack(3);
    linkedList.pushBack(4);
    linkedList.pushBack(9);
    linkedList.pushBack(1);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [1, 3, 4, 5, 9]);
  }
}

class SortSixNumbers implements TestCase {
  public name = "SortSixNumbers";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(5);
    linkedList.pushBack(3);
    linkedList.pushBack(4);
    linkedList.pushBack(9);
    linkedList.pushBack(1);
    linkedList.pushBack(7);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [1, 3, 4, 5, 7, 9]);
  }
}

class SortSevenNumbers implements TestCase {
  public name = "SortSevenNumbers";

  public execute() {
    // Prepare
    let linkedList = new LinkedList<number>();
    linkedList.pushBack(5);
    linkedList.pushBack(3);
    linkedList.pushBack(4);
    linkedList.pushBack(9);
    linkedList.pushBack(1);
    linkedList.pushBack(7);
    linkedList.pushBack(2);

    // Execute
    linkedList.sort();

    // Verify
    verifyFromBothSides(linkedList, [1, 2, 3, 4, 5, 7, 9]);
  }
}

class SortObjects implements TestCase {
  public name = "SortObjects";

  public execute() {
    // Prepare
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
    verifyFromBothSides(linkedList, [value2, value3, value, value4]);
  }
}

class SortObjectsStable implements TestCase {
  public name = "SortObjectsStable";

  public execute() {
    // Prepare
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
    verifyFromBothSides(linkedList, [value2, value3, value, value4]);
  }
}

export let LINKED_LIST_TEST: TestSet = {
  name: "LinkedListTest",
  cases: [
    new CreateEmptyList(),
    new PushBackOneValue(),
    new PushBackTwoValues(),
    new ClearWithTwoValues(),
    new RemoveFirstOutOfTwo(),
    new RemoveSecondOutOfTwo(),
    new RemoveTwoOutOfTwo(),
    new PopFrontFirstOutOfTwo(),
    new PopFrontTwoOutOfTwo(),
    new PopBackLastOutOfTwo(),
    new PopBackTwoOutOfTwo(),
    new SortOneNumber(),
    new SortTwoNumbers(),
    new SortThreeNumbers(),
    new SortFourNumbers(),
    new SortFiveNumbers(),
    new SortSixNumbers(),
    new SortSevenNumbers(),
    new SortObjects(),
    new SortObjectsStable(),
  ],
};
