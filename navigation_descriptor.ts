import { MessageUtil } from "./message_util";

export interface NavigationDescriptor<Params> {
  name: string;
  pathname: string;
  paramsUtil: MessageUtil<Params>;
}
