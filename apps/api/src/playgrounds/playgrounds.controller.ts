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
import { catchError, map } from 'rxjs/operators';
import { Public } from 'src/auth/guards/public.guard';

@Controller('playgrounds')
@UseGuards(JwtGuard)
export class PlaygroundsController {
  constructor(
    private readonly playgroundsService: PlaygroundsService,
  ) {}

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
      map((data) => {
        console.log('Emitting data:', data);
        return { data: JSON.stringify(data) };
      }),
      catchError((err) => {
        console.error('Error in watch_playground_status:', err);
        throw err; // Propagate the error to close the SSE connection
      }),
    );
  }
}
