import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.250:3000',
      'https://ottbuddy.in',
      'https://www.ottbuddy.in',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(`OTTBuddy API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
