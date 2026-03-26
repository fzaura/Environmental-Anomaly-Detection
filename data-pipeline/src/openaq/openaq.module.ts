import { Module } from '@nestjs/common';
import { OpenaqService } from './openaq.service';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { HttpModule } from '@nestjs/axios';
import { OpenaqController } from './openaq.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [OpenaqService],
  imports: [TelemetryModule, HttpModule, ConfigModule],
  controllers: [OpenaqController],
})
export class OpenaqModule {}
