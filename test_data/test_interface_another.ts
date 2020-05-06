import { TestColor, TestObject } from './test_interface';

export interface TestImportedFieldObject {
  importedField1: TestObject,
  color: TestColor,
  color2: TestColor,
}

export interface TestNestedFieldObject {
  nestedFiled: TestImportedFieldObject,
}

