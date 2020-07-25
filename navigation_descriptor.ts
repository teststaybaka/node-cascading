import { MessageDescriptor } from "./message_descriptor";

export interface NavigationDescriptor<Params> {
  name: string;
  pathname: string;
  paramsDescriptor: MessageDescriptor<Params>;
}
