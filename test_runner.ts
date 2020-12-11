import { Expectation, TestSet } from "./test_base";
import { Command } from "commander";
import "source-map-support/register";

export async function runTests(testSets: TestSet[]) {
  let program = new Command();
  program.option("-s, --set-name <name>", "The name of the test set.");
  program.option(
    "-c, --case-name <name>",
    "The name of the test case within a test set."
  );
  program.parse();

  if (!program.setName) {
    for (let testSet of testSets) {
      await runTestSet(testSet);
    }
  } else if (!program.caseName) {
    let testSet = testSets.find((testSet): boolean => {
      return program.setName === testSet.name;
    });
    await runTestSet(testSet);
  } else {
    let testSet = testSets.find((testSet): boolean => {
      return program.setName === testSet.name;
    });
    let testCase = testSet.cases.find((testCase): boolean => {
      return program.caseName === testCase.name;
    });

    try {
      await testCase.execute();
    } catch (e) {
      console.log(e);
    }
    for (let error of Expectation.errors) {
      console.log(error);
    }
  }
}

async function runTestSet(testSet: TestSet): Promise<void> {
  console.log("\n\x1b[35m%s test result:\x1b[0m", testSet.name);
  if (testSet.environment) {
    await testSet.environment.setUp();
  }
  for (let testCase of testSet.cases) {
    let oldLog = console.log;
    let oldInfo = console.info;
    let oldWarn = console.warn;
    let oldErr = console.error;
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    let statusMsg: string;
    try {
      await testCase.execute();
      if (Expectation.errors.length !== 0) {
        throw new Error("There are errors from expectations.");
      }
      statusMsg = `\x1b[32m${testCase.name} success!\x1b[0m`;
    } catch (e) {
      statusMsg = `\x1b[31m${testCase.name} failed!\x1b[0m`;
    }
    console.log = oldLog;
    console.info = oldInfo;
    console.warn = oldWarn;
    console.error = oldErr;
    console.log(statusMsg);
    Expectation.errors = [];
  }
  if (testSet.environment) {
    await testSet.environment.tearDown();
  }
}
