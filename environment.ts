import { NamedTypeDescriptor, NamedTypeKind } from "./named_type_descriptor";

export enum Environment {
  Local = 1,
  Prod = 2,
}

export let ENVIRONMENT: NamedTypeDescriptor<Environment> = {
  name: "Environment",
  kind: NamedTypeKind.ENUM,
  enumValues: [
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
