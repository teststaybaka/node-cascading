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
