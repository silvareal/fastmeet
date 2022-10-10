import util from "util";
import colors from "colors";

colors.enable(); //colors.disable();

const options = {
  depth: null,
  colors: true,
};

/**
 * Logger for logging errors, info and debug
 */
class Logger {
  appName: string;
  debugOn: boolean;
  timeStart: number;
  timeEnd: number | null;
  timeElapsedMs: number | string | null;

  constructor(appName = "FastMeetP2P", debugOn = true) {
    this.appName = colors.yellow(appName);
    this.debugOn = debugOn;
    this.timeStart = Date.now();
    this.timeEnd = null;
    this.timeElapsedMs = null;
  }

  debug<T, U = unknown>(msg: T, op?: U) {
    if (this.debugOn) {
      this.timeEnd = Date.now();
      this.timeElapsedMs = this.getFormatTime(
        Math.floor(this.timeEnd - this.timeStart)
      );
      console.debug(
        "[" + this.getDataTime() + "] [" + this.appName + "] " + msg,
        util.inspect(op, options),
        this.timeElapsedMs
      );
      this.timeStart = Date.now();
    }
  }

  log<T, U = unknown>(msg: T, op?: U) {
    console.log(
      "[" + this.getDataTime() + "] [" + this.appName + "] " + msg,
      util.inspect(op, options)
    );
  }

  info<T, U = unknown>(msg: T, op?: U) {
    console.info(
      "[" +
        this.getDataTime() +
        "] [" +
        this.appName +
        "] " +
        colors.green(`${msg}`),
      util.inspect(op, options)
    );
  }

  warn<T, U = unknown>(msg: T, op?: U) {
    console.warn(
      "[" +
        this.getDataTime() +
        "] [" +
        this.appName +
        "] " +
        colors.yellow(`${msg}`),
      util.inspect(op, options)
    );
  }

  error<T, U = unknown>(msg: T, op?: U) {
    console.error(
      "[" +
        this.getDataTime() +
        "] [" +
        this.appName +
        "] " +
        colors.red(`${msg}`),
      util.inspect(op, options)
    );
  }

  getDataTime() {
    return colors.cyan(
      new Date().toISOString().replace(/T/, " ").replace(/Z/, "")
    );
  }

  getFormatTime(ms: number) {
    let time = Math.floor(ms);
    let type = "ms";

    if (ms >= 1000) {
      time = Math.floor((ms / 1000) % 60);
      type = "s";
    }
    if (ms >= 60000) {
      time = Math.floor((ms / 1000 / 60) % 60);
      type = "m";
    }
    if (ms >= (3, 6e6)) {
      time = Math.floor((ms / 1000 / 60 / 60) % 24);
      type = "h";
    }
    return colors.magenta("+" + time + type);
  }
}

export default Logger;
