export interface ServiceDescriptor<Request, Response> {
  name: string,
  pathname: string,
  constructRequest: ((obj?: any) => Request),
  constructResponse: ((obj?: any) => Response),
}

export interface SignedOutServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}

export interface SignedInServiceDescriptor<Request, Response>
  extends ServiceDescriptor<Request, Response> {}
