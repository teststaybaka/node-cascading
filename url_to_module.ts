import {
  NamedTypeDescriptor,
  NamedTypeKind,
  MessageFieldType,
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
  factoryFn: () => {
    return new Object();
  },
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
  urlToModules?: Array<UrlToModule>;
}

export let URL_TO_MODULE_MAPPING: NamedTypeDescriptor<UrlToModuleMapping> = {
  name: "UrlToModuleMapping",
  kind: NamedTypeKind.MESSAGE,
  factoryFn: () => {
    return new Object();
  },
  messageFields: [
    {
      name: "urlToModules",
      type: MessageFieldType.NAMED_TYPE,
      namedTypeDescriptor: URL_TO_MODULE,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
  ],
};
