import {Capacitor, registerPlugin} from '@capacitor/core';

export type CallbackID = string;

export type ButtonDelegate = (message: FLICButtonEvent | null, err?: any) => void;
export type CallbackWrapper = (response: CallbackEvent) => void;

export interface FLICButtonEvent {
  button: FLICButton;
  event: string;
  queued: boolean;
  age: number;
}
export interface CallbackEvent {
  method: string
  arguments: any
}

export interface Flic2Plugin {
  /**
   * // demo of usage of capacitor plugin todo - slet
   * Flic2.echo({ value: 'Hello World!' }).then(value => {
   *     console.log('Response from native:', value)
   * });
   */
  echo(options: { value: string }): Promise<{ value: string }>;

  buttons(): Promise<{ buttons: FLICButton[]}>; //Promise<{ buttons: [any] }>;

  /**
   * Registrerer callback som modtager af alle click-events fra Flic-manageren
   * @param callback
   */
  receiveButtonEvents(callback: ButtonDelegate): Promise<CallbackID>;

  registerFlicButtonDelegate(callback: CallbackWrapper): Promise<CallbackID>;

  configure(options: { background: boolean }): void;

  startScan(options: { senderId: string }): void;

  stopScan(): void;

  forgetButton(options: { uuid: string }): void;
}


const Flic2 = (Capacitor.isNativePlatform()) ? registerPlugin<Flic2Plugin>('Flic2LibPlugin') : undefined;

export default Flic2;

/**
 * Registrerer en FLICButtonDelegate som modtager af alle FLICButton hændelser fra Flic2-plugin
 *
 * Der kan kun registreres een delegate, og seneste registrering vinder.
 *
 * @param flic2Plugin Flic2 instansen som udstilles af pluginnet
 *                    (...ved ikke hvorfor den ikke kan bruge sin egen Flic-reference
 *                    men det virker i hvert fald ikke, måske noget med timing!?)
 * @param buttonDelegate den instans af FLICButtonDelegate der skal modtage hændelserne
 */
export function registerFlicButtonDelegate(flic2Plugin:Flic2Plugin, buttonDelegate:FLICButtonDelegate): Promise<CallbackID> | undefined {
  console.log('registerFlicButtonDelegate', flic2Plugin)
  return flic2Plugin.registerFlicButtonDelegate(flicButtonDelegateCallbackWrapper(buttonDelegate))
}

const flicButtonDelegateCallbackWrapper = (delegate: FLICButtonDelegate) => (response: CallbackEvent) : void => {
  console.log('flicButtonDelegateCallbackWrapper received CallbackEvent', response)
  switch (response.method) {
    case 'buttonDidConnect':
      delegate.buttonDidConnect(response.arguments.button); break
    case 'buttonIsReady':
      delegate.buttonIsReady(response.arguments.button); break
    case 'buttonDidDisconnectWithError':
      delegate.buttonDidDisconnectWithError(response.arguments.button); break
    case 'buttonDidFailToConnectWithError':
      delegate.buttonDidFailToConnectWithError(response.arguments.button); break
    case 'buttonDidReceiveButtonClick':
      delegate.buttonDidReceiveButtonClick(response.arguments.button, response.arguments.queued, response.arguments.age); break
    case 'buttonDidReceiveButtonDoubleClick':
      delegate.buttonDidReceiveButtonDoubleClick(response.arguments.button, response.arguments.queued, response.arguments.age); break
    case 'buttonDidReceiveButtonDown':
      delegate.buttonDidReceiveButtonDown(response.arguments.button, response.arguments.queued, response.arguments.age); break
    case 'buttonDidReceiveButtonHold':
      delegate.buttonDidReceiveButtonHold(response.arguments.button, response.arguments.queued, response.arguments.age); break
    case 'buttonDidReceiveButtonUp':
      delegate.buttonDidReceiveButtonUp(response.arguments.button, response.arguments.queued, response.arguments.age); break
    case 'buttonDidUnpairWithError':
      delegate.buttonDidUnpairWithError(response.arguments.button, response.arguments.error); break
    case 'buttonDidUpdateBatteryVoltage':
      delegate.buttonDidUpdateBatteryVoltage(response.arguments.button, response.arguments.voltage); break
    case 'buttonDidUpdateNickname':
      delegate.buttonDidUpdateNickname(response.arguments.button, response.arguments.nickname); break
  }
}

