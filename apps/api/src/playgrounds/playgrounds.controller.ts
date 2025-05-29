import { Body, Controller, Post } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';

@Controller('playgrounds')
export class PlaygroundsController {
  constructor(private readonly playgroundsService: PlaygroundsService) {}

  @Post('create')
  async createPlayground(@Body() body: any) {
    let playground_type = body.playground_type; 
    return this.playgroundsService.createPlayground();
  }
}
