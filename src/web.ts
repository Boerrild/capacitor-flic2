import {WebPlugin} from '@capacitor/core';
import * as console from "console";

import type {ButtonDelegate, CallbackID, Flic2Plugin, FLICButton} from './definitions';

export class Flic2Web extends WebPlugin implements Flic2Plugin {
    async echo(options: { value: string }): Promise<{ value: string }> {
        console.log('ECHO', options);
        return options;
    }

    buttons(): Promise<{ buttons: FLICButton[] }> {
        return Promise.resolve({buttons: []});
    }

    configure(options: { background: boolean }): void {
        console.log('configure', options);
    }

    forgetButton(options: { uuid: string }): void {
        console.log('forgetButton', options);
    }

    recieveButtonEvents(callback: ButtonDelegate): Promise<CallbackID> {
        console.log('recieveButtonEvents', callback);
        return Promise.resolve('recieveButtonEvents');
    }

    startScan(options: { senderId: string }): void {
        console.log('startScan', options);
    }

    stopScan(): void {
        console.log('stopScan');
    }
}