/**
 * An instance of this class represents a physical Flic 2 button.
 */
export interface FLICButton {
  /**
   * This identifier is guaranteed to be the same for each Flic paired to a particular iOS device. Thus it can be used
   * to identify a Flic within an app. However, If you need to identify Flics cross different apps on different iOS
   * devices, then you should have a look at either the uuid, serialNumber or bluetoothAddress.
   *
   * @property(readonly, nonatomic, strong, nonnull) NSUUID *identifier;
   */
  identifier: string;

  /**
   * The delegate that will receive events related to this particular Flic. You can either set this delegate manually
   * for each button, or let the manager do so automatically using the buttonDelegate as default.
   *
   * @property(weak, nonatomic, nullable) id<FLICButtonDelegate> delegate;
   */
  //delegate: string;

  /**
   * The bluetooth advertisement name of the Flic. This will be the same name that is shown by iOS it its bluetooth
   * settings.
   *
   * @property(nonatomic, readonly, strong, nullable) NSString *name;
   */
  name: string;

  /**
   * With this property you can read out the display name that the user may change in for example the Flic app. This
   * value can also be changed from third party apps integrating this framework (including your app). The purpose of
   * this is to provide more human readable name that the user can use to identify its Flic's across apps. For example
   * "Kitchen Flic" or "Bedroom Lights". The nickname has a maximum length limit of 23 bytes. Keep in mind that this
   * is the length in bytes, and not the number of UTF8 characters (which may be up to 4 bytes long). If you write
   * anything longer than 23 bytes then the nickname will automatically be truncated to at most 23 bytes. When
   * truncating the string, the framework will always cut between UTF8 character, so you don't have to worry about
   * writing half an emoji, for example.
   *
   * @property(nonatomic, readwrite, strong, nullable) NSString *nickname;
   */
  nickname: string;

  /**
   * The bluetooth address of the Flic. This will be a string representation of a 49 bit long address.
   * Example: "00:80:e4:da:12:34:56"
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString *bluetoothAddress;
   */
  bluetoothAddress: string;

  /**
   * This is a unique identifier string that best used to identify a Flic. This is for example used to identify Flics
   * on all our API endpoints.
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString *uuid;
   */
  uuid: string;

  /**
   * The serial number is a production identifier that is printed on the backside of the Flic inside the battery
   * hatch. This serves no other purpose than allowing a user to identify a button by manually looking at it. Can be
   * useful in some cases.
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString * serialNumber;
   */
  serialNumber: string;

  /**
   * Use this property to let the flic2lib know what type of click events you are interested it. By default you will
   * get Click, Double Click and Hold events. However, if you for example are only interested in Click events then you
   * can set this property to FLICButtonTriggerModeClick. Doing so will allow the flic2lib to deliver the events
   * quicker since it can now ignore Double Click and Hold.
   *
   * @property(nonatomic, readwrite) FLICButtonTriggerMode triggerMode;
   */
  triggerMode: FLICButtonTriggerMode;

  /**
   * Lets you know if the Flic is Connected, Disconnected, Connecting, or Disconnecting.
   *
   * @property(nonatomic, readonly) FLICButtonState state;
   */
  state: string;

  /**
   * The number of times the Flic has been clicked since last time it booted.
   *
   * @property(nonatomic, readonly) uint32_t pressCount;
   */
  pressCount: number;

  /**
   * The revision of the firmware currently running on the Flic.
   *
   * @property(nonatomic, readonly) uint32_t firmwareRevision;
   */
  firmwareRevision: number;

  /**
   * When a Flic connects it will go through a quick cryptographic verification to ensure that it is both a genuine
   * Flic and that it is the correct Flic. Once this is completed this property will be set to YES and it is not until
   * after that that you will start receiving click events (if any). As soon as the button disconnects this will be
   * set to NO again.
   *
   * @property(nonatomic, readonly) BOOL isReady;
   */
  isReady: boolean;

