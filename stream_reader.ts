import stream = require('stream');
import { newInternalError } from './errors';

let BUFFER_LIMIT = 50*1024*1024;

export class StreamReader {
  public async readJson(incoming: stream.Readable): Promise<any> {
    let buffer = await new Promise<number[]>((resolve, reject): void => {
      let buffer: number[] = [];
      incoming.on('data', (chunk): void => {
        if (buffer.length + chunk.length > BUFFER_LIMIT) {
          reject(newInternalError(`Incoming data exceeds buffer limit, ${BUFFER_LIMIT}.`));
          return;
        }

        for (let i = 0, len = chunk.length; i < len; i++) {
          buffer.push(chunk[i] as number);
        }
      });
      incoming.on('error', (err): void => {
        reject(newInternalError('Incoming stream encountered an error!', err));
      });
      incoming.on('end', (): void => {
        resolve(buffer);
      });
    });
    let jsonString = Buffer.from(buffer).toString();
    return JSON.parse(jsonString);
  }
}

export let STREAM_READER = new StreamReader();
