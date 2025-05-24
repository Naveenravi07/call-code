import { Test, TestingModule } from '@nestjs/testing';
import { PlaygroundsService } from './playgrounds.service';

describe('PlaygroundsService', () => {
  let service: PlaygroundsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaygroundsService],
    }).compile();

    service = module.get<PlaygroundsService>(PlaygroundsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
