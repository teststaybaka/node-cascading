import { newUnauthenticatedError } from "../errors";
import { TEST_RUNNER } from "../test_base";
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

TEST_RUNNER.run({
  name: "SessionTest",
  cases: [
    {
      name: "InvalidRawSession",
      execute: async () => {
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
      },
    },
    {
      name: "InvalidSignature",
      execute: async () => {
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
      },
    },
    {
      name: "InvalidSessionJsonData",
      execute: async () => {
        // Prepare
        let mockSigner = new MockSigner();
        mockSigner.signature = "xxxx";
        let verifier = new SecureSessionVerifier(mockSigner as any);

        // Execute
        let error = assertThrow(() => verifier.verifyAndGetUserId("--|xxxx"));

        // Verify
        assertThat(
          error,
          eqError(newUnauthenticatedError("json data")),
          "error"
        );
      },
    },
    {
      name: "NoTimestampInSession",
      execute: async () => {
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
      },
    },
    {
      name: "NoUserIdInSession",
      execute: async () => {
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
      },
    },
    {
      name: "SessionExpired",
      execute: async () => {
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
      },
    },
    {
      name: "ExtractUserIdSuccess",
      execute: async () => {
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
      },
    },
    {
      name: "GenerateSessionSuccess",
      execute: async () => {
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
      },
    },
  ],
});
