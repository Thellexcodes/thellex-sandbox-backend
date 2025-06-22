import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorInterceptor } from '@/middleware/error.interceptor';
import { ValidationPipe } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
import { writeFileSync } from 'fs';
import { ENV_PRODUCTION, getEnvVarMap } from './models/settings.types';
import { getAppConfig, getEnv } from './constants/env';

// const certFolder = path.join(__dirname, '../cert');

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

  const app = await NestFactory.create(AppModule, {});

  const isProd = getEnv() === ENV_PRODUCTION;

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Thellex API')
      .setDescription('Thellex API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'access-token',
      )
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

  await app.listen(serverPort, serverIp);

  console.log(`Application is now running on: ${await app.getUrl()}`);
}

bootstrap();
