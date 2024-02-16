import {WebPlugin} from '@capacitor/core';
import * as console from "console";

import type {
    ButtonDelegate,
    CallbackID,
    CallbackMethodEventHandler,
    Flic2Plugin,
    FLICButton,
    FLICButtonScannerStatusEventHandlerCallback,
    ScanForButtonsWithStateChangeHandlerResponse
} from './definitions';

/**
 * Denne klasse er en DUMMY som bruges som FALLBACK når capacitor ikke er i spil, dvs ved kørsel i browser
 */
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

    receiveButtonEvents(callback: ButtonDelegate): Promise<CallbackID> {
        console.log('recieveButtonEvents', callback);
        return Promise.resolve('recieveButtonEvents');
    }

    scanForButtons(options: { senderId: string }): void {
        console.log('startScan', options);
    }

    stopScan(): void {
        console.log('stopScan');
    }

    registerFlicButtonDelegate(callback: CallbackMethodEventHandler): Promise<CallbackID> {
        console.log('registerFlicButtonDelegate', callback);
        return Promise.resolve('registerFlicButtonDelegate');
    }

    registerFLICButtonScannerStatusEventHandler(callbackHandler: FLICButtonScannerStatusEventHandlerCallback): Promise<CallbackID> {
        console.log('registerFLICButtonScannerStatusEventHandler', callbackHandler);
        return Promise.resolve('registerFLICButtonScannerStatusEventHandler');
    }

    scanForButtonsWithStateChangeHandler(options: {
        senderId: string
    }, callback: (message: ScanForButtonsWithStateChangeHandlerResponse) => void): Promise<CallbackID> {
        console.log(options, callback)
        return Promise.resolve("scanForButtonsWithStateChangeHandler");
    }
}
