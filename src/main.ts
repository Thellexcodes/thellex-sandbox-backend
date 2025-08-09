import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorInterceptor } from '@/middleware/error.interceptor';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { writeFileSync } from 'fs';
import { ENV_PRODUCTION } from './models/settings.types';
import { getAppConfig, getEnv } from './constants/env';
import * as bodyParser from 'body-parser';
import {
  FILE_UPLOAD_LIMIT,
  SERVER_REQUEST_TIMEOUT_MS,
} from './config/settings';
import { API_VERSIONS } from './config/versions';
import { AllExceptionsFilter } from './middleware/filters/http-exception.filter';

const certFolder = path.join(__dirname, '../../cert');

async function bootstrap() {
  let httpsOptions: any = null;

  // Check if HTTPS is enabled via environment variable
  const enableHttps = getAppConfig().ENABLE_HTTPS === 'true';

  if (enableHttps) {
    try {
      const keyFilePath = path.join(certFolder, 'server.key');
      const certFilePath = path.join(certFolder, 'server.cert');

      // Verify certificate files exist
      if (!fs.existsSync(keyFilePath) || !fs.existsSync(certFilePath)) {
        console.warn(
          `HTTPS enabled but certificate files not found in ${certFolder}. Falling back to HTTP.`,
        );
      } else {
        httpsOptions = {
          key: fs.readFileSync(keyFilePath),
          cert: fs.readFileSync(certFilePath),
        };
        console.log('HTTPS enabled with provided certificates.');
      }
    } catch (error) {
      console.error(`Failed to load HTTPS certificates: ${error.message}`);
      console.warn('Falling back to HTTP.');
    }
  } else {
    console.log('HTTPS disabled. Running on HTTP.');
  }

  // Create NestJS app with or without HTTPS
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    // logger: false,
  });
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const isProd = getEnv() === ENV_PRODUCTION;

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Thellex API')
      .setDescription('Thellex API Documentation')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'access-token',
      )
      .setVersion(API_VERSIONS.V101)
      .addServer(`/${enableHttps ? 'https' : 'http'}`)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document);
    writeFileSync('./openapi.json', JSON.stringify(document));
  }

  const serverIp = getAppConfig().SERVER.IP;
  const serverPort = getAppConfig().SERVER.PORT;

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(bodyParser.json({ limit: FILE_UPLOAD_LIMIT }));
  app.use(bodyParser.urlencoded({ limit: FILE_UPLOAD_LIMIT, extended: true }));

  const server = await app.listen(serverPort, serverIp);
  server.setTimeout(SERVER_REQUEST_TIMEOUT_MS);

  const appUrl = await app.getUrl();
  console.log(`Application is now running on: ${appUrl}`);
}

bootstrap();
