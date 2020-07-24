import {
  EnumDescriptorUntyped,
  MessageDescriptorUntyped,
  MessageFieldType,
} from "./message_descriptor";
import { MessageParser } from "./message_util";
import { TestCase, assert, runTests } from "./test_base";

function testParseEnum(input: string | number, expected: number) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptorUntyped = {
    name: "Color",
    enumValues: [
      {
        name: "RED",
        value: 10,
      },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };

  // Execute
  let parsed = MessageParser.parseEnumUntyped(input, colorEnumDescriptor);

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

function testParsingMessageWithPrimitiveTypes(raw: any) {
  // Prepare
  let userMessageDescriptor: MessageDescriptorUntyped = {
    name: "User",
    fields: [
      { name: "id", type: MessageFieldType.NUMBER },
      {
        name: "isPaid",
        type: MessageFieldType.BOOLEAN,
      },
      {
        name: "nickname",
        type: MessageFieldType.STRING,
      },
    ],
  };

  // Execute
  let parsed = MessageParser.parseMessageUntyped(raw, userMessageDescriptor);

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
    });

    // Verify
    assert(parsed.id === 12);
    assert(parsed.isPaid);
    assert(parsed.nickname === "jack");
  }
}

class ParseMessagePrimtivesOverlapping implements TestCase {
  public name = "ParseMessagePrimtivesOverlapping";

  public execute() {
    let parsed = testParsingMessageWithPrimitiveTypes({
      id: 12,
      isPaid: "true",
      random: "jack",
    });

    // Verify
    assert(parsed.id === 12);
    assert(parsed.isPaid === undefined);
    assert(parsed.nickname === undefined);
    assert(parsed.random === undefined);
  }
}

function testParsingNestedMessages(raw: any) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptorUntyped = {
    name: "Color",
    enumValues: [
      {
        name: "RED",
        value: 10,
      },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };
  let paymentInfoMessageDescriptor: MessageDescriptorUntyped = {
    name: "PaymentInfo",
    fields: [{ name: "added", type: MessageFieldType.BOOLEAN }],
  };
  let userInfoMessaeDescriptor: MessageDescriptorUntyped = {
    name: "UserInfo",
    fields: [
      {
        name: "intro",
        type: MessageFieldType.STRING,
      },
      {
        name: "backgroundColor",
        type: MessageFieldType.ENUM,
        enumDescriptor: colorEnumDescriptor,
      },
      {
        name: "paymentInfo",
        type: MessageFieldType.MESSAGE,
        messageDescriptor: paymentInfoMessageDescriptor,
      },
    ],
  };
  let userMessageDescriptor: MessageDescriptorUntyped = {
    name: "User",
    fields: [
      { name: "id", type: MessageFieldType.NUMBER },
      {
        name: "detailedInfo",
        type: MessageFieldType.MESSAGE,
        messageDescriptor: userInfoMessaeDescriptor,
      },
      {
        name: "preferColor",
        type: MessageFieldType.ENUM,
        enumDescriptor: colorEnumDescriptor,
      },
    ],
  };

  // Execute
  let parsed = MessageParser.parseMessageUntyped(raw, userMessageDescriptor);

  // Verify
  return parsed;
}

class ParseMessageNestedAllPopulated implements TestCase {
  public name = "ParseMessageNestedAllPopulated";

  public execute() {
    let parsed = testParsingNestedMessages({
      id: 29,
      detailedInfo: {
        intro: "student",
        paymentInfo: {
          added: true,
        },
        backgroundColor: "RED",
      },
      preferColor: "BLUE",
    });

    // Verify
    assert(parsed.id === 29);
    assert(parsed.detailedInfo.intro === "student");
    assert(parsed.detailedInfo.paymentInfo.added);
    assert(parsed.detailedInfo.backgroundColor === 10);
    assert(parsed.preferColor === 1);
  }
}

class ParseMessageNestedOverlapping implements TestCase {
  public name = "ParseMessageNestedOverlapping";

  public execute() {
    let parsed = testParsingNestedMessages({
      id: 29,
      detailedInfo: {
        intro: false,
        over: "overly",
        backgroundColor: "RED",
      },
      preferColor: 123,
    });

    // Verify
    assert(parsed.id === 29);
    assert(parsed.detailedInfo.intro === undefined);
    assert(parsed.detailedInfo.paymentInfo === undefined);
    assert(parsed.detailedInfo.over === undefined);
    assert(parsed.detailedInfo.backgroundColor === 10);
    assert(parsed.preferColor === undefined);
  }
}

runTests("MessageUtilTest", [
  new ParseEnumValueFromNumber(),
  new ParseEnumValueFromExceededNumber(),
  new ParseEnumValueFromString(),
  new ParseEnumValueFromNonexistingString(),
  new ParseMessagePrimtivesAllPopulated(),
  new ParseMessagePrimtivesOverlapping(),
  new ParseMessageNestedAllPopulated(),
  new ParseMessageNestedOverlapping(),
]);
