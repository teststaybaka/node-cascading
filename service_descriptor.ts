import { InterfaceDescriptor } from './interface_descriptor';

export interface ServiceDescriptor<Request, Response> {
  name: string,
  pathname: string,
  requestDescriptor: InterfaceDescriptor<Request>,
  responseDescriptor: InterfaceDescriptor<Response>,
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}
