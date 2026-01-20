import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // Frontend URL
    credentials: true,
  });

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Hostel Pro API')
    .setDescription('API for Hostel Management System - Jain Hostel')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('applications', 'Application management endpoints')
    .addTag('documents', 'Document management endpoints')
    .addTag('payments', 'Payment management endpoints')
    .addTag('rooms', 'Room management endpoints')
    .addTag('leaves', 'Leave request endpoints')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`NestJS Backend is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
