import {
  EnumDescriptor,
  MessageDescriptor,
  PrimitiveType,
} from "./message_descriptor";
import { parseEnum, parseMessage } from "./message_util";
import { ObservableArray } from "./observable_array";
import { TestCase, TestSet, assert } from "./test_base";

function testParseEnum(input: string | number, expected: number) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptor<any> = {
    name: "Color",
    enumValues: [
      { name: "RED", value: 10 },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };

  // Execute
  let parsed = parseEnum(input, colorEnumDescriptor);

  // Verify
  assert(parsed === expected);
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

function testParsingMessageWithPrimitiveTypes(raw: any, output?: any) {
  // Prepare
  let userMessageDescriptor: MessageDescriptor<any> = {
    name: "User",
    factoryFn: () => {
      return new Object();
    },
    messageFields: [
      { name: "id", primitiveType: PrimitiveType.NUMBER },
      { name: "isPaid", primitiveType: PrimitiveType.BOOLEAN },
      { name: "nickname", primitiveType: PrimitiveType.STRING },
      { name: "email", primitiveType: PrimitiveType.STRING },
      {
        name: "idHistory",
        primitiveType: PrimitiveType.NUMBER,
        arrayFactoryFn: () => {
          return new Array<any>();
        },
      },
      {
        name: "isPaidHistory",
        primitiveType: PrimitiveType.BOOLEAN,
        arrayFactoryFn: () => {
          return new Array<any>();
        },
      },
      {
        name: "nicknameHistory",
        primitiveType: PrimitiveType.STRING,
        arrayFactoryFn: () => {
          return new Array<any>();
        },
      },
      {
        name: "emailHistory",
        primitiveType: PrimitiveType.STRING,
        observableArrayFactoryFn: () => {
          return new ObservableArray<any>();
        },
      },
    ],
  };

  // Execute
  let parsed = parseMessage(raw, userMessageDescriptor, output);

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
      idHistory: [11, 20, "20", {}, 855],
      isPaidHistory: [false, true, false, false],
      nicknameHistory: ["queen", "king", "ace"],
      emailHistory: ["test1@test.com", "123@ttt.com"],
    });

    // Verify
    assert(parsed.id === 12);
    assert(parsed.isPaid === true);
    assert(parsed.nickname === "jack");
    assert(parsed.email === "test@gmail.com");
    assert(parsed.idHistory.length === 5);
    assert(parsed.idHistory[0] === 11);
    assert(parsed.idHistory[1] === 20);
    assert(parsed.idHistory[2] === undefined);
    assert(parsed.idHistory[3] === undefined);
    assert(parsed.idHistory[4] === 855);
    assert(parsed.isPaidHistory.length === 4);
    assert(parsed.isPaidHistory[0] === false);
    assert(parsed.isPaidHistory[1] === true);
    assert(parsed.isPaidHistory[2] === false);
    assert(parsed.isPaidHistory[3] === false);
    assert(parsed.nicknameHistory.length === 3);
    assert(parsed.nicknameHistory[0] === "queen");
    assert(parsed.nicknameHistory[1] === "king");
    assert(parsed.nicknameHistory[2] === "ace");
    assert(parsed.emailHistory.length === 2);
    assert(parsed.emailHistory.get(0) === "test1@test.com");
    assert(parsed.emailHistory.get(1) === "123@ttt.com");
  }
}

class ParseMessagePrimtivesOverride implements TestCase {
  public name = "ParseMessagePrimtivesOverride";

  public execute() {
    let emailHistory = new ObservableArray<string>();
    emailHistory.push(undefined, "test1@test.com", "123@ttt.com");
    let original: any = {
      id: 12,
      email: "0@grmail.com",
      idHistory: [11, undefined, 20],
      isPaidHistory: [false, true, false, false],
      emailHistory: emailHistory,
    };
    let parsed = testParsingMessageWithPrimitiveTypes(
      {
        nickname: "jack",
        email: "test@gmail.com",
        idHistory: [11, 12],
        emailHistory: ["test1@test.com", "123@ttt.com"],
      },
      original
    );

    // Verify
    assert(parsed === original);
    assert(parsed.id === undefined);
    assert(parsed.nickname === "jack");
    assert(parsed.email === "test@gmail.com");
    assert(parsed.idHistory === original.idHistory);
    assert(parsed.idHistory.length === 2);
    assert(parsed.idHistory[0] === 11);
    assert(parsed.idHistory[1] === 12);
    assert(parsed.isPaidHistory === undefined);
    assert(parsed.emailHistory === original.emailHistory);
    assert(parsed.emailHistory.length === 2);
    assert(parsed.emailHistory.get(0) === "test1@test.com");
    assert(parsed.emailHistory.get(1) === "123@ttt.com");
  }
}

