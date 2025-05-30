import { Body, UseGuards, Controller, Post } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';
import { ZodValidationPipe } from 'comon/pipes/zodValidationPipe';
import { CreatePlayground, createPlaygroundSchema } from './dto/create-playground';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/auth.decorator';
import { JwtUser } from 'src/auth/types/jwt-payload.type';


@Controller('playgrounds')
@UseGuards(JwtGuard)

export class PlaygroundsController {
    constructor(private readonly playgroundsService: PlaygroundsService) { }

    @Post('create')
    async createPlayground(
        @Body(new ZodValidationPipe(createPlaygroundSchema)) body: CreatePlayground,
        @GetUser() user: JwtUser,
    ) {
        let playground_type = body.playground;
        let status = await this.playgroundsService.createPlayground(playground_type, user.id);
        return status;
    }
}
