# capacitor-flic2
Capacitor plugin for Flic2lib

## Links:
GitHub: https://github.com/Boerrild/capacitor-flic2
Flic2 Docs: https://github.com/50ButtonsEach/flic2lib-ios/wiki/Documentation
Capacitor: https://capacitorjs.com/docs/plugins/ios

## Build

    npm run build

## Install locally build version

    npm install ../capacitor-flic2
    npx cap sync

### Unlinking the Plugin

    npm uninstall capacitor-flic2




# Log

### 2024-02-16

Overvejer at re-implementere hele broen mellem swift og js:




### 2023-12-26
- Oprettet projekt og klargjort
  (se https://capacitorjs.com/docs/plugins/creating-plugins)

      npm init @capacitor/plugin@latest

med følgende input:

    Need to install the following packages: @capacitor/create-plugin@0.10.0, Ok to proceed? 
    -> y
    ✔ What should be the npm package of your plugin?
    -> capacitor-flic2
    ✔ What directory should be used for your plugin?
    -> capacitor-flic2
    ✔ What should be the Package ID for your plugin?
    
        Package IDs are unique identifiers used in apps and plugins. For plugins,
        they're used as a Java namespace. They must be in reverse domain name
        notation, generally representing a domain name that you or your company owns.
    
    -> com.capfire.capacitor.plugins.flic2
    ✔ What should be the class name for your plugin?
    -> Flic2
    ✔ What is the repository URL for your plugin?
    -> https://github.com/Boerrild/capacitor-flic2
    ✔ (optional) Who is the author of this plugin?
    -> Christoffer Boerrild
    ✔ What license should be used for your plugin?
    -› other...
    ? Enter a SPDX license identifier for your plugin.
    -> CC0 1.0 Universal
    ✔ Enter a short description of plugin features.
    -> Capacitor plugin for Flic2 lib
    
    ...
    
    Need to install the following packages:
    @capacitor/create-app@0.2.1
    Ok to proceed? (y) y

Build:

    npm run build

- kopier filer fra https://github.com/50ButtonsEach/fliclib-ios ind i 'flic2lib/ios'

      npm install
      npm run build   

- åben 'ios/Plugin.xcworkspace' fra Finder (IKKE 'Plugin.xcodeproj' !!!)

- (fra Finder) træk 'flic2lib/ios/flic2lib.xcframework' ind i Xcode '/Plugin/General/Frameworks and Libraries' og sæt Embed til 'Embed & Sign'
- (har gentaget det samme for andre steder ...ikke sikker på hvad der hjalp!?)

- Sæt '/Plugin/Build Settings/Apple Clang - Language - Modules/Allow Non-modular includes in Framework Modules' til Yes

- Ret filen 'CapacitorFlic2.podspec' ved at tilføje linjen:

       s.ios.vendored_frameworks = 'flic2lib/ios/flic2lib.xcframework'

- Rettet Flic.swift, Flic2Plugin.m etc. (kopieret fra cs8)



### Git repository
Tilføjet til github:

    git remote add origin git@github.com:Boerrild/capacitor-flic2.git
    git branch -M main
    git push -u origin main


--- 

_(original text on how to install plugin from npm, given it was ever published there)_
## Install

```bash
npm install capacitor-flic2
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`buttons()`](#buttons)
* [`receiveButtonEvents(...)`](#receivebuttonevents)
* [`registerFlicButtonDelegate(...)`](#registerflicbuttondelegate)
* [`registerFLICButtonScannerStatusEventHandler(...)`](#registerflicbuttonscannerstatuseventhandler)
* [`configure(...)`](#configure)
* [`scanForButtons(...)`](#scanforbuttons)
* [`stopScan()`](#stopscan)
* [`forgetButton(...)`](#forgetbutton)
* [`scanForButtonsWithStateChangeHandler(...)`](#scanforbuttonswithstatechangehandler)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

// demo of usage of capacitor plugin todo - slet
Flic2.echo({ value: 'Hello World!' }).then(value =&gt; {
    console.log('Response from native:', value)
});

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### buttons()

```typescript
buttons() => Promise<{ buttons: FLICButton[]; }>
```

**Returns:** <code>Promise&lt;{ buttons: FLICButton[]; }&gt;</code>

--------------------


### receiveButtonEvents(...)

```typescript
receiveButtonEvents(callback: ButtonDelegate) => Promise<CallbackID>
```

Registrerer callback som modtager af alle click-events fra Flic-manageren

| Param          | Type                                                      |
| -------------- | --------------------------------------------------------- |
| **`callback`** | <code><a href="#buttondelegate">ButtonDelegate</a></code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### registerFlicButtonDelegate(...)

```typescript
registerFlicButtonDelegate(callbackHandler: CallbackMethodEventHandler) => Promise<CallbackID>
```

Registrerer en <a href="#callbackmethodeventhandler">CallbackMethodEventHandler</a> som modtager af alle click-events fra Flic-manageren
Der kan kun registreres een handler. Senest registrerede handler vinder.

| Param                 | Type                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| **`callbackHandler`** | <code><a href="#callbackmethodeventhandler">CallbackMethodEventHandler</a></code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### registerFLICButtonScannerStatusEventHandler(...)

```typescript
registerFLICButtonScannerStatusEventHandler(callbackHandler: FLICButtonScannerStatusEventHandlerCallback) => Promise<CallbackID>
```

Registrerer en <a href="#callbackmethodeventhandler">CallbackMethodEventHandler</a> som modtager af alle FLICScannerStatusEvents som opstår under scanning
Der kan kun registreres een handler. Senest registrerede handler vinder.

| Param                 | Type                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **`callbackHandler`** | <code><a href="#flicbuttonscannerstatuseventhandlercallback">FLICButtonScannerStatusEventHandlerCallback</a></code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### configure(...)

```typescript
configure(options: { background: boolean; }) => void
```

| Param         | Type                                  |
| ------------- | ------------------------------------- |
| **`options`** | <code>{ background: boolean; }</code> |

--------------------


### scanForButtons(...)

```typescript
scanForButtons(options: { senderId: string; }) => void
```

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ senderId: string; }</code> |

--------------------


### stopScan()

```typescript
stopScan() => void
```

--------------------


### forgetButton(...)

```typescript
forgetButton(options: { uuid: string; }) => void
```

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ uuid: string; }</code> |

--------------------


### scanForButtonsWithStateChangeHandler(...)

```typescript
scanForButtonsWithStateChangeHandler(options: { senderId: string; }, callback: (message: ScanForButtonsWithStateChangeHandlerResponse) => void) => Promise<CallbackID>
```

| Param          | Type                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`**  | <code>{ senderId: string; }</code>                                                                                                          |
| **`callback`** | <code>(message: <a href="#scanforbuttonswithstatechangehandlerresponse">ScanForButtonsWithStateChangeHandlerResponse</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### Interfaces


#### FLICButton

An instance of this class represents a physical Flic 2 button.

| Prop                   | Type                                                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`identifier`**       | <code>string</code>                                                     | This identifier is guaranteed to be the same for each Flic paired to a particular iOS device. Thus it can be used to identify a Flic within an app. However, If you need to identify Flics cross different apps on different iOS devices, then you should have a look at either the uuid, serialNumber or bluetoothAddress.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`name`**             | <code>string</code>                                                     | The bluetooth advertisement name of the Flic. This will be the same name that is shown by iOS it its bluetooth settings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **`nickname`**         | <code>string</code>                                                     | With this property you can read out the display name that the user may change in for example the Flic app. This value can also be changed from third party apps integrating this framework (including your app). The purpose of this is to provide more human readable name that the user can use to identify its Flic's across apps. For example "Kitchen Flic" or "Bedroom Lights". The nickname has a maximum length limit of 23 bytes. Keep in mind that this is the length in bytes, and not the number of UTF8 characters (which may be up to 4 bytes long). If you write anything longer than 23 bytes then the nickname will automatically be truncated to at most 23 bytes. When truncating the string, the framework will always cut between UTF8 character, so you don't have to worry about writing half an emoji, for example. |
| **`bluetoothAddress`** | <code>string</code>                                                     | The bluetooth address of the Flic. This will be a string representation of a 49 bit long address. Example: "00:80:e4:da:12:34:56"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **`uuid`**             | <code>string</code>                                                     | This is a unique identifier string that best used to identify a Flic. This is for example used to identify Flics on all our API endpoints.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`serialNumber`**     | <code>string</code>                                                     | The serial number is a production identifier that is printed on the backside of the Flic inside the battery hatch. This serves no other purpose than allowing a user to identify a button by manually looking at it. Can be useful in some cases.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **`triggerMode`**      | <code><a href="#flicbuttontriggermode">FLICButtonTriggerMode</a></code> | Use this property to let the flic2lib know what type of click events you are interested it. By default you will get Click, Double Click and Hold events. However, if you for example are only interested in Click events then you can set this property to FLICButtonTriggerModeClick. Doing so will allow the flic2lib to deliver the events quicker since it can now ignore Double Click and Hold.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **`state`**            | <code><a href="#flicbuttonstate">FLICButtonState</a></code>             | Lets you know if the Flic is Connected, Disconnected, Connecting, or Disconnecting.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **`pressCount`**       | <code>number</code>                                                     | The number of times the Flic has been clicked since last time it booted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **`firmwareRevision`** | <code>number</code>                                                     | The revision of the firmware currently running on the Flic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`isReady`**          | <code>boolean</code>                                                    | When a Flic connects it will go through a quick cryptographic verification to ensure that it is both a genuine Flic and that it is the correct Flic. Once this is completed this property will be set to YES and it is not until after that that you will start receiving click events (if any). As soon as the button disconnects this will be set to NO again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **`batteryVoltage`**   | <code>number</code>                                                     | This will be the last know battery sample taken on the Flic. If this value is 0 then you should assume that no sample has yet been taken. It is important to know that the voltage may fluctuate depending on many factors, such as temperature and workload. For example, heavy usage of the LED will temporarily lower the voltage, but it is likely to recover shortly after. Therefore, we do not recommend to exactly translate this value into a battery percentage, instead consider showing a "change the battery soon"-status in your app once the voltage goes below 2.65V.                                                                                                                                                                                                                                                       |
| **`isUnpaired`**       | <code>boolean</code>                                                    | If this property is YES, then it means that this app's pairing with this specific Flic is no longer valid. This can for example occur if the Flic has been factory reset, or if the maximum number of pairings have been reached. In this case you will need to delete the button from the manager and then scan for it again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **`latencyMode`**      | <code><a href="#fliclatencymode">FLICLatencyMode</a></code>             | Lets you switch between two different latency modes. For most use-cases it is recommended to keep the default FLICLatencyModeNormal. FLICLatencyModeLow should ideally only be used for foreground applications, such as games, where low latency is needed. Keep in mind that the energy consumption will be significantly higher in the low latency mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`connect`**          | <code>() =&gt; void</code>                                              | Attempts to connect the Flic. If the Flic is not available, due to either being out of range or not advertising, then it will be connected once it becomes available as this call does not time out. This is often called a pending connection. It can be canceled by calling disconnect. (void)connect;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **`disconnect`**       | <code>() =&gt; void</code>                                              | Disconnect a currently connected Flic or cancel a pending connection. (void)disconnect;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |


#### FLICButtonEvent

| Prop         | Type                                              |
| ------------ | ------------------------------------------------- |
| **`button`** | <code><a href="#flicbutton">FLICButton</a></code> |
| **`event`**  | <code>string</code>                               |
| **`queued`** | <code>boolean</code>                              |
| **`age`**    | <code>number</code>                               |


#### CallbackMethodEvent

En generisk callback argument type som kan bruges til at repræsentere et specifikt metodekald på en delegate.

Anvendes når der på native-siden (swift) er et delegate-objekt hvor der kan forekomme "callbacks" på mere end een
metode, som alle skal kunne propageres til JS siden over samme callback handler.

| Prop            | Type                |
| --------------- | ------------------- |
| **`method`**    | <code>string</code> |
| **`arguments`** | <code>any</code>    |


#### FLICButtonScannerStatusEventMessage

| Prop         | Type                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| **`status`** | <code><a href="#flicbuttonscannerstatusevent">FLICButtonScannerStatusEvent</a></code> |


### Type Aliases


#### ButtonDelegate

<code>(message: <a href="#flicbuttonevent">FLICButtonEvent</a> | null, err?: undefined): void</code>


#### CallbackID

<code>string</code>


#### CallbackMethodEventHandler

repræsenterer en callback-metode der modtager svar fra capacitor plugin af typen CallbackEvent og
oversætter kan herefter fx oversætte/videresende dem som individuelle metode-kald på et delegate object

<code>(response: <a href="#callbackmethodevent">CallbackMethodEvent</a>): void</code>


#### FLICButtonScannerStatusEventHandlerCallback

<code>(message: <a href="#flicbuttonscannerstatuseventmessage">FLICButtonScannerStatusEventMessage</a>): void</code>


#### ScanForButtonsWithStateChangeHandlerResponse

<code>{ stateChangeHandler?: { event: <a href="#flicbuttonscannerstatusevent">FLICButtonScannerStatusEvent</a> }, completion?: { button: <a href="#flicbutton">FLICButton</a> }, error?: any }</code>


### Enums


#### FLICButtonTriggerMode

| Members                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`FLICButtonTriggerModeClickAndHold`**               | Used to distinguish between only click and hold. Click will be fired when the button is released if it was pressed for maximum 1 second. Otherwise, hold will be fired 1 second after the button was pressed. Click will then not be fired upon release. Since this option will only distinguish between click and hold it does not have to take double click into consideration. This means that the click event can be sent immediately on button release rather than to wait for a possible double click. Note: this will be the default behavior.                                                                                                                                                                                       |
| **`FLICButtonTriggerModeClickAndDoubleClick`**        | Used to distinguish between only single click and double click. Double click will be registered if the time between two button down events was at most 0.5 seconds. The double click event will then be fired upon button release. If the time was more than 0.5 seconds, a single click event will be fired; either directly upon button release if the button was down for more than 0.5 seconds, or after 0.5 seconds if the button was down for less than 0.5 seconds.                                                                                                                                                                                                                                                                  |
| **`FLICButtonTriggerModeClickAndDoubleClickAndHold`** | Used to distinguish between single click, double click and hold. If the time between the first button down and button up event was more than 1 second, a hold event will be fired. Else, double click will be fired if the time between two button down events was at most 0.5 seconds. The double click event will then be fired upon button release. If the time was more than 0.5 seconds, a single click event will be fired; either directly upon button release if the button was down for more than 0.5 seconds, or after 0.5 seconds if the button was down for less than 0.5 seconds. Note: Three fast consecutive clicks means one double click and then one single click. Four fast consecutive clicks means two double clicks.* |
| **`FLICButtonTriggerModeClick`**                      | This mode will only send click and the event will be sent directly on buttonDown. This will be the same as listening for buttonDown. Note: This is optimal if your application requires the lowest latency possible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |


#### FLICButtonState

| Members             | Value          | Description                                                                                                                                                                                                     |
| ------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`disconnected`**  | <code>0</code> | The Flic is currently disconnected and a pending connection is not set. The Flic will not connect again unless you manually call the connect method.                                                            |
| **`connecting`**    |                | The Flic is currently disconnected, but a pending connection is set. The Flic will automatically connect again as soon as it becomes available.                                                                 |
| **`connected`**     |                | The Flic currently has a bluetooth connection with the phone. This does not necessarily mean that it has been verified. Please listen for the isReady event, or read the isReady property, for that information |
| **`disconnecting`** |                | The Flic is currently connected, but is attempting to disconnect. Typically this state will only occur for very short periods of time before either switching to the connecting or disconnected state again.    |


#### FLICLatencyMode

| Members                     | Description                                                                                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`FLICLatencyModeNormal`** | For most use-cases it is recommended to keep the default FLICLatencyModeNormal                                                                                                                                         |
| **`FLICLatencyModeLow`**    | FLICLatencyModeLow should ideally only be used for foreground applications, such as games, where low latency is needed. Keep in mind that the energy consumption will be significantly higher in the low latency mode. |


#### FLICButtonScannerStatusEvent

| Members                  | Description                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **`discovered`**         | A public Flic has been discovered and a connection attempt will now be made.                                              |
| **`connected`**          | The Flic was successfully bluetooth connected.                                                                            |
| **`verified`**           | The Flic has been verified and unlocked for this app. The Flic will soon be delivered in the assigned completion handler. |
| **`verificationFailed`** | The Flic could not be verified. The completion handler will soon run to let you know what the error was.                  |
| **`scanningStarted`**    | The scanning has been initiated (typescript only - not in native api)                                                     |
| **`scanningStopped`**    | The scanning has stopped (typescript only - not in native api)                                                            |

</docgen-api>
