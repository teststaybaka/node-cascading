import { MessageDescriptor } from "./message_descriptor";

export interface ServiceDescriptor<Request, Response> {
  name: string;
  pathname: string;
  requestDescriptor: MessageDescriptor<Request>;
  responseDescriptor: MessageDescriptor<Response>;
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}
