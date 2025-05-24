import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { JwtService } from './jwt.service';
import { JwtGuard } from './guards/jwt.guard';
import { UserMiddleware } from './middleware/user.middleware';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ConfigModule,
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GithubStrategy,
    JwtService,
    JwtGuard,
    UserMiddleware,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the middleware to all routes
    consumer.apply(UserMiddleware).forRoutes('*');
  }
} 