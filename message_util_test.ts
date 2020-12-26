import {
  EnumDescriptor,
  MessageDescriptor,
  PrimitiveType,
} from "./message_descriptor";
import { parseEnum, parseMessage } from "./message_util";
import { ObservableArray } from "./observable_array";
import { eqObservableArray } from "./observable_array_test_util";
import { TestCase, TestSet } from "./test_base";
import { MatchFn, assertThat, eq, eqArray } from "./test_matcher";

function testParseEnum(input: string | number, expected: number) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptor<any> = {
    name: "Color",
    values: [
      { name: "RED", value: 10 },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };

  // Execute
  let parsed = parseEnum(input, colorEnumDescriptor);

  // Verify
  assertThat(parsed, eq(expected), "parsed");
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
    fields: [
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

function eqUser(expected: any): MatchFn<any> {
  return (actual) => {
    assertThat(actual.id, eq(expected.id), "id field");
    assertThat(actual.isPaid, eq(expected.isPaid), "isPaid field");
    assertThat(actual.nickname, eq(expected.nickname), "nikcname field");
    assertThat(actual.email, eq(expected.email), "email field");
    let expectedIdHistory: Array<MatchFn<any>>;
    if (expected.idHistory !== undefined) {
      expectedIdHistory = expected.idHistory.map((value: any) => {
        return eq(value);
      });
    }
    assertThat(actual.idHistory, eqArray(expectedIdHistory), "idHistory field");
    let expectedIsPaidHistory: Array<MatchFn<any>>;
    if (expected.isPaidHistory !== undefined) {
      expectedIsPaidHistory = expected.isPaidHistory.map((value: any) => {
        return eq(value);
      });
    }
    assertThat(
      actual.isPaidHistory,
      eqArray(expectedIsPaidHistory),
      "isPaidHistory field"
    );
    let expectedNicknameHistory: Array<MatchFn<any>>;
    if (expected.nicknameHistory !== undefined) {
      expectedNicknameHistory = expected.nicknameHistory.map((value: any) => {
        return eq(value);
      });
    }
    assertThat(
      actual.nicknameHistory,
      eqArray(expectedNicknameHistory),
      "nicknameHistory field"
    );
    let expectedEmailHistory: Array<MatchFn<any>>;
    if (expected.emailHistory !== undefined) {
      expectedEmailHistory = expected.emailHistory.map((value: any) => {
        return eq(value);
      });
    }
    assertThat(
      actual.emailHistory,
      eqObservableArray(expectedEmailHistory),
      "emailHistory field"
    );
  };
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
    assertThat(
      parsed,
      eqUser({
        id: 12,
        isPaid: true,
        nickname: "jack",
        email: "test@gmail.com",
        idHistory: [11, 20, undefined, undefined, 855],
        isPaidHistory: [false, true, false, false],
        nicknameHistory: ["queen", "king", "ace"],
        emailHistory: ["test1@test.com", "123@ttt.com"],
      }),
      "parsed"
    );
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
    assertThat(
      parsed,
      eqUser({
        nickname: "jack",
        email: "test@gmail.com",
        idHistory: [11, 12],
        emailHistory: ["test1@test.com", "123@ttt.com"],
      }),
      "parsed"
    );
    assertThat(parsed, eq(original), "parsed reference");
    assertThat(parsed.idHistory, eq(original.idHistory), "idHistory reference");
    assertThat(
      parsed.emailHistory,
      eq(original.emailHistory),
      "emailHistory reference"
    );
  }
}

function testParsingNestedMessages(raw: any, output?: any) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptor<any> = {
    name: "Color",
    values: [
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
    fields: [
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
    fields: [{ name: "cardNumber", primitiveType: PrimitiveType.NUMBER }],
  };
  let userMessageDescriptor: MessageDescriptor<any> = {
    name: "User",
    factoryFn: () => {
      return new Object();
    },
    fields: [
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

function eqCreditCard(expected?: any): MatchFn<any> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
    } else {
      assertThat(
        actual.cardNumber,
        eq(expected.cardNumber),
        "cardNumber field"
      );
    }
  };
}

function eqNestedUser(expected: any): MatchFn<any> {
  return (actual) => {
    assertThat(actual.id, eq(expected.id), "id field");
    assertThat(
      actual.userInfo.intro,
      eq(expected.userInfo.intro),
      "userInfo.intro field"
    );
    assertThat(
      actual.userInfo.backgroundColor,
      eq(expected.userInfo.backgroundColor),
      "userInfo.backgroundColor field"
    );
    assertThat(
      actual.userInfo.preferredColor,
      eq(expected.userInfo.preferredColor),
      "userInfo.preferredColor field"
    );
    let expectedColorHistory: Array<MatchFn<any>>;
    if (expected.userInfo.colorHistory !== undefined) {
      expectedColorHistory = expected.userInfo.colorHistory.map(
        (value: any) => {
          return eq(value);
        }
      );
    }
    assertThat(
      actual.userInfo.colorHistory,
      eqArray(expectedColorHistory),
      "userInfo.colorHistory field"
    );
    let expectedCreditCards: Array<MatchFn<any>>;
    if (expected.creditCards !== undefined) {
      expectedCreditCards = expected.creditCards.map((value: any) => {
        return eqCreditCard(value);
      });
    }
    assertThat(
      actual.creditCards,
      eqObservableArray(expectedCreditCards),
      "creditCards field"
    );
  };
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
    assertThat(
      parsed,
      eqNestedUser({
        id: 25,
        userInfo: {
          intro: "student",
          backgroundColor: 10,
          preferredColor: 1,
          colorHistory: [undefined, 1, 2, 10],
        },
        creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
      }),
      "parsed"
    );
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
    assertThat(
      parsed,
      eqNestedUser({
        userInfo: {
          backgroundColor: 10,
          preferredColor: 1,
          colorHistory: [1, 2],
        },
        creditCards: [
          { cardNumber: 2020 },
          { cardNumber: 4040 },
          { cardNumber: 5050 },
        ],
      }),
      "parsed"
    );
    assertThat(parsed, eq(original), "parsed reference");
    assertThat(
      parsed.userInfo,
      eq(original.userInfo),
      "parsed.userInfo reference"
    );
    assertThat(
      parsed.userInfo.colorHistory,
      eq(original.userInfo.colorHistory),
      "parsed.userInfo.colorHistory reference"
    );
    assertThat(
      parsed.creditCards,
      eq(original.creditCards),
      "parsed.creditCards reference"
    );
    assertThat(
      parsed.creditCards.get(0),
      eq(original.creditCards.get(0)),
      "parsed.creditCards.get(0) reference"
    );
    assertThat(
      parsed.creditCards.get(1),
      eq(original.creditCards.get(1)),
      "parsed.creditCards.get(0) reference"
    );
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
