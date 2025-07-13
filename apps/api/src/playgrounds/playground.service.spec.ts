import { Test, TestingModule } from '@nestjs/testing';
import { PlaygroundsService } from './playgrounds.service';
import { PlaygroundType } from '@repo/shared/playgrounds/schema';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { RedisService } from '../redis/redis.service';
import axios from 'axios';

jest.mock('axios');

jest.mock('@kubernetes/client-node', () => ({
  V1JobStatus: {},
  KubeConfig: jest.fn(),
  BatchV1Api: jest.fn(),
  CoreV1Api: jest.fn(),
}));

jest.mock('namor', () => ({
  __esModule: true,
  default: {
    generate: jest.fn().mockReturnValue('mock-session-name'),
  },
}));

describe('PlaygroundsService', () => {
  let service: PlaygroundsService;
  let kubernetesService: jest.Mocked<KubernetesService>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaygroundsService,
        {
          provide: KubernetesService,
          useValue: {
            spawnJob: jest.fn(),
            createService: jest.fn(),
            createIstioVirtualService: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlaygroundsService>(PlaygroundsService);
    kubernetesService = module.get(KubernetesService);
    redisService = module.get(RedisService);
  });

  describe('createPlayground', () => {
    
    it('should create a playground and store initial status', async () => {
      kubernetesService.spawnJob.mockResolvedValue({} as any);
      kubernetesService.createService.mockResolvedValue({} as any);
      redisService.set.mockResolvedValue();

      const result = await service.createPlayground(PlaygroundType.VITE, 'user-123');

      expect(result.session_name).toBe('mock-session-name');
      expect(kubernetesService.spawnJob).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
    });
  });


});