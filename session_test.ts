import { newUnauthorizedError } from './errors';
import { SecureSessionGenerator, SecureSessionVerifier } from './session';
import { TestCase, assert, assertError, expectThrow, runTests } from './test_base';

class MockSigner {
  public signature: string = null;

  public getSignature(str: string) {
    return this.signature;
  }
}

class InvalidRawSession implements TestCase {
  public name = 'InvalidRawSession';

  public async execute() {
    // Prepare
    let verifier = new SecureSessionVerifier(null);

    // Execute
    let error = expectThrow(() => verifier.verifyAndGetUserId('f|s|aa'));

    // Verify
    assertError(error, newUnauthorizedError('Invalid signed session'));
  }
}

class InvalidSignature implements TestCase {
  public name = 'InvalidSignature';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = expectThrow(() => verifier.verifyAndGetUserId('f|s'));

    // Verify
    assertError(error, newUnauthorizedError('session signature'));
  }
}

class InvalidSessionJsonData implements TestCase {
  public name = 'InvalidSessionJsonData';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = expectThrow(() => verifier.verifyAndGetUserId('--|xxxx'));

    // Verify
    assertError(error, newUnauthorizedError('json data'));
  }
}

class NoTimestampInSession implements TestCase {
  public name = 'NoTimestampInSession';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = expectThrow(() => verifier.verifyAndGetUserId('{}|xxxx'));

    // Verify
    assertError(error, newUnauthorizedError('session data'));
  }
}

class NoUserIdInSession implements TestCase {
  public name = 'NoUserIdInSession';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = expectThrow(() => verifier.verifyAndGetUserId('{"timestamp":3131}|xxxx'));

    // Verify
    assertError(error, newUnauthorizedError('session data'));
  }
}

class SessionExpired implements TestCase {
  public name = 'SessionExpired';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let nowTime = Date.now() - 30*24*60*60*1000 - 1;
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let error = expectThrow(() => verifier.verifyAndGetUserId(`{"timestamp":${nowTime},"userId":"blabla"}|xxxx`));

    // Verify
    assertError(error, newUnauthorizedError('Session expired'));
  }
}

class ExtractUserIdSuccess implements TestCase {
  public name = 'ExtractUserIdSuccess';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let nowTime = Date.now();
    let userId = 'an id';
    let verifier = new SecureSessionVerifier(mockSigner as any);

    // Execute
    let extractedId = verifier.verifyAndGetUserId(`{"timestamp":${nowTime},"userId":"${userId}"}|xxxx`);

    // Verify
    assert(extractedId === userId);
  }
}

class GenerateSessionSuccess implements TestCase {
  public name = 'GenerateSessionSuccess';

  public async execute() {
    // Prepare
    let mockSigner = new MockSigner();
    mockSigner.signature = 'xxxx';
    let userId = 'id!!!!!!!!';
    let verifier = new SecureSessionVerifier(mockSigner as any);
    let generator = new SecureSessionGenerator(mockSigner as any);

    // Execute
    let session = generator.getSignedSession(userId);

    // Verify
    let extractedId = verifier.verifyAndGetUserId(session);
    assert(extractedId === userId)
  }
}

runTests('SessionTest', [
  new InvalidRawSession(),
  new InvalidSignature(),
  new InvalidSessionJsonData(),
  new NoTimestampInSession(),
  new NoUserIdInSession(),
  new SessionExpired(),
  new ExtractUserIdSuccess(),
  new GenerateSessionSuccess(),
]);
