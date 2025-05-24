import { Controller, Get, Post, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '../config/config.service';
import { User } from '../database/schema/user.schema';
import { JwtService } from './jwt.service';
import { JwtGuard } from './guards/jwt.guard';
import { GetUser } from './decorators/auth.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/cb')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@GetUser() user: User, @Res() res: Response) {
    const tokens = await this.jwtService.generateTokens(user);

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.redirect(`${this.configService.clientUrl}/auth/success`);
  }

  @Get('github/login')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Guard redirects to GitHub
  }

  @Get('github/cb')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@GetUser() user:User, @Res() res: Response) {

    const tokens = await this.jwtService.generateTokens(user);
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.redirect(`${this.configService.clientUrl}/auth/success`);
  }

  @Post('refresh')
  @UseGuards(JwtGuard)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const tokens = await this.jwtService.refreshTokens(refreshToken);
    if (!tokens) {
      res.clearCookie('refresh_token');
      res.clearCookie('access_token');
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ message: 'Tokens refreshed successfully' });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    return res.json({ message: 'Logged out successfully' });
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async me(@GetUser() user: User): Promise<User> {
    return user;
  }
} 