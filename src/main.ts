import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const PORT = `${process.env.PORT}` || 5000;
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableCors({
    origin: ['https://vladdyadenko.github.io', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(PORT, () => console.log(`Server started on port=${PORT}`));
}
bootstrap();
