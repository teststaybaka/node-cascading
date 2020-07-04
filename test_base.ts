import { LOGGER } from "./logger";
import { Command } from "commander";
import "source-map-support/register";

export interface TestEnvironment {
  destroy(): void;
}

export interface TestCase {
  name: string;
  execute: () => void | Promise<void>;
}

export async function runTests(
  testSetName: string,
  testCases: TestCase[],
  testEnvironment?: TestEnvironment
) {
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
        statusMsg = `\x1b[32mTest(${i}), ${testCases[i].name}, success!\x1b[0m`;
      } catch (e) {
        statusMsg = `\x1b[31mTest(${i}),  ${testCases[i].name}, failed!\x1b[0m`;
      }
      console.log = oldLog;
      console.info = oldInfo;
      console.warn = oldWarn;
      console.error = oldErr;
      console.log(statusMsg);
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
  }
  if (testEnvironment) {
    testEnvironment.destroy();
  }
}

export function assert(
  result: boolean,
  errorMessage: string = "Assert failed!"
) {
  if (!result) {
    throw new Error(errorMessage);
  }
}

export function assertContains(
  longStr: string,
  shortStr: string,
  errorMessage?: string
) {
  assert(longStr.indexOf(shortStr) != -1, errorMessage);
}

export function assertError(actualError: any, expectedError: Error) {
  if (actualError instanceof Error) {
    assert(
      actualError.name === expectedError.name,
      "Expecting error type [" +
        expectedError.name +
        "] but got [" +
        actualError.name +
        "] instead."
    );
    assertContains(
      actualError.message,
      expectedError.message,
      "Expecting message [" +
        expectedError.message +
        "] but got [" +
        actualError.message +
        "] instead."
    );
  } else {
    throw new Error(
      'Expecting error to be of type "Error" but got "' +
        typeof actualError +
        '" instead.'
    );
  }
}

export async function expectRejection(promise: Promise<any>) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error("Expecting the promise to be rejected but did not.");
}

export function expectThrow(method: () => void) {
  try {
    method();
  } catch (e) {
    return e;
  }
  throw new Error("Expecting an error to be thrown.");
}
