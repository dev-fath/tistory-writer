import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  Configuration,
  OpenAIApi,
} from 'openai';
import { TranslateService } from '../translate/translate.service';
import fs from 'fs';

interface ChatResponseDTO {
  title: string;
  tag: string;
  content: string;
  titleEn: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAIApi;
  constructor(
    private configService: ConfigService,
    private translateService: TranslateService,
  ) {
    const configuration = new Configuration({
      apiKey: this.configService.get('CHAT_GPT_KEY'),
    });

    this.openai = new OpenAIApi(configuration);
  }

  async createChatCompletion(
    prompt: string,
    chatUserName: string,
  ): Promise<ChatResponseDTO> {
    try {
      const translatedPrompt = this.translateService.korean2English(prompt);
      const realPrompt = `Please write a blog post about ${translatedPrompt} in detail. title is "${prompt}". There should be made up with introduction, body that made up with 5 or 10 subtopics, conclusion. the post must be made up with more than 1500 words. If your response has any questions related to programming, your answer must have example code with <pre><code> tags. Please write a answer with a new line in the same format as "abc\\n" + "def"`;

      const messages: ChatCompletionRequestMessage[] = [
        { role: 'user', content: realPrompt, name: chatUserName },
        {
          role: 'system',
          content: `Enter the answer to suit the following JSON format. {title: 제목, titleEn: "title in english", tag: 'comma로 구분된 10개의 키워드', content: 'Answers made up of search engine-optimized Semantic html'}`,
          name: 'system',
        },
      ];
      const completion = await this.openai.createChatCompletion({
        messages: messages,
        model: 'gpt-3.5-turbo-0613',
        temperature: 0,
      });

      messages.push(completion.data.choices[0].message, {
        content: `답변을 다음 JSON 포맷에 맞도록 입력해줘. {title: 제목, titleEn: "title in english", tag: 'comma로 구분된 10개의 키워드', content: '검색엔진에 최적화된 html로 구성된 한글로 번역한 답변'}`,
        role: 'user',
        name: chatUserName,
      });
      const translated = await this.openai.createChatCompletion({
        messages: messages,
        model: 'gpt-3.5-turbo-0613',
        temperature: 0,
      });

      let contents: ChatResponseDTO = {
        titleEn: prompt,
        tag: '',
        title: prompt,
        content: translated.data.choices[0].message.content,
      };
      try {
        contents = JSON.parse(translated.data.choices[0].message.content);
      } catch (e) {
        console.log(e);
        fs.writeFileSync(
          `./${contents.title}.json`,
          translated.data.choices[0].message.content,
        );
      }

      return contents;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createSubject(prompt: string): Promise<ChatCompletionResponseMessage> {
    try {
      const realPrompt = `Please make ${this.configService.get<string>(
        'POST_COUNT',
      )} blogging topics about ${prompt}.`;

      const completion = await this.openai.createChatCompletion({
        messages: [
          { role: 'user', content: realPrompt },
          {
            role: 'system',
            content: `답변을 다음 JSON 포맷에 맞도록 입력해줘. 답변에 escape문자가 있으면 그 문자를 JSON 데이터에 적합하도록 처리해줘. [{title: 제목1}, {title: 제목2}, ...]`,
            name: 'system',
          },
        ],
        model: 'gpt-3.5-turbo-0613',
        temperature: 1,
      });

      return completion.data.choices[0].message;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
