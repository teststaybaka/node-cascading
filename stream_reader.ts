import stream = require("stream");
import { newInternalError } from "./errors";

export class StreamReader {
  private static BUFFER_LIMIT = 50 * 1024 * 1024;

  public async readJson(incoming: stream.Readable): Promise<any> {
    let buffer = await new Promise<number[]>((resolve, reject): void => {
      let buffer: number[] = [];
      incoming.on("data", (chunk): void => {
        if (buffer.length + chunk.length > StreamReader.BUFFER_LIMIT) {
          reject(
            newInternalError(
              `Stream data exceeds buffer limit, ${StreamReader.BUFFER_LIMIT}.`
            )
          );
          return;
        }

        for (let i = 0, len = chunk.length; i < len; i++) {
          buffer.push(chunk[i] as number);
        }
      });
      incoming.on("error", (err): void => {
        reject(newInternalError("Stream encountered an error!", err));
      });
      incoming.on("end", (): void => {
        resolve(buffer);
      });
    });
    let jsonString = Buffer.from(buffer).toString();
    return JSON.parse(jsonString);
  }
}