  /**
   * This will be the last know battery sample taken on the Flic. If this value is 0 then you should assume that no
   * sample has yet been taken. It is important to know that the voltage may fluctuate depending on many  factors,
   * such as temperature and workload. For example, heavy usage of the LED will temporarily lower the voltage, but it
   * is likely to recover shortly after. Therefore, we do not recommend to exactly translate this value into a battery
   * percentage, instead consider showing a "change the battery soon"-status in your app once the
   * voltage goes below 2.65V.
   *
   * @property(nonatomic, readonly) float batteryVoltage;
   */
  batteryVoltage: number;

  /**
   * If this property is YES, then it means that this app's pairing with this specific Flic is no longer valid. This
   * can for example occur if the Flic has been factory reset, or if the maximum number of pairings have been reached.
   * In this case you will need to delete the button from the manager and then scan for it again.
   *
   * @property(nonatomic, readonly) BOOL isUnpaired;
   */
  isUnpaired: boolean;

  /**
   * Lets you switch between two different latency modes. For most use-cases it is recommended to keep the default
   * FLICLatencyModeNormal. FLICLatencyModeLow should ideally only be used for foreground applications, such as games,
   * where low latency is needed. Keep in mind that the energy consumption will be significantly higher in the low
   * latency mode.
   *
   * @property(nonatomic, readwrite) FLICLatencyMode latencyMode;
   */
  latencyMode: FLICLatencyMode;

  /**
   * Attempts to connect the Flic. If the Flic is not available, due to either being out of range or not advertising,
   * then it will be connected once it becomes available as this call does not time out. This is often called a pending
   * connection. It can be canceled by calling disconnect.
   *
   * (void)connect;
   */
   connect: () => void

  /**
   * Disconnect a currently connected Flic or cancel a pending connection.
   *
   * (void)disconnect;
   */
  disconnect: () => void
}

/**
 * The different trigger modes that you can configure the Flic button to use.
 */
export enum FLICButtonTriggerMode {

  /**
   * Used to distinguish between only click and hold.
   *
   * Click will be fired when the button is released if it was pressed for maximum 1 second. Otherwise, hold will be
   * fired 1 second after the button was pressed. Click will then not be fired upon release. Since this option will
   * only distinguish between click and hold it does not have to take double click into consideration.
   * This means that the click event can be sent immediately on button release rather than to wait for a possible
   * double click.
   *
   * Note: this will be the default behavior.
   */
  FLICButtonTriggerModeClickAndHold,

  /**
   * Used to distinguish between only single click and double click.
   * Double click will be registered if the time between two button down events was at most 0.5 seconds.
   * The double click event will then be fired upon button release.
   *
   * If the time was more than 0.5 seconds, a single click event will be fired; either directly upon button release
   * if the button was down for more than 0.5 seconds, or after 0.5 seconds if the button was down for less than 0.5
   * seconds.
   */
  FLICButtonTriggerModeClickAndDoubleClick,

  /**
   * Used to distinguish between single click, double click and hold.
   *
   * If the time between the first button down and button up event was more than 1 second, a hold event will be fired.
   * Else, double click will be fired if the time between two button down events was at most 0.5 seconds.
   * The double click event will then be fired upon button release.
   *
   * If the time was more than 0.5 seconds, a single click event will be fired; either directly upon button release if
   * the button was down for more than 0.5 seconds, or after 0.5 seconds if the button was down for less than 0.5
   * seconds.
   *
   * Note: Three fast consecutive clicks means one double click and then one single click. Four fast consecutive
   * clicks means two double clicks.*
   */
  FLICButtonTriggerModeClickAndDoubleClickAndHold,

  /**
   * This mode will only send click and the event will be sent directly on buttonDown.
   * This will be the same as listening for buttonDown.
   *
   * Note: This is optimal if your application requires the lowest latency possible.
   */
  FLICButtonTriggerModeClick
}

/**
 * The different latency modes that you can configure the Flic button to use.
 */
export enum FLICLatencyMode {

  /**
   * For most use-cases it is recommended to keep the default FLICLatencyModeNormal
   */
  FLICLatencyModeNormal,

  /**
   * FLICLatencyModeLow should ideally only be used for foreground applications, such as games, where low latency is
   * needed. Keep in mind that the energy consumption will be significantly higher in the low latency mode.
   */
  FLICLatencyModeLow
}

