import { Test, TestingModule } from '@nestjs/testing';
import { OpenaqController } from './openaq.controller';

describe('OpenaqController', () => {
  let controller: OpenaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenaqController],
    }).compile();

    controller = module.get<OpenaqController>(OpenaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
