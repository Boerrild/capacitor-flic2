import { registerPlugin } from '@capacitor/core';

import type { Flic2Plugin } from './definitions';

const Flic2 = registerPlugin<Flic2Plugin>('Flic2', {
  web: () => import('./web').then(m => new m.Flic2Web()),
});

export * from './definitions';
export { Flic2 };
