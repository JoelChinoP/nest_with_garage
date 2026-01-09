import { ConsoleLogger, ConsoleLoggerOptions } from '@nestjs/common';

export class AppLogger extends ConsoleLogger {
  private isDev: boolean;

  constructor(isDev: boolean, options: ConsoleLoggerOptions) {
    super(options);
    this.isDev = isDev;
  }

  protected getTimestamp(): string {
    return new Date().toLocaleString(undefined, {
      timeZone: 'America/Lima',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 2,
    });
  }

  protected formatPid(pid: number): string {
    return this.isDev ? `[${this.options.prefix}] ${pid} - ` : ' ';
  }
}
