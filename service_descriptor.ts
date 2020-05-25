import { MessageUtil } from "./message_util";

export interface ServiceDescriptor<Request, Response> {
  name: string;
  pathname: string;
  requestParser: MessageUtil<Request>;
  responseParser: MessageUtil<Response>;
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

