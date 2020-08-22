import crypto = require("crypto");
import { newUnauthenticatedError } from "../errors";

let SESSION_SEPARATOR = "|";

export class Signer {
  public static SECRET_KEY = "sdoijfoieaojmfmfiqujroifzxco";
  private static ALGORITHM = "sha256";

  public sign(str: string): string {
    let signature = crypto
      .createHmac(Signer.ALGORITHM, Signer.SECRET_KEY)
      .update(str)
      .digest("hex");
    return signature;
  }
}

export class SecureSessionGenerator {
  private static SEED_MAX = 100000;

  public static create(): SecureSessionGenerator {
    return new SecureSessionGenerator(new Signer());
  }

  public constructor(private signer: Signer) {}

  public generate(userId: string): string {
    let session = {
      userId: userId,
      seed: Math.round(Math.random() * SecureSessionGenerator.SEED_MAX),
      timestamp: Date.now(),
    };
    let sessionStr = JSON.stringify(session);
    let signature = this.signer.sign(sessionStr);
    return [sessionStr, signature].join(SESSION_SEPARATOR);
  }
}

export class SecureSessionVerifier {
  private static SESSION_LONGEVITY = 30 * 24 * 60 * 60 * 1000;

  public static create(): SecureSessionVerifier {
    return new SecureSessionVerifier(new Signer());
  }

  public constructor(private signer: Signer) {}

  public verifyAndGetUserId(signedSession: string): string {
    let pieces = signedSession.split(SESSION_SEPARATOR);
    if (pieces.length !== 2) {
      throw newUnauthenticatedError("Invalid signed session string.");
    }

    let sessionStr = pieces[0];
    let signature = pieces[1];
    let signatureExpected = this.signer.sign(sessionStr);
    if (signature !== signatureExpected) {
      throw newUnauthenticatedError("Invalid session signature");
    }

    let session: any;
    try {
      session = JSON.parse(sessionStr);
    } catch (e) {
      throw newUnauthenticatedError("Invalid json data.", e);
    }
    if (
      typeof session.timestamp !== "number" ||
      typeof session.userId !== "string"
    ) {
      throw newUnauthenticatedError("Invalid session data.");
    }
    if (
      Date.now() - session.timestamp >
      SecureSessionVerifier.SESSION_LONGEVITY
    ) {
      throw newUnauthenticatedError("Session expired.");
    }
    return session.userId;
  }
}
