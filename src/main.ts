import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { customLogger } from './logger.service';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: customLogger(),
    }),
  });

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max:  1,
    }),
  );

  await app.listen(process.env.PORT, '0.0.0.0', () => {
    logger.log(`Webhook Builder started @ http://${process.env.HOST}:${process.env.PORT}`);
  });
}
bootstrap();
