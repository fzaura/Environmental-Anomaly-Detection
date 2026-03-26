import { Module } from '@nestjs/common';
import { OpenaqService } from './openaq.service';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { HttpModule } from '@nestjs/axios';
import { OpenaqController } from './openaq.controller';

@Module({
  providers: [OpenaqService],
  imports: [TelemetryModule, HttpModule],
  controllers: [OpenaqController],
})
export class OpenaqModule {}
