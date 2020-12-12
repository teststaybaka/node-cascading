import { LazyConstructor } from "../lazy_constructor";
import { STREAM_READER, StreamReader } from "../stream_reader";
import { Storage } from "@google-cloud/storage";

export class StorageClient {
  public constructor(
    private storage: Storage,
    private streamReader: StreamReader
  ) {}

  public async readFileAsString(
    bucketName: string,
    fileName: string
  ): Promise<string> {
    let fileStream = this.storage
      .bucket(bucketName)
      .file(fileName)
      .createReadStream();
    return this.streamReader.readString(fileStream);
  }
}

export let LAZY_STORAGE_CLIENT = new LazyConstructor(
  (): StorageClient => {
    let storage = new Storage();
    return new StorageClient(storage, STREAM_READER);
  }
);
