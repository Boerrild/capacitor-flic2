import { WebPlugin } from '@capacitor/core';

import type { Flic2Plugin } from './definitions';

export class Flic2Web extends WebPlugin implements Flic2Plugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
