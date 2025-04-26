import { ChalkInstance } from 'chalk';
import { green, red, yellow } from './colors.js';

export class Logger {
  log(message: string, color?: ChalkInstance) {
    const logMessage = color ? color(message) : message;
    console.log(logMessage);
  }

  error(message: string) {
    this.log(message, red);
  }

  warn(message: string) {
    this.log(message, yellow);
  }

  success(message: string) {
    this.log(message, green);
  }
}
