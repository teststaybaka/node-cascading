import { newInternalError } from "./errors";

export class StreamReader {
  private static BUFFER_LIMIT = 50 * 1024 * 1024;

  public async readBuffer(incoming: NodeJS.ReadableStream): Promise<Buffer> {
    let buffers = await new Promise<Buffer[]>((resolve, reject): void => {
      let buffers: Buffer[] = [];
      let size = 0;
      incoming.on("data", (chunk: Buffer): void => {
        if (size + chunk.length > StreamReader.BUFFER_LIMIT) {
          let error = newInternalError(
            `Stream data exceeds buffer limit, ${StreamReader.BUFFER_LIMIT}.`
          );
          reject(error);
          incoming.pause();
          return;
        }

        buffers.push(chunk);
        size += chunk.length;
      });
      incoming.on("error", (err: Error): void => {
        reject(newInternalError("Stream encountered an error!", err));
      });
      incoming.on("end", (): void => {
        resolve(buffers);
      });
    });
    return Buffer.concat(buffers);
  }

  public async readString(incoming: NodeJS.ReadableStream): Promise<string> {
    let buffer = await this.readBuffer(incoming);
    return buffer.toString();
  }

  public async readJson(incoming: NodeJS.ReadableStream): Promise<any> {
    let str = await this.readString(incoming);
    return JSON.parse(str);
  }
}

export let STREAM_READER = new StreamReader();