/**
 * The delegate of a FLICButton instance must adopt the FLICButtonDelegate protocol. All calls to the delegate methods
 * will be on the main dispatch queue.
 */
export interface FLICButtonDelegate {
  /**
   * This method is called every time the Flic establishes a new bluetooth connection. Keep in mind that you also have
   * to wait for the buttonIsReady: before the Flic is ready to be used.
   * (void)buttonDidConnect:(FLICButton *)button;
   *
   * @param button   The FLICButton instance that the event originated from.
   */
  buttonDidConnect: (button: FLICButton) => void

  /**
   * This method is called after each connection once the Flic has been cryptographically verified. You will not receive
   * any click events before this is called.
   *
   * (void)buttonIsReady:(FLICButton *)button;
   *
   * @param button   The FLICButton instance that the event originated from.
   */
  buttonIsReady: (button: FLICButton) => void

  /**
   * This method is called every time the bluetooth link with the Flic is lost. This can occur for several different reasons. The most common would be that
   *                  the iOS device and the Flic is no longer within range of each other.
   *
   * (void)button:(FLICButton *)button didDisconnectWithError:(NSError * _Nullable)error;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param error    This error lets you know the reason for the disconnect. An error does not necessarily mean that
   *                 something went wrong.
   */
   buttonDidDisconnectWithError: (button: FLICButton) => void

  /**
   * This method is called when a connection attempt to a button fails. This indicates that something has gone wrong and
   * that the pending connection will not be reset.
   *
   * (void)button:(FLICButton *)button didFailToConnectWithError:(NSError * _Nullable)error;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param error    This error lets you know why the connection attempt failed.
   */
   buttonDidFailToConnectWithError: (button: FLICButton) => void

//  @optional TODO

  /**
   * The Flic registered a button down event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonDown:(BOOL)queued age:(NSInteger)age;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param queued   Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age      If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
   buttonDidReceiveButtonDown: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a button up event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonUp:(BOOL)queued age:(NSInteger)age;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param queued   Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age      If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
   buttonDidReceiveButtonUp: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a button click event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonClick:(BOOL)queued age:(NSInteger)age;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param queued   Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age      If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
   buttonDidReceiveButtonClick: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a double click event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonDoubleClick:(BOOL)queued age:(NSInteger)age;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param queued   Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age      If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
   buttonDidReceiveButtonDoubleClick: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a button hold event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonHold:(BOOL)queued age:(NSInteger)age;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param queued   Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age      If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
   buttonDidReceiveButtonHold: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The app no longer has a valid pairing with the Flic button. The isUnpaired property will now be YES and all
   * connection attempts made will immediately fail. To fix this you need to delete the button from the manager and then
   * re-scan it again.
   *
   * (void)button:(FLICButton *)button didUnpairWithError:(NSError * _Nullable)error;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param error    This will always be nil at this time.
   */
   buttonDidUnpairWithError: (button: FLICButton, error:undefined) => void

  /**
   * This callback will be sent once the Flic button updates its battery voltage with a new value. Typically this will
   * occurs a few seconds after the button connects. If you show a battery indicator in you app, then this would be a
   * good place to refresh your UI. Please see the description for the batteryVoltage property for more information.
   *
   * (void)button:(FLICButton *)button didUpdateBatteryVoltage:(float)voltage;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param voltage  Float representation of the latest battery voltage sample.
   */
   buttonDidUpdateBatteryVoltage: (button: FLICButton, voltage: number) => void

  /**
   * If the nickname is updated by another app (including the official Flic app), then you will get this callback
   * letting you know that the name has changed. This may either be in real time (if multiple apps are connected at the
   * same time), or a deayed event that occurs after the button connects (if the nickname was changed while your app was
   * not active). If your app displays this nickname, then this would be a good place to refresh your UI.
   *
   * (void)button:(FLICButton *)button didUpdateNickname:(NSString *)nickname;
   *
   * @param button   The FLICButton instance that the event originated from.
   * @param nickname The new nickname that was sent from the Flic.
   */
   buttonDidUpdateNickname: (button: FLICButton, nickname: string) => void

}
