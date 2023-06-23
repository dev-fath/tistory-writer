import { Injectable } from '@nestjs/common';

import { translate } from '@vitalets/google-translate-api';

@Injectable()
export class TranslateService {
  async korean2English(content: string) {
    const { text } = await translate(content, { to: 'en' });
    return text;
  }

  async english2Korean(content: string) {
    const { text } = await translate(content, { to: 'ko' });
    return text;
  }
}
