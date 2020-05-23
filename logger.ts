import { Entry, Log, Logging } from "@google-cloud/logging";

enum Severity {
  Info = 1,
  Warning = 2,
  Error = 3,
}

class BatchLogger {
  private static FLUSH_DELAY = 30000; // ms
  private static ENTRIES_LIMIT = 100;

  private flushTimer: NodeJS.Timer;
  private entries: Entry[] = [];

  public constructor(private remoteLogger: Log, private severity: Severity) {}

  public buffer(message: string): void {
    let entry = this.remoteLogger.entry(message);
    this.entries.push(entry);
    if (this.entries.length < BatchLogger.ENTRIES_LIMIT) {
      if (!this.flushTimer) {
        this.flushTimer = setTimeout(this.flush, BatchLogger.FLUSH_DELAY);
      }
    } else {
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
      }
      this.flush();
    }
  }

  private flush = async (): Promise<void> => {
    try {
      switch (this.severity) {
        case Severity.Info:
          await this.remoteLogger.info(this.entries);
          break;
        case Severity.Warning:
          await this.remoteLogger.warning(this.entries);
          break;
        case Severity.Error:
          await this.remoteLogger.error(this.entries);
          break;
        default:
          await this.remoteLogger.info(this.entries);
      }
    } catch (e) {
      // Do nothing
    }

    this.entries = [];
    this.flushTimer = undefined;
  };
}

class Logger {
  public info = this.infoRemote;
  public warning = this.warningRemote;
  public error = this.errorRemote;
  private logging: Logging;
  private remoteLogger: Log;
  private severityToBatchLoggers = new Map<string, BatchLogger>();

  public constructor() {
    this.logging = new Logging();
    this.remoteLogger = this.logging.log("Backend");
  }

  public switchToLocal(): void {
    this.info = console.info;
    this.warning = console.warn;
    this.error = console.error;
  }

  public infoRemote(message: string): void {
    console.log(message);
    let batchLogger = this.getBatchLogger(Severity.Info);
    batchLogger.buffer(message);
  }

  private getBatchLogger(severity: Severity): BatchLogger {
    let batchLogger = this.severityToBatchLoggers.get(Severity[severity]);
    if (!batchLogger) {
      batchLogger = new BatchLogger(this.remoteLogger, severity);
      this.severityToBatchLoggers.set(Severity[severity], batchLogger);
    }
    return batchLogger;
  }

  public warningRemote(message: string): void {
    console.warn(message);
    let batchLogger = this.getBatchLogger(Severity.Warning);
    batchLogger.buffer(message);
  }

  public errorRemote(message: string): void {
    console.error(message);
    let batchLogger = this.getBatchLogger(Severity.Error);
    batchLogger.buffer(message);
  }
}

export let LOGGER = new Logger();
