import {
  NamedTypeDescriptor,
  NamedTypeKind,
} from "./named_type_descriptor";

export enum Environment {
  LOCAL = 1,
  PROD = 2,
}

export let ENVIRONMENT: NamedTypeDescriptor<Environment> = {
  name: "Environment",
  kind: NamedTypeKind.ENUM,
  enumValues: [
    {
      name: "LOCAL",
      value: 1,
    },
    {
      name: "PROD",
      value: 2,
    },
  ],
};
