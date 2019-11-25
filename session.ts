import crypto = require('crypto');
import { newUnauthorizedError } from './errors';

let ALGORITHM = 'sha256';
let SECRET_KEY = 'sdoijfoieaojmfmfiqujroifzxco';
let SEED_MAX = 100000;
export let SESSION_SEPARATOR = '|';
export let SESSION_LONGEVITY = 30*24*60*60*1000;

export class Signer {
  public secretKey: string;

  public getSignature(str: string): string {
    let secretKey = this.secretKey;
    if (!secretKey) {
      secretKey = SECRET_KEY;
    }

    let signature = crypto.createHmac(ALGORITHM, SECRET_KEY)
      .update(str)
      .digest('hex');
    return signature;
  }
}

export class SecureSessionGenerator {
  public constructor(private signer: Signer) {}

  public getSignedSession(userId: string): string {
    let session = {
      userId: userId,
      seed: Math.round(Math.random()*SEED_MAX),
      timestamp: Date.now(),
    };
    let sessionStr = JSON.stringify(session);
    let signature = this.signer.getSignature(sessionStr);
    return [sessionStr, signature].join(SESSION_SEPARATOR);
  }
}

export class SecureSessionVerifier {
  public constructor(private signer: Signer) {}

  public verifyAndGetUserId(signedSession: string): string {
    let pieces = signedSession.split(SESSION_SEPARATOR);
    if (pieces.length !== 2) {
      throw newUnauthorizedError('Invalid signed session string.');
    }

    let sessionStr = pieces[0];
    let signature = pieces[1];
    let signatureExpected = this.signer.getSignature(sessionStr);
    if (signature !== signatureExpected) {
      throw newUnauthorizedError('Invalid session signature');
    }

    let session: any;
    try {
      session = JSON.parse(sessionStr);
    } catch (e) {
      throw newUnauthorizedError('Invalid json data.', e);
    }
    if (typeof session.timestamp !== 'number' || typeof session.userId !== 'string') {
      throw newUnauthorizedError('Invalid session data.');
    }
    if (Date.now() - session.timestamp > SESSION_LONGEVITY) {
      throw newUnauthorizedError('Session expired.');
    }
    return session.userId;
  }
}

export let SIGNER = new Signer();
export let SECURE_SESSION_GENERATOR = new SecureSessionGenerator(SIGNER);
export let SECURE_SESSION_VERIFIER = new SecureSessionVerifier(SIGNER);
