import {
  MessageFieldType,
  NamedTypeDescriptor,
  NamedTypeKind,
} from "./named_type_descriptor";

export interface UrlToModule {
  // Without protocol or domain, starting with "/", and ending without "/". Only
  // Applies to GET method.
  url?: string;
  // TypeScript file path to be served to the url, ending without ".ts", which
  // will be served inside an HTML file.
  modulePath?: string;
}

export let URL_TO_MODULE: NamedTypeDescriptor<UrlToModule> = {
  name: "UrlToModule",
  kind: NamedTypeKind.MESSAGE,
  messageFields: [
    {
      name: "url",
      type: MessageFieldType.STRING,
    },
    {
      name: "modulePath",
      type: MessageFieldType.STRING,
    },
  ],
};

export interface UrlToModuleMapping {
  urlToModules?: UrlToModule[];
}

export let URL_TO_MODULE_MAPPING: NamedTypeDescriptor<UrlToModuleMapping> = {
  name: "UrlToModuleMapping",
  kind: NamedTypeKind.MESSAGE,
  Clazz: Object,
  messageFields: [
    {
      name: "urlToModules",
      type: MessageFieldType.NAMED_TYPE,
      namedTypeDescriptor: URL_TO_MODULE,
      ArrayClazz: Array,
    },
  ],
};
