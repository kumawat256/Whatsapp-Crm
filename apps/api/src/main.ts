import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfiguredSocketIoAdapter } from './config/socket-io.adapter';

async function bootstrap() {
  // Debug/verbose logs are noisy and can leak more detail than intended in
  // a production deployment — dev keeps everything, production only keeps
  // what an operator actually needs to see.
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const config = app.get(ConfigService);

  app.useWebSocketAdapter(new ConfiguredSocketIoAdapter(app));
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });
  // Lets Nest run each module's OnModuleDestroy (PrismaService.$disconnect,
  // CampaignRunnerService's tick, etc.) on SIGTERM/SIGINT instead of the
  // process just dying mid-request when a process manager restarts it.
  app.enableShutdownHooks();

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
