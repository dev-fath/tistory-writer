import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TranslateService } from '../translate/translate.service';

@Module({
  providers: [ChatService, TranslateService],
  exports: [ChatService],
})
export class ChatModule {}
