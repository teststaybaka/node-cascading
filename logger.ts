import { Log, Logging } from "@google-cloud/logging";

class Logger {
  public info = this.infoRemote;
  public warning = this.warningRemote;
  public error = this.errorRemote;
  private remoteLogger: Log;

  public constructor() {
    this.remoteLogger = new Logging().log("Backend");
  }

  public switchToLocal(): void {
    this.info = console.info;
    this.warning = console.warn;
    this.error = console.error;
  }

  private infoRemote(message: string): void {
    console.log(message);
    let entry = this.remoteLogger.entry(message);
    this.remoteLogger.info(entry);
  }

  private warningRemote(message: string): void {
    console.warn(message);
    let entry = this.remoteLogger.entry(message);
    this.remoteLogger.warning(entry);
  }

  private errorRemote(message: string): void {
    console.error(message);
    let entry = this.remoteLogger.entry(message);
    this.remoteLogger.error(entry);
  }
}

export let LOGGER = new Logger();
