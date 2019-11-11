export enum ErrorType {
  Internal = 500,
  Unauthorized = 401,
}

export class TypedError extends Error {
  constructor(public errorType: ErrorType, message: string, err?: any) {
    super(message);
    if (err && err.message) {
      this.message = `${message} ${err.message}`;
      if (err.stack) {
        this.stack = `Error: ${message}\n${err.stack}`;
      }
    }
  }
}

export function newInternalError(message: string, err?: any): TypeError {
  return new TypedError(ErrorType.Internal, message, err);
}

export function newUnauthorizedError(message: string, err?: any): TypeError {
  return new TypedError(ErrorType.Unauthorized, message, err);
}
