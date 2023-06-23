import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './configure/configure.module';
import { WriteModule } from './write/write.module';
import { ChatModule } from './chat/chat.module';
import { DrawingModule } from './drawing/drawing.module';
import { SubjectModule } from './subject/subject.module';
import { TranslateModule } from './translate/translate.module';

@Module({
  imports: [
    AuthModule,
    ConfigurationModule,
    WriteModule,
    ChatModule,
    DrawingModule,
    SubjectModule,
    TranslateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
