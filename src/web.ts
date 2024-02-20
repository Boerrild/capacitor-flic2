import {WebPlugin} from '@capacitor/core';

import type {
    CallbackID,
    Flic2Plugin,
    FLICButton,
    FLICButtonScannerStatusEventHandlerCallback,
    FLICButtonTriggerMode,
    FLICLatencyMode,
    ScanForButtonsWithStateChangeHandlerResponse,
    FLICButtonMessageHandler,
    FLICManagerMessageHandler} from './definitions';
import {FLICManagerState} from "./definitions";

/**
 * Denne klasse er en DUMMY som bruges som FALLBACK når capacitor ikke er i spil, dvs ved kørsel i browser
 */
export class Flic2Web extends WebPlugin implements Flic2Plugin {
    async echo(options: { value: string }): Promise<{ value: string }> {
        console.log('ECHO', options);
        return options;
    }

    buttons(): Promise<{ buttons: FLICButton[] }> {
        return Promise.resolve({buttons: [
                {"latencyMode":0,"serialNumber":"BG14-D33595","pressCount":2595,"nickname":"det nye navn","bluetoothAddress":"00:80:E4:DA:79:9C:8C","name":"Flic BG14-D33595","state":2,"firmwareRevision":11,"batteryVoltage":3.0199217796325684,"isReady":true,"isUnpaired":false,"triggerMode":3,"uuid":"4db8081361424d3c8e7a735e69cd8103"} as FLICButton
            ]});
    }

    configure(options: { background: boolean }): void {
        console.log('configure', options);
    }

    // receiveButtonEvents(callback: ButtonDelegate): Promise<CallbackID> {
    //     console.log('recieveButtonEvents', callback);
    //     return Promise.resolve('recieveButtonEvents');
    // }
    //
    // scanForButtons(options: { senderId: string }): void {
    //     console.log('startScan', options);
    // }

    stopScan(): void {
        console.log('stopScan');
    }
    registerFLICManagerMessageHandler(options: Record<string, never>, callback: FLICManagerMessageHandler): Promise<string> {
        console.log('registerFLICManagerDelegate', options, callback);
        return Promise.resolve('registerFLICManagerDelegate');
    }

    registerFLICButtonMessageHandler(options: Record<string, never>, callback: FLICButtonMessageHandler): Promise<CallbackID> {
        console.log('registerFLICButtonDelegate', options, callback);
        return Promise.resolve('registerFLICButtonDelegate');
    }

    registerFLICButtonScannerStatusEventHandler(callbackHandler: FLICButtonScannerStatusEventHandlerCallback): Promise<CallbackID> {
        console.log('registerFLICButtonScannerStatusEventHandler', callbackHandler);
        return Promise.resolve('registerFLICButtonScannerStatusEventHandler');
    }

    configureWithDelegate(options: { background: boolean }) : void {
        console.log(options)
    }

    connect(options: { uuid: string }): void {
        console.log(options)
    }

    disconnect(options: { uuid: string }): void {
        console.log(options)
    }

    forgetButton(options: { uuid: string }): Promise<{ uuid: string }> {
        console.log(options)
        return Promise.resolve({uuid: ""});
    }

    getIsScanning(): Promise<{ isScanning: boolean }> {
        return Promise.resolve({isScanning: false});
    }

    getState(): Promise<{ state: FLICManagerState }> {
        return Promise.resolve({state: FLICManagerState.unsupported});
    }

    scanForButtonsWithStateChangeHandler(options: Record<string, never>, callback: (message: ScanForButtonsWithStateChangeHandlerResponse) => void): Promise<CallbackID> {
        console.log(options, callback)
        return Promise.resolve("id");
    }

    setNickname(options: { uuid: string; nickname: string }): Promise<{ button: FLICButton }> {
        console.log(options)
        return Promise.reject("Unsupported");
    }

    setTriggerMode(options: { uuid: string; triggerMode: FLICButtonTriggerMode }): Promise<{ button: FLICButton }> {
        console.log(options)
        return Promise.reject("Unsupported");
    }

    setLatencyMode(options: { uuid: string; latencyMode: FLICLatencyMode }): Promise<{ button: FLICButton }> {
        console.log(options)
        return Promise.reject("Unsupported");
    }
}
