import { LOGGER } from "./logger";
import { Command } from "commander";
import "source-map-support/register";

export interface TestCase {
  name: string;
  execute: () => void | Promise<void>;
}

export async function runTests(testSetName: string, testCases: TestCase[]) {
  let program = new Command();
  program.option(
    "-c, --child <which>",
    "The name of the test or its 0-based index."
  );
  program.parse();

  let child = program.child;
  if (child === undefined) {
    console.log("\n\x1b[35m%s test result:\x1b[0m", testSetName);
    for (let i = 0, len = testCases.length; i < len; i++) {
      let oldLog = console.log;
      let oldInfo = console.info;
      let oldWarn = console.warn;
      let oldErr = console.error;
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.error = () => {};
      LOGGER.switchToLocal();
      let statusMsg: string;
      try {
        await testCases[i].execute();
        if (Expectation.errors.length !== 0) {
          throw new Error("There are errors from expectations.");
        }
        statusMsg = `\x1b[32mTest(${i}), ${testCases[i].name}, success!\x1b[0m`;
      } catch (e) {
        statusMsg = `\x1b[31mTest(${i}), ${testCases[i].name}, failed!\x1b[0m`;
      }
      console.log = oldLog;
      console.info = oldInfo;
      console.warn = oldWarn;
      console.error = oldErr;
      console.log(statusMsg);
      Expectation.errors = [];
    }
  } else {
    let whichChild = parseInt(child);
    let testCaseToBeRun: TestCase;
    if (!Number.isNaN(whichChild)) {
      testCaseToBeRun = testCases[whichChild];
    } else {
      testCaseToBeRun = testCases.find((testCase): boolean => {
        return testCase.name === child;
      });
    }

    LOGGER.switchToLocal();
    try {
      await testCaseToBeRun.execute();
    } catch (e) {
      console.log(e);
    }
    for (let error of Expectation.errors) {
      console.log(error);
    }
  }
}

export function assert(tested: boolean, action?: string) {
  if (!tested) {
    if (action) {
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

  public static expect(result: boolean) {
    try {
      assert(result);
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
