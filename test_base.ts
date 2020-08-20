export interface TestCase {
  name: string;
  execute: () => void | Promise<void>;
}

export interface Environment {
  setUp: () => void | Promise<void>;
  tearDown: () => void | Promise<void>;
}

export interface TestSet {
  name: string;
  cases: TestCase[];
  environment?: Environment;
}

export function assert(tested: boolean, action?: string) {
  if (!tested) {
    if (!action) {
      throw new Error("Assertion failed.");
    } else {
      throw new Error(`Failed to assert ${action}.`);
    }
  }
}

export function assertContains(longStr: string, shortStr: string) {
  assert(longStr.indexOf(shortStr) != -1, `${longStr} containing ${shortStr}`);
}

export function assertError(actualError: any, expectedError: Error) {
  if (actualError instanceof Error) {
    assert(
      actualError.name === expectedError.name,
      `error to be ${expectedError.name} but got ${actualError.name}`
    );
    assertContains(actualError.message, expectedError.message);
  } else {
    throw new Error(
      `error to be of type "Error" but got "${typeof actualError} instead.`
    );
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

export class Expectation {
  public static errors: Error[] = [];

  public static expect(tested: boolean, action?: string) {
    try {
      assert(tested, action);
    } catch (e) {
      Expectation.errors.push(e as Error);
    }
  }

  public static expectContains(longStr: string, shortStr: string) {
    try {
      assertContains(longStr, shortStr);
    } catch (e) {
      Expectation.errors.push(e as Error);
    }
  }

  public static expectError(actualError: any, expectedError: Error) {
    try {
      assertError(actualError, expectedError);
    } catch (e) {
      Expectation.errors.push(e as Error);
    }
  }
}
