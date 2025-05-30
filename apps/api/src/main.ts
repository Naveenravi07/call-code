import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from './config/config.service';
import { setupEnv } from './config/env.config';

// Load environment variables before anything else
setupEnv();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.enableCors({
        origin: configService.clientUrl,
        credentials: true,
    });

    app.use(cookieParser());

    await app.listen(configService.port);
}
bootstrap();
