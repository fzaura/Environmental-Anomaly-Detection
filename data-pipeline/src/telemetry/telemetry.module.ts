import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
  imports: [PrismaModule],
})
export class TelemetryModule {}
