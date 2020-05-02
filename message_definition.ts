export interface MessageDefinition {
  name: string,
  fields: MessageField[],
}

export interface MessageField {
  name: string,
  type: string,
}

export interface EnumDefinition {
  name: string,
  values: EnumValue[]
}

export interface EnumValue {
  name: string,
  value: number,
}

