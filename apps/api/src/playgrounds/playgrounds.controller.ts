import {
  Body,
  UseGuards,
  Controller,
  Post,
  Sse,
  MessageEvent,
  Query,
} from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';
import { ZodValidationPipe } from 'comon/pipes/zodValidationPipe';
import {
  createPlaygroundSchema,
  CreatePlayground,
} from '@repo/shared/playgrounds/schema';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/auth.decorator';
import { JwtUser } from '@repo/shared/user/schema';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Public } from 'src/auth/guards/public.guard';

@Controller('playgrounds')
@UseGuards(JwtGuard)
export class PlaygroundsController {
  constructor(private readonly playgroundsService: PlaygroundsService) {}

  @Post('create')
  async createPlayground(
    @Body(new ZodValidationPipe(createPlaygroundSchema)) body: CreatePlayground,
    @GetUser() user: JwtUser,
  ) {
    const playground_type = body.playground;
    const status = await this.playgroundsService.createPlayground(
      playground_type,
      user.id,
    );
    return status;
  }

  @Sse('status')
  @Public()
  watch_playground_status(
    @Query('sessionId') sessionId: string,
  ): Observable<MessageEvent> {
    return this.playgroundsService.createStatusObserver(sessionId).pipe(
      map((data) => ({
        data: JSON.stringify(data),
      })),
    );
  }
}
