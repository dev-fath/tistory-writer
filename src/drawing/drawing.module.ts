import { Module } from '@nestjs/common';
import { DrawingController } from './drawing.controller';
import { DrawingService } from './drawing.service';

@Module({
  controllers: [DrawingController],
  providers: [DrawingService],
})
export class DrawingModule {}
