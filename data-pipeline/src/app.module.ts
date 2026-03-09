import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TelemetryController } from './telemetry/telemetry.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, TelemetryController],
  providers: [AppService],
})
export class AppModule {}
