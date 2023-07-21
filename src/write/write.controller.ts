import { Controller, Get, Query } from '@nestjs/common';
import { WriteService } from './write.service';
import { SubjectService } from '../subject/subject.service';
import { CategoryType } from './category';

@Controller('write')
export class WriteController {
  constructor(
    private writeService: WriteService,
    private subjectService: SubjectService,
  ) {}

  @Get()
  async createPost(
    @Query('title') title: string,
    @Query('category') category: CategoryType,
  ) {
    await this.writeService.createPost(title, category);
  }

  @Get('bard')
  async createPostWithBard(
    @Query('title') title: string,
    @Query('category') category: CategoryType,
  ) {
    await this.writeService.createPostWithBard(title, category);
  }

  @Get('/subject')
  async createSubjects(@Query('title') title: string) {
    await this.subjectService.createSubject(title);
  }
}
