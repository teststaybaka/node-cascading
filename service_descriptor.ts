export interface ServiceDescriptor<Request, Response> {
  name: string,
  pathname: string,
  requireSignIn: boolean,
  constructRequest: ((obj?: any) => Request),
  constructResponse: ((obj?: any) => Response),
}
