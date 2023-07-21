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
import { spawnSync } from 'child_process';

interface ChatResponseDTO {
  title: string;
  tag: string;
  content: string;
  titleEn: string;
}

@Injectable()
export class ChatService {
  private readonly GPT_MODEL = 'gpt-3.5-turbo-0613';
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
      const translatedPrompt = await this.translateService.korean2English(
        prompt,
      );
      const realPrompt = `Please write a blog post about ${translatedPrompt} in detail. title is "${prompt}". There should be made up with introduction, body that made up with some subtopics, conclusion. the post must be made up with more than 1000 words. If your response has any questions related to programming, your answer must have example code with <pre><code> tags.`;

      const messages: ChatCompletionRequestMessage[] = [
        { role: 'user', content: realPrompt, name: chatUserName },
        {
          role: 'system',
          content: `Enter the answer to suit the following JSON format. {title: 제목, titleEn: "title in english", tag: 'comma로 구분된 키워드 10개', content: 'Answers made up of html. it must made in single line. if need new line, format as abc\\n + def. the answers are must korean'}`,
          name: 'system',
        },
      ];
      const completion = await this.openai.createChatCompletion({
        messages: messages,
        // model: 'gpt-3.5-turbo-0613',
        model: this.GPT_MODEL,
        temperature: 0,
      });

      // messages.push(completion.data.choices[0].message, {
      //   content: `답변을 JSON 포맷으로 유지하면서 검색엔진에 최적화된 html로 구성된 한글로 번역해줘`,
      //   role: 'user',
      //   name: chatUserName,
      // });
      const translated = await this.openai.createChatCompletion({
        messages: messages,
        // model: 'gpt-3.5-turbo-0613',
        model: this.GPT_MODEL,
        temperature: 0,
      });

      let contents: ChatResponseDTO = {
        titleEn: prompt,
        tag: '',
        title: prompt,
        content: translated.data.choices[0].message.content,
      };
      console.log(translated.data.choices[0].message.content);

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
      throw error;
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
        //q model: 'gpt-3.5-turbo-0613',
        model: this.GPT_MODEL,
        temperature: 1,
      });

      return completion.data.choices[0].message;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createBardCompletion(prompt: string): Promise<ChatResponseDTO> {
    const pythonProcess = spawnSync('python3', [
      'src/python/bardAPI.py',
      prompt,
    ]);
    const stdout = pythonProcess.stdout.toString();
    const stderr = pythonProcess.stderr.toString();

    console.log(stdout);
    const [form, content] = stdout.split('-s-p-l-i-t-t-e-r-');
    if (stderr) {
      console.log({ stderr });
      // await this.createBardCompletion(prompt);
    }

    try {
      console.log(form);
      const result = JSON.parse(form) as ChatResponseDTO;
      result.content = content;

      console.log(result);
      return content
        ? result
        : { content: '', title: '', titleEn: '', tag: '' };
    } catch (e) {
      console.log(prompt);
      console.log(form);
      // await this.createBardCompletion(prompt);
    }
  }
}
