import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './presentation/modules/app-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Grana Flux API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/swagger', app, document); // Swagger UI at /docs/swagger

  // Scalar API Reference at /docs
  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'bluePlanet',
      expandAllResponses: true,
    }),
  );

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
