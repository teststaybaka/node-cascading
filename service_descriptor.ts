import { MessageParser } from "./message_parser";

export interface ServiceDescriptor<Request, Response> {
  name: string;
  pathname: string;
  requestParser: MessageParser<Request>;
  responseParser: MessageParser<Response>;
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

