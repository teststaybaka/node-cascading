import { LazyConstructor } from "../lazy_constructor";
import { Log, Logging } from "@google-cloud/logging";

export class Logger {
  public constructor(private remoteLogger: Log) {}

  public info(message: string): void {
    console.log(message);
    let entry = this.remoteLogger.entry(message);
    this.remoteLogger.info(entry);
  }

  public warning(message: string): void {
    console.warn(message);
    let entry = this.remoteLogger.entry(message);
    this.remoteLogger.warning(entry);
  }

  public error(message: string): void {
    console.error(message);
    let entry = this.remoteLogger.entry(message);
    this.remoteLogger.error(entry);
  }
}

export let LAZY_LOGGER = new LazyConstructor(() => {
  return new Logger(new Logging().log("Backend"));
});
