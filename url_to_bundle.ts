import {
  MessageFieldType,
  NamedTypeDescriptor,
  NamedTypeKind,
} from "./named_type_descriptor";

export interface UrlToBundle {
  // Without protocol or domain, starting with "/", and ending without "/". Only
  // Applies to GET method.
  url?: string;
  // TypeScript file path to be served to the url, ending without ".ts", which
  // will be served inside an HTML file.
  modulePath?: string;
}

export let URL_TO_BUNDLE_DESCRIPTOR: NamedTypeDescriptor<UrlToBundle> = {
  name: "UrlToBundle",
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

export interface UrlToBundlesHolder {
  urlToBundles?: UrlToBundle[];
}

export let URL_TO_BUNDLES_HOLDER_DESCRIPTOR: NamedTypeDescriptor<UrlToBundlesHolder> = {
  name: "UrlToBundlesHolder",
  kind: NamedTypeKind.MESSAGE,
  messageFields: [
    {
      name: "urlToBundles?",
      type: MessageFieldType.NAMED_TYPE,
      namedTypeDescriptor: URL_TO_BUNDLE_DESCRIPTOR,
      isArray: true,
    },
  ],
};
