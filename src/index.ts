import { registerPlugin } from '@capacitor/core';

import {
  Flic2Plugin, FLICButtonDelegate,
  FLICButtonMessageHandler, FLICManager,
  FLICManagerDelegate,
  FLICManagerMessageHandler, setSharedInstance, sharedInstance
} from './definitions';

const Flic2 = registerPlugin<Flic2Plugin>('Flic2Plugin', {
  web: () => import('./web').then(m => new m.Flic2Web()),
});

/**
 * Returns the sharedInstance singleton FLICManager instance. Instance is created on the very first invocation.
 * Parameters only affects the creation and will be ignored on subsequent calls.
 *
 * @param allowRunInBackground
 * @param flicManagerMessageHandler
 * @param flicManagerDelegate
 * @param flicButtonMessageHandler
 * @param flicButtonDelegate
 * @param bridge
 */
export function flicManager(
    allowRunInBackground?: boolean,
    flicManagerMessageHandler?: FLICManagerMessageHandler,
    flicButtonMessageHandler?: FLICButtonMessageHandler,
    flicManagerDelegate?: FLICManagerDelegate,
    flicButtonDelegate?: FLICButtonDelegate,
    bridge: Flic2Plugin = Flic2,
): FLICManager {
  if(!sharedInstance){
    setSharedInstance(new FLICManager(
        bridge,
        allowRunInBackground,
        flicManagerMessageHandler,
        flicButtonMessageHandler,
        flicManagerDelegate,
        flicButtonDelegate,
    ))
  } else {
    if(allowRunInBackground
        || flicManagerMessageHandler
        || flicButtonMessageHandler
        || flicManagerDelegate
        || flicButtonDelegate
        || bridge) {
      console.warn("FLICManager singleton already initialized! (Almost!...) Ignoring parameters.")
      // ...however, this may happen when client is hot-reloaded, so pass on the new handlers and delegates
      sharedInstance.registerFlicManagerMessageHandler(flicManagerMessageHandler)
      sharedInstance.registerFlicManagerDelegate(flicManagerDelegate)
      sharedInstance.registerFlicButtonMessageHandler(flicButtonMessageHandler)
      sharedInstance.registerFlicButtonDelegate(flicButtonDelegate)
    }
  }
  return sharedInstance
}

export * from './definitions';
