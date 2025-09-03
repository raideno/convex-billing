export class Logger {
  debug_: boolean;

  constructor(debug: boolean) {
    this.debug_ = debug;
  }

  log(message: string) {
    console.log(message);
  }

  error(message: string) {
    console.error(message);
  }

  warn(message: string) {
    console.warn(message);
  }

  debug(message: string) {
    if (this.debug_) {
      console.debug(message);
    }
  }
}
