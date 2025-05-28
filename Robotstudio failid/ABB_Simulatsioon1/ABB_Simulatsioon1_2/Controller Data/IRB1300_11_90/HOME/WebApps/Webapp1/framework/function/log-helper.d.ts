// log-helper.d.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'err';
type MessageTypeWriteLog = 'WriteLog';

interface LogMessage {
  module: string;
  message: string;
  level: LogLevel;
  timestamp: Date;
}

declare namespace Logger {
  function log(level: LogLevel, module: string, message: string);
  function d(module: string, ...message: any[]): void;
  function i(module: string, ...message: any[]): void;
  function w(module: string, ...message: any[]): void;
  function e(module: string, ...message: any[]): void;
}

declare const MessageTypeWriteLog: MessageTypeWriteLog;
