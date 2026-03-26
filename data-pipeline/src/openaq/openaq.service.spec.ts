import { Test, TestingModule } from '@nestjs/testing';
import { OpenaqService } from './openaq.service';

describe('OpenaqService', () => {
  let service: OpenaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenaqService],
    }).compile();

    service = module.get<OpenaqService>(OpenaqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
