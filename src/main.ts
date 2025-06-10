import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ErrorInterceptor } from '@/middleware/error.interceptor';
import { ValidationPipe } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
import { LogRequestMiddleware } from './middleware/log-request.middleware';
import { writeFileSync } from 'fs';

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

  if (process.env.NODE_ENV === 'testnet') {
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

  const configService = app.get(ConfigService);
  const serverPort = configService.get<number>('SERVER_PORT');
  const serverIp = configService.get<string>('SERVER_IP');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ErrorInterceptor());

  app.use((req, res, next) => {
    const middleware = new LogRequestMiddleware();
    middleware.use(req, res, next);
  });

  await app.listen(serverPort, serverIp);

  console.log(`Application is now running on: ${await app.getUrl()}`);
}

bootstrap();
