import { Controller } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';

@Controller('playgrounds')
export class PlaygroundsController {
  constructor(private readonly playgroundsService: PlaygroundsService) {}
}
