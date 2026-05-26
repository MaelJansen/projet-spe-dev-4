import {NestFactory, Reflector} from '@nestjs/core';
import { AppModule } from './app.module';
import {ClassSerializerInterceptor, Logger, ValidationPipe} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import helmet from 'helmet';
import {json, urlencoded} from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');

  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const configService: ConfigService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: '*',
    maxAge: 86400,
  });
  app.useGlobalPipes(new ValidationPipe());
  const host = '0.0.0.0';
  const port = configService.get('port');
  await app.listen(port, host, () => {
    logger.log('Listening at http://' + host + ':' + port);
  });
}
bootstrap();
