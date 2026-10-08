import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { uploadsDir } from './posts/thumbnail-storage';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  app.useStaticAssets(uploadsDir(), { prefix: '/uploads' });
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' });

  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription('Users, JWT login, posts feed, likes and comments')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
