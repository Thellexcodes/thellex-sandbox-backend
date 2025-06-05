import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ErrorInterceptor } from '@/middleware/error.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { LogRequestMiddleware } from './middleware/log-request.middleware';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  const httpServer = createServer(app.getHttpAdapter().getInstance());

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // ✅ This now works
  app.set('io', io);

  httpServer.listen(serverPort, serverIp, () => {
    console.log(
      `🚀 Application is running at http://${serverIp}:${serverPort}`,
    );
  });
}

bootstrap();
