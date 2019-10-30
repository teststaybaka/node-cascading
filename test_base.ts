import process = require('process');
import { parseFlags } from './flag_parser';
import { LOGGER } from './logger';
import 'source-map-support/register';

let WHICH_CHILD = 'child';

export interface TestCase {
  name: string,
  execute: (() => void|Promise<void>),
}

export async function runTests(testSetName: string, testCases: TestCase[]) {
  let flags = parseFlags(process.argv);
  let child = flags.get(WHICH_CHILD);
  if (child === undefined) {
    console.log('\n\x1b[35m%s test result:\x1b[0m', testSetName);
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
    LOGGER.switchToLocal();
    try {
      await testCases[whichChild].execute();
    } catch (e) {
      console.log(e);
    }
  }
}

export function assert(result: boolean, errorMessage: string = 'Assert failed!') {
  if (!result) {
    throw new Error(errorMessage);
  }
}

export function assertContains(longStr: string, shortStr: string, errorMessage?: string) {
  assert(longStr.indexOf(shortStr) != -1, errorMessage);
}

export function assertError(actualError: any, expectedError: Error) {
  console.log(actualError);
  if (actualError instanceof Error) {
    assert(actualError.name === expectedError.name,
      'Expecting error type [' + expectedError.name + '] but got [' + actualError.name + '] instead.');
    assertContains(actualError.message, expectedError.message,
      'Expecting message [' + expectedError.message + '] but got [' + actualError.message + '] instead.');
  } else {
    throw new Error('Expecting error to be of type "Error" but got "' + (typeof actualError) + '" instead.');
  }
}

export async function expectRejection(promise: Promise<any>) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('Expecting the promise to be rejected but did not.');
}

export function expectThrow(method: () => void) {
  try {
    method();
  } catch (e) {
    return e;
  }
  throw new Error('Expecting an error to be thrown.');
}
