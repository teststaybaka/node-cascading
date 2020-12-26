export function assert(
  tested: boolean,
  expected: string,
  actual: string
): void {
  if (!tested) {
    throw new Error(`Expect ${expected} but it actually is ${actual}.`);
  }
}

export async function assertRejection(promise: Promise<any>) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error("Failed to assert the promise to be rejected.");
}

export function assertThrow(method: () => void) {
  try {
    method();
  } catch (e) {
    return e;
  }
  throw new Error("Failed to assert an error to be thrown.");
}

export type MatchFn<T> = (actual: T) => void;

export function assertThat<T>(
  actual: T,
  match: MatchFn<T>,
  targetName: string
): void {
  try {
    match(actual);
  } catch (e) {
    e.message = `When matching ${targetName}:\n${e.message}`;
    throw e;
  }
}

export function eq<T>(expected: T): MatchFn<T> {
  return (actual) => {
    assert(expected === actual, `${expected}`, `${actual}`);
  };
}

export function containStr(expected: string): MatchFn<string> {
  return (actual) => {
    assert(actual.indexOf(expected) != -1, `containing ${expected}`, actual);
  };
}

export function eqArray<T>(expected?: Array<MatchFn<T>>): MatchFn<Array<T>> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    assertThat(actual.length, eq(expected.length), `array length`);
    for (let i = 0; i < actual.length; i++) {
      assertThat(actual[i], expected[i], `${i}th element`);
    }
  };
}

export function eqError(expected: Error): MatchFn<any> {
  return (actual) => {
    assert(actual instanceof Error, `to be an Error`, `${actual}`);
    assertThat(actual.name, eq(expected.name), `name of the error`);
    assertThat(actual.message, containStr(expected.message), `${actual.stack}`);
  };
}
