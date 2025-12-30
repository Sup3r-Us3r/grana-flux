import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import * as React from 'react';

@Injectable()
export class EmailTemplateService {
  async renderTemplate(template: React.ReactElement): Promise<string> {
    return render(template);
  }
}
