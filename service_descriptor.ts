import { MessageSerializer } from './message_serializer';

export interface ServiceDescriptor<Request, Response> {
  name: string,
  pathname: string,
  requestSerializer: MessageSerializer<Request>,
  responseSerializer: MessageSerializer<Response>,
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}
