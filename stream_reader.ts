import stream = require("stream");
import { newInternalError } from "./errors";

export class StreamReader {
  private static BUFFER_LIMIT = 50 * 1024 * 1024;

  public async readBuffer(incoming: stream.Readable): Promise<Buffer> {
    let buffers = await new Promise<Buffer[]>((resolve, reject): void => {
      let buffers: Buffer[] = [];
      let size = 0;
      incoming.on("data", (chunk): void => {
        if (size + chunk.length> StreamReader.BUFFER_LIMIT) {
          let error = newInternalError(
              `Stream data exceeds buffer limit, ${StreamReader.BUFFER_LIMIT}.`
            )
          reject(error
          );
          incoming.destroy(error);
          return;
        }

        buffers.push(chunk);
        size += chunk.length;
      });
      incoming.on("error", (err): void => {
        reject(newInternalError("Stream encountered an error!", err));
      });
      incoming.on("end", (): void => {
        resolve(buffers);
      });
    });
    return Buffer.concat(buffers);
  }

  public async readString(incoming: stream.Readable): Promise<any> {
    let buffer = await this.readBuffer(incoming);
    return buffer.toString();
  }

  public async readJson(incoming: stream.Readable): Promise<any> {
    let str = await this.readString(incoming);
    return JSON.parse(str);
  }
}
