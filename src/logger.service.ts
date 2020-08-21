import * as winston from 'winston';
import * as SentryTransport from '@synapsestudios/winston-sentry';
import * as Sentry from '@sentry/node';
import 'winston-daily-rotate-file';

if (process.env.SENTRY_URI) {
  Sentry.init({
    dsn: process.env.SENTRY_URI,
    environment: process.env.NODE_ENV,
    release: '1.0',
  });
}

const customMessage = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const transportCFG = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '128m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.label({ label: 'WH SERVICE' }),
    winston.format.timestamp(),
    customMessage,
  ),
  json: true,
};

export const customLogger = () => {
  const transports = [
    new (winston.transports.DailyRotateFile)({
      ...transportCFG,
      filename: './logs/error-%DATE%.log',
      level: 'error',
    }),
    new (winston.transports.DailyRotateFile)({
      ...transportCFG,
      filename: './logs/combined-%DATE%.log',
      silent: process.env.NODE_ENV === 'development',
      level: 'info',
    }),
    new winston.transports.Console({
      ...transportCFG,
      format: winston.format.combine(
        winston.format.label({ label: 'WH SERVICE' }),
        winston.format.timestamp(),
        winston.format.colorize(),
        customMessage,
      ),
    }),
  ];
  if (process.env.SENTRY_URI) {
    transports.push(
      new SentryTransport({Sentry,
        silent: process.env.NODE_ENV === 'development',
        level: 'error',
      }),
    );
  }
  return transports;
};
