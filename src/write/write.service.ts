import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { DrawingService } from '../drawing/drawing.service';
import { format } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { CategoryEnum, CategoryType } from './category';
import axios from 'axios';
import { AttachImageResponse } from './dto/attach-image.dto';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class WriteService {
  private xmlParser: XMLParser;
  constructor(
    private chatService: ChatService,
    private drawService: DrawingService,
    private configService: ConfigService,
  ) {
    this.xmlParser = new XMLParser({ parseTagValue: false });
  }
  async createPost(title: string, category: CategoryType) {
    const createdSubjects = await this.chatService.createSubject(title);

    const subjectList: { title: string }[] = JSON.parse(
      createdSubjects.content,
    );
    const hour = 1000 * 60 * 60;

    let time = '';

    let i = 0;

    return await Promise.all(
      subjectList.map(async ({ title }) => {
        time = format(
          new Date(new Date().getTime() + hour * i++),
          'yyyy-MM-dd HH:mm:ss',
        );
        console.log({ title, time });
        // return { title, time };
        const createdContents = await this.chatService.createChatCompletion(
          title,
          'me',
        );
        let imageTag = '';

        if (createdContents.titleEn) {
          try {
            const createdImage = await this.drawService.createImage(
              createdContents.titleEn,
            );

            const {
              tistory: { url: imageUrl },
            } = await this.attachFileByRemoteUrl(createdImage);

            imageTag = `<img src="${imageUrl}" alt="title"/>`;
          } catch (e) {
            console.log(e);
          }
        }
        const accessToken = this.configService.get<string>(
          'TISTORY_ACCESS_TOKEN',
        );

        const blogName = this.configService.get<string>('TISTORY_BLOG_NAME');

        const param = {
          access_token: accessToken,
          output: 'json',
          blogName: blogName ?? 'fathory',
          visibility: this.configService.get<number>('POST_VISIBLE'),
          category: CategoryEnum[category] ?? 0,
          published: time,
          title: createdContents.title,
          tag: createdContents.tag,
          content: `${imageTag} ${createdContents.content}`,
        };

        await axios.post('https://www.tistory.com/apis/post/write', param);
      }),
    );
  }

  async attachFileByRemoteUrl(url: string): Promise<AttachImageResponse> {
    const imageStream = await axios.get(url, { responseType: 'stream' });
    const response = await axios.postForm(
      `https://www.tistory.com/apis/post/attach`,
      {
        uploadedfile: imageStream.data,
        blogName: this.configService.get<string>('TISTORY_BLOG_NAME'),
        access_token: this.configService.get<string>('TISTORY_ACCESS_TOKEN'),
      },
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'json',
      },
    );
    return this.xmlParser.parse(response.data);
  }
}
