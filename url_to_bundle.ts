import { MessageDescriptor, MessageFieldType } from "./message_descriptor";

export interface UrlToBundle {
  // Without protocol or domain, starting with "/", and ending without "/". Only
  // Applies to GET method.
  url?: string;
  // TypeScript file path to be served to the url, ending without ".ts", which
  // will be served inside an HTML file.
  modulePath?: string;
}

export let URL_TO_BUNDLE_DESCRIPTOR: MessageDescriptor<UrlToBundle> = {
  name: "UrlToBundle",
  fields: [
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

export let URL_TO_BUNDLES_HOLDER_DESCRIPTOR: MessageDescriptor<UrlToBundlesHolder> = {
  name: "UrlToBundlesHolder",
  fields: [
    {
      name: "urlToBundles?",
      type: MessageFieldType.MESSAGE,
      messageDescriptor: URL_TO_BUNDLE_DESCRIPTOR,
      isArray: true,
    },
  ],
};
