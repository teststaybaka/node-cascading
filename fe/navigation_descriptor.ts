import { NamedTypeDescriptor } from "../named_type_descriptor";

export interface NavigationDescriptor<Params> {
  name: string;
  pathname: string;
  paramsDescriptor: NamedTypeDescriptor<Params>;
}
