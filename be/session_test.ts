import { newUnauthenticatedError } from "../errors";
import { TestCase, TestSet } from "../test_base";
import { assertThat, assertThrow, eq, eqError } from "../test_matcher";
import {
  SecureSessionGenerator,
  SecureSessionVerifier,
  Signer,
} from "./session";

class MockSigner extends Signer {
  public signature: string = null;

  public sign(str: string) {
    return this.signature;
  }
}

class InvalidRawSession implements TestCase {
  public name = "InvalidRawSession";

  public async execute() {
    // Prepare
    let verifier = new SecureSessionVerifier(null);

    // Execute
    let error = assertThrow(() => verifier.verifyAndGetUserId("f|s|aa"));

    // Verify
    assertThat(
      error,
      eqError(newUnauthenticatedError("Invalid signed session")),
      "error"
    );
  }
}

class InvalidSignature implements TestCase {
  public name = "InvalidSignature";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = assertThrow(() => verifier.verifyAndGetUserId("f|s"));

    // Verify
    assertThat(
      error,
      eqError(newUnauthenticatedError("session signature")),
      "error"
    );
  }
}

class InvalidSessionJsonData implements TestCase {
  public name = "InvalidSessionJsonData";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = assertThrow(() => verifier.verifyAndGetUserId("--|xxxx"));

    // Verify
    assertThat(error, eqError(newUnauthenticatedError("json data")), "error");
  }
}

class NoTimestampInSession implements TestCase {
  public name = "NoTimestampInSession";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = assertThrow(() => verifier.verifyAndGetUserId("{}|xxxx"));

    // Verify
    assertThat(
      error,
      eqError(newUnauthenticatedError("session data")),
      "error"
    );
  }
}

class NoUserIdInSession implements TestCase {
  public name = "NoUserIdInSession";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = assertThrow(() =>
      verifier.verifyAndGetUserId('{"timestamp":3131}|xxxx')
    );

    // Verify
    assertThat(
      error,
      eqError(newUnauthenticatedError("session data")),
      "error"
    );
  }
}

class SessionExpired implements TestCase {
  public name = "SessionExpired";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let nowTime = Date.now() - 30 * 24 * 60 * 60 * 1000 - 1;
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = assertThrow(() =>
      verifier.verifyAndGetUserId(
        `{"timestamp":${nowTime},"userId":"blabla"}|xxxx`
      )
    );

    // Verify
    assertThat(
      error,
      eqError(newUnauthenticatedError("Session expired")),
      "error"
    );
  }
}

class ExtractUserIdSuccess implements TestCase {
  public name = "ExtractUserIdSuccess";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let nowTime = Date.now();
    let userId = "an id";
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let extractedId = verifier.verifyAndGetUserId(
      `{"timestamp":${nowTime},"userId":"${userId}"}|xxxx`
    );

    // Verify
    assertThat(extractedId, eq(userId), "extractedId");
  }
}

class GenerateSessionSuccess implements TestCase {
  public name = "GenerateSessionSuccess";

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = "xxxx";
    let userId = "id!!!!!!!!";
    let verifier = new SecureSessionVerifier(mockSigner as any);
    let generator = new SecureSessionGenerator(mockSigner as any);

    // Execute
    let session = generator.generate(userId);

    // Verify
    let extractedId = verifier.verifyAndGetUserId(session);
    assertThat(extractedId, eq(userId), "extractedId");
  }
}

export let SESSION_TEST: TestSet = {
  name: "SessionTest",
  cases: [
    new InvalidRawSession(),
    new InvalidSignature(),
    new InvalidSessionJsonData(),
    new NoTimestampInSession(),
    new NoUserIdInSession(),
    new SessionExpired(),
    new ExtractUserIdSuccess(),
    new GenerateSessionSuccess(),
  ],
};
