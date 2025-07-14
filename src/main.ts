import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorInterceptor } from '@/middleware/error.interceptor';
import { ValidationPipe, VersioningType } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
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
// import { CircleWalletManager } from './utils/services/circle-wallet.manager';

// const certFolder = path.join(__dirname, '../cert');

// (async () => {
//   const apiKey = getAppConfig().CWALLET.API_KEY;
//   const walletSetName = 'My First Wallet Set';

//   const manager = new CircleWalletManager(apiKey);

//   try {
//     const {} = await manager.setupWalletSet(walletSetName);
//     // console.log('Wallet Set:', walletSet);
//     // console.log('Recovery File:', recoveryFile);
//   } catch (err) {
//     console.error('Setup error:', err.message);
//   }
// })();

async function bootstrap() {
  // let httpsOptions: any;

  // if (process.env.NODE_ENV === 'development') {
  //   const keyFile = fs.readFileSync(path.join(certFolder, 'server.key'));
  //   const certFile = fs.readFileSync(path.join(certFolder, 'server.cert'));

  //   httpsOptions = {
  //     key: keyFile,
  //     cert: certFile,
  //   };
  // }

  const app = await NestFactory.create(AppModule, { logger: false });
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
      .setVersion(API_VERSIONS.V100)
      .addServer(`/`)
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

  console.log(`Application is now running on: ${await app.getUrl()}`);
}

bootstrap();
