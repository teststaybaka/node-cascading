import { NamedTypeDescriptor } from "./named_type_descriptor";

export interface ServiceDescriptor<Request, Response> {
  name: string;
  pathname: string;
  requestDescriptor: NamedTypeDescriptor<Request>;
  responseDescriptor: NamedTypeDescriptor<Response>;
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

