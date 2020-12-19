import { EnumDescriptor } from "./message_descriptor";

export enum Environment {
  Local = 1,
  Prod = 2,
}

export let ENVIRONMENT: EnumDescriptor<Environment> = {
  name: "Environment",
  values: [
    {
      name: "Local",
      value: 1,
    },
    {
      name: "Prod",
      value: 2,
    },
  ],
};
