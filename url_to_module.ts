import { MessageDescriptor, PrimitiveType } from "./message_descriptor";

export interface UrlToModule {
  /* Without protocol or domain, starting with '/', and ending without '/'. Only apples to GET method. */
  url?: string;
  /* TypeScript file path to be served to the url, ending without '.ts', which will be served inside an HTML file. */
  modulePath?: string;
}

export let URL_TO_MODULE: MessageDescriptor<UrlToModule> = {
  name: "UrlToModule",
  factoryFn: () => {
    return new Object();
  },
  messageFields: [
    {
      name: "url",
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: "modulePath",
      primitiveType: PrimitiveType.STRING,
    },
  ],
};

export interface UrlToModuleMapping {
  urlToModules?: Array<UrlToModule>;
}

export let URL_TO_MODULE_MAPPING: MessageDescriptor<UrlToModuleMapping> = {
  name: "UrlToModuleMapping",
  factoryFn: () => {
    return new Object();
  },
  messageFields: [
    {
      name: "urlToModules",
      messageDescriptor: URL_TO_MODULE,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
  ],
};