function testParsingNestedMessages(raw: any, output?: any) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptor<any> = {
    name: "Color",
    enumValues: [
      { name: "RED", value: 10 },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };
  let userInfoMessaeDescriptor: MessageDescriptor<any> = {
    name: "UserInfo",
    factoryFn: () => {
      return new Object();
    },
    messageFields: [
      {
        name: "intro",
        primitiveType: PrimitiveType.STRING,
      },
      {
        name: "backgroundColor",
        enumDescriptor: colorEnumDescriptor,
      },
      {
        name: "preferredColor",
        enumDescriptor: colorEnumDescriptor,
      },
      {
        name: "colorHistory",
        enumDescriptor: colorEnumDescriptor,
        arrayFactoryFn: () => {
          return new Array<any>();
        },
      },
    ],
  };
  let creditCardMessageDescriptor: MessageDescriptor<any> = {
    name: "CreditCard",
    factoryFn: () => {
      return new Object();
    },
    messageFields: [
      { name: "cardNumber", primitiveType: PrimitiveType.NUMBER },
    ],
  };
  let userMessageDescriptor: MessageDescriptor<any> = {
    name: "User",
    factoryFn: () => {
      return new Object();
    },
    messageFields: [
      { name: "id", primitiveType: PrimitiveType.NUMBER },
      {
        name: "userInfo",
        messageDescriptor: userInfoMessaeDescriptor,
      },
      {
        name: "creditCards",
        messageDescriptor: creditCardMessageDescriptor,
        observableArrayFactoryFn: () => {
          return new ObservableArray<any>();
        },
      },
    ],
  };

  // Execute
  let parsed = parseMessage(raw, userMessageDescriptor, output);

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
        colorHistory: [true, "BLUE", "GREEN", 10],
      },
      creditCards: [{ cardNumber: "1010" }, 2020, {}, { cardNumber: 3030 }],
    });

    // Verify
    assert(parsed.id === 25);
    assert(parsed.userInfo.intro === "student");
    assert(parsed.userInfo.backgroundColor === 10);
    assert(parsed.userInfo.preferredColor === 1);
    assert(parsed.userInfo.colorHistory.length === 4);
    assert(parsed.userInfo.colorHistory[0] === undefined);
    assert(parsed.userInfo.colorHistory[1] === 1);
    assert(parsed.userInfo.colorHistory[2] === 2);
    assert(parsed.userInfo.colorHistory[3] === 10);
    assert(parsed.creditCards.length === 4);
    assert(parsed.creditCards.get(0).cardNumber === undefined);
    assert(parsed.creditCards.get(1) === undefined);
    assert(parsed.creditCards.get(2).cardNumber === undefined);
    assert(parsed.creditCards.get(3).cardNumber === 3030);
  }
}

class ParseMessageNestedOverride implements TestCase {
  public name = "ParseMessageNestedOverride";

  public execute() {
    let creditCards = new ObservableArray<any>();
    creditCards.push({ cardNumber: 1010 }, { cardNumber: 3030 });
    let original: any = {
      userInfo: {
        backgroundColor: "BLUE",
        colorHistory: ["BLUE"],
      },
      creditCards: creditCards,
    };
    let parsed = testParsingNestedMessages(
      {
        userInfo: {
          backgroundColor: "RED",
          preferredColor: 1,
          colorHistory: ["BLUE", "GREEN"],
        },
        creditCards: [
          { cardNumber: 2020 },
          { cardNumber: 4040 },
          { cardNumber: 5050 },
        ],
      },
      original
    );

    // Verify
    assert(parsed === original);
    assert(parsed.userInfo === original.userInfo);
    assert(parsed.userInfo.backgroundColor === 10);
    assert(parsed.userInfo.preferredColor === 1);
    assert(parsed.userInfo.colorHistory === original.userInfo.colorHistory);
    assert(parsed.userInfo.colorHistory.length === 2);
    assert(parsed.userInfo.colorHistory[0] === 1);
    assert(parsed.userInfo.colorHistory[1] === 2);
    assert(parsed.creditCards === original.creditCards);
    assert(parsed.creditCards.length === 3);
    assert(parsed.creditCards.get(0) === original.creditCards.get(0));
    assert(parsed.creditCards.get(0).cardNumber === 2020);
    assert(parsed.creditCards.get(1) === original.creditCards.get(1));
    assert(parsed.creditCards.get(1).cardNumber === 4040);
    assert(parsed.creditCards.get(2).cardNumber === 5050);
  }
}

export let MESSAGE_UTIL_TEST: TestSet = {
  name: "MessageUtilTest",
  cases: [
    new ParseEnumValueFromNumber(),
    new ParseEnumValueFromExceededNumber(),
    new ParseEnumValueFromString(),
    new ParseEnumValueFromNonexistingString(),
    new ParseMessagePrimtivesAllPopulated(),
    new ParseMessagePrimtivesOverride(),
    new ParseMessageNestedAllPopulated(),
    new ParseMessageNestedOverride(),
  ],
};
