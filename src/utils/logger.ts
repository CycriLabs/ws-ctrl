import { ChalkInstance } from 'chalk';
import { green, red, yellow } from './colors.js';

interface LogMessage {
  level: string;
  message: string;
}

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

export class MemoryLogger extends Logger {
  private messages: LogMessage[] = [];

  log(message: string) {
    this.messages.push({
      level: 'log',
      message,
    });
  }

  error(message: string) {
    this.messages.push({
      level: 'error',
      message: message,
    });
  }

  warn(message: string) {
    this.messages.push({
      level: 'warn',
      message: message,
    });
  }

  success(message: string) {
    this.messages.push({
      level: 'success',
      message: message,
    });
  }

  getMessages(): LogMessage[] {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}
