import {
  MessageFieldType,
  NamedTypeDescriptorUntyped,
  NamedTypeKind,
} from "./named_type_descriptor";
import { parseNamedTypeUntyped } from "./named_type_util";
import { Expectation, TestCase, TestSet, assert } from "./test_base";

function testParseEnum(input: string | number, expected: number) {
  // Prepare
  let colorEnumDescriptor: NamedTypeDescriptorUntyped = {
    name: "Color",
    kind: NamedTypeKind.ENUM,
    enumValues: [
      { name: "RED", value: 10 },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };

  // Execute
  let parsed = parseNamedTypeUntyped(input, colorEnumDescriptor);

  // Verify
  Expectation.expect(parsed === expected);
}

class ParseEnumValueFromNumber implements TestCase {
  public name = "ParseEnumValueFromNumber";

  public execute() {
    testParseEnum(10, 10);
  }
}

class ParseEnumValueFromExceededNumber implements TestCase {
  public name = "ParseEnumValueFromExceededNumber";

  public execute() {
    testParseEnum(12, undefined);
  }
}

class ParseEnumValueFromString implements TestCase {
  public name = "ParseEnumValueFromString";

  public execute() {
    testParseEnum("GREEN", 2);
  }
}

class ParseEnumValueFromNonexistingString implements TestCase {
  public name = "ParseEnumValueFromNonexistingString";

  public execute() {
    testParseEnum("BLACK", undefined);
  }
}

function testParsingMessageWithPrimitiveTypes(raw: any) {
  // Prepare
  let userMessageDescriptor: NamedTypeDescriptorUntyped = {
    name: "User",
    kind: NamedTypeKind.MESSAGE,
    messageFields: [
      { name: "id", type: MessageFieldType.NUMBER },
      { name: "isPaid", type: MessageFieldType.BOOLEAN },
      { name: "nickname", type: MessageFieldType.STRING },
      { name: "email", type: MessageFieldType.STRING },
      { name: "idHistory", type: MessageFieldType.NUMBER, isArray: true },
      { name: "isPaidHistory", type: MessageFieldType.BOOLEAN, isArray: true },
      { name: "nicknameHistory", type: MessageFieldType.STRING, isArray: true },
      { name: "emailHistory", type: MessageFieldType.STRING, isArray: true },
    ],
  };

  // Execute
  let parsed = parseNamedTypeUntyped(raw, userMessageDescriptor);

  // Verify
  return parsed;
}

class ParseMessagePrimtivesAllPopulated implements TestCase {
  public name = "ParseMessagePrimtivesAllPopulated";

  public execute() {
    let parsed = testParsingMessageWithPrimitiveTypes({
      id: 12,
      isPaid: true,
      nickname: "jack",
      email: "test@gmail.com",
      idHistory: [11, 20, 855],
      isPaidHistory: [false, true, false, false],
      nicknameHistory: ["queen", "king", "ace"],
      emailHistory: ["test1@test.com", "123@ttt.com"],
    });

    // Verify
    Expectation.expect(parsed.id === 12);
    Expectation.expect(parsed.isPaid === true);
    Expectation.expect(parsed.nickname === "jack");
    Expectation.expect(parsed.email === "test@gmail.com");
    assert(parsed.idHistory.length === 3);
    Expectation.expect(parsed.idHistory[0] === 11);
    Expectation.expect(parsed.idHistory[1] === 20);
    Expectation.expect(parsed.idHistory[2] === 855);
    assert(parsed.isPaidHistory.length === 4);
    Expectation.expect(parsed.isPaidHistory[0] === false);
    Expectation.expect(parsed.isPaidHistory[1] === true);
    Expectation.expect(parsed.isPaidHistory[2] === false);
    Expectation.expect(parsed.isPaidHistory[3] === false);
    assert(parsed.nicknameHistory.length === 3);
    Expectation.expect(parsed.nicknameHistory[0] === "queen");
    Expectation.expect(parsed.nicknameHistory[1] === "king");
    Expectation.expect(parsed.nicknameHistory[2] === "ace");
    assert(parsed.emailHistory.length === 2);
    Expectation.expect(parsed.emailHistory[0] === "test1@test.com");
    Expectation.expect(parsed.emailHistory[1] === "123@ttt.com");
  }
}

class ParseMessagePrimtivesSkipUnmatched implements TestCase {
  public name = "ParseMessagePrimtivesSkipUnmatched";

  public execute() {
    let parsed = testParsingMessageWithPrimitiveTypes({
      id: "12",
      isPaid: "true",
      email: "test@gmail.com",
      random: "jack",
      idHistory: [11, "20", {}],
      nicknameHistory: [],
      emailHistory: ["test1@test.com", "123@ttt.com"],
    });

    // Verify
    Expectation.expect(parsed.id === undefined);
    Expectation.expect(parsed.isPaid === undefined);
    Expectation.expect(parsed.nickname === undefined);
    Expectation.expect(parsed.email === "test@gmail.com");
    Expectation.expect(parsed.random === undefined);
    assert(parsed.idHistory.length === 1);
    Expectation.expect(parsed.idHistory[0] === 11);
    Expectation.expect(parsed.isPaidHistory.length === 0);
    Expectation.expect(parsed.nicknameHistory.length === 0);
    assert(parsed.emailHistory.length === 2);
    Expectation.expect(parsed.emailHistory[0] === "test1@test.com");
    Expectation.expect(parsed.emailHistory[1] === "123@ttt.com");
  }
}

function testParsingNestedMessages(raw: any) {
  // Prepare
  let colorEnumDescriptor: NamedTypeDescriptorUntyped = {
    name: "Color",
    kind: NamedTypeKind.ENUM,
    enumValues: [
      { name: "RED", value: 10 },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };
  let userInfoMessaeDescriptor: NamedTypeDescriptorUntyped = {
    name: "UserInfo",
    kind: NamedTypeKind.MESSAGE,
    messageFields: [
      {
        name: "intro",
        type: MessageFieldType.STRING,
      },
      {
        name: "backgroundColor",
        type: MessageFieldType.NAMED_TYPE,
        namedTypeDescriptor: colorEnumDescriptor,
      },
      {
        name: "preferredColor",
        type: MessageFieldType.NAMED_TYPE,
        namedTypeDescriptor: colorEnumDescriptor,
      },
      {
        name: "colorHistory",
        type: MessageFieldType.NAMED_TYPE,
        namedTypeDescriptor: colorEnumDescriptor,
        isArray: true,
      },
    ],
  };
  let creditCardMessageDescriptor: NamedTypeDescriptorUntyped = {
    name: "CreditCard",
    kind: NamedTypeKind.MESSAGE,
    messageFields: [{ name: "cardNumber", type: MessageFieldType.NUMBER }],
  };
  let userMessageDescriptor: NamedTypeDescriptorUntyped = {
    name: "User",
    kind: NamedTypeKind.MESSAGE,
    messageFields: [
      { name: "id", type: MessageFieldType.NUMBER },
      {
        name: "userInfo",
        type: MessageFieldType.NAMED_TYPE,
        namedTypeDescriptor: userInfoMessaeDescriptor,
      },
      {
        name: "creditCards",
        type: MessageFieldType.NAMED_TYPE,
        namedTypeDescriptor: creditCardMessageDescriptor,
        isArray: true,
      },
    ],
  };

  // Execute
  let parsed = parseNamedTypeUntyped(raw, userMessageDescriptor);

  // Verify
  return parsed;
}

class ParseMessageNestedAllPopulated implements TestCase {
  public name = "ParseMessageNestedAllPopulated";

  public execute() {
    let parsed = testParsingNestedMessages({
      id: 25,
      userInfo: {
        intro: "student",
        backgroundColor: "RED",
        preferredColor: 1,
        colorHistory: ["BLUE", "GREEN", 10],
      },
      creditCards: [{ cardNumber: 1010 }, { cardNumber: 2020 }],
    });

    // Verify
    Expectation.expect(parsed.id === 25);
    Expectation.expect(parsed.userInfo.intro === "student");
    Expectation.expect(parsed.userInfo.backgroundColor === 10);
    Expectation.expect(parsed.userInfo.preferredColor === 1);
    assert(parsed.userInfo.colorHistory.length === 3);
    Expectation.expect(parsed.userInfo.colorHistory[0] === 1);
    Expectation.expect(parsed.userInfo.colorHistory[1] === 2);
    Expectation.expect(parsed.userInfo.colorHistory[2] === 10);
    assert(parsed.creditCards.length === 2);
    Expectation.expect(parsed.creditCards[0].cardNumber === 1010);
    Expectation.expect(parsed.creditCards[1].cardNumber === 2020);
  }
}

class ParseMessageNestedSkipUnmatched implements TestCase {
  public name = "ParseMessageNestedSkipUnmatched";

  public execute() {
    let parsed = testParsingNestedMessages({
      id: 25,
      userInfo: {
        intro: "student",
        backgroundColor: false,
        preferredColor: 1,
        colorHistory: [true, "BLUE"],
      },
      creditCards: [{ cardNumber: "1010" }, 2020, {}, { cardNumber: 3030 }],
    });

    // Verify
    Expectation.expect(parsed.id === 25);
    Expectation.expect(parsed.userInfo.intro === "student");
    Expectation.expect(parsed.userInfo.backgroundColor === undefined);
    Expectation.expect(parsed.userInfo.preferredColor === 1);
    assert(parsed.userInfo.colorHistory.length === 1);
    Expectation.expect(parsed.userInfo.colorHistory[0] === 1);
    assert(parsed.creditCards.length === 3);
    Expectation.expect(parsed.creditCards[0].cardNumber === undefined);
    Expectation.expect(parsed.creditCards[1].cardNumber === undefined);
    Expectation.expect(parsed.creditCards[2].cardNumber === 3030);
  }
}

export let NAMED_TYPE_UTIL_TEST: TestSet = {
  name: "NamedTypeUilTest",
  cases: [
    new ParseEnumValueFromNumber(),
    new ParseEnumValueFromExceededNumber(),
    new ParseEnumValueFromString(),
    new ParseEnumValueFromNonexistingString(),
    new ParseMessagePrimtivesAllPopulated(),
    new ParseMessagePrimtivesSkipUnmatched(),
    new ParseMessageNestedAllPopulated(),
    new ParseMessageNestedSkipUnmatched(),
  ],
};
