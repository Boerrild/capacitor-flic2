import {shareReplay, Subject} from 'rxjs';
import type { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export let sharedInstance : FLICManager

export const setSharedInstance = (instance : FLICManager) => {sharedInstance = instance}


/**
 * The plugin bridge interface for interacting with the Flic2 native layer
 */
export interface Flic2Plugin extends FLICManagerPlugin, FLICButtonPlugin {
  /**
   * // demo of usage of capacitor plugin todo - slet
   * Flic2.echo({ value: 'Hello World!' }).then(value => {
   *     console.log('Response from native:', value)
   * });
   */
  echo(options: { value: string }): Promise<{ value: string }>
}

/**
 * This interface is intended to be used as a singleton. It keeps track of all the buttons that have been paired with
 * this particular app and restores them on each application launch.
 */
export interface FLICManagerPlugin {

  /**
   * The delegate that all the FLICManagerDelegate events will be sent to. Usually this is configured only once when the
   * application is first launched, using the #configureWithDelegate method.
   *
   * NOT IMPLEMENTED ON CLIENT SIDE!
   * <code>getDelegate(): Promise<FLICManagerDelegate></code>
   */

  /**
   * Once set, this delegate will automatically be set to every button instance on each application launch. This will
   * also be assigned to new buttons that are discovered using the scanForButtonsWithStateChangeHandler method. Using
   * this delegate also ensures that the click events are delivered as fast as possible when an application is restored
   * in the background.
   *
   * NOT IMPLEMENTED ON CLIENT SIDE!
   * <code>getButtonDelegate(): Promise<FLICButtonDelegate></code>
   */

  /**
   * This is the state of the Flic manager. This state closely resembles the CBManager state of Apple's CoreBluetooth
   * framework. You will only be able to communicate with Flic buttons while the manager is in the
   * FlicManagerStatePoweredOn state.
   */
  getState(): Promise<{ state: FLICManagerState}>

  /**
   * Lets you know if a scan is currently running or not. Reading this value will not affect a scan.
   */
  getIsScanning(): Promise<{isScanning: boolean}>

  /**
   * This class method return the singleton manager, assuming that it has been configured first using the
   * configureWithDelegate method first, otherwise nil is returned.
   *
   * NOT IMPLEMENTED ON CLIENT SIDE!
   * <code>sharedManager(): undefined</code>
   */


  /**
   * Registrerer en FLICManagerMessageHandler som modtager af alle FLICManagerDelegate-events
   * Der kan kun registreres een handler. Senest registrerede handler vinder.
   *
   * @param options must provide an empty object, {}, because callback param has to be second even though we provide no values in options
   *               (work around to avoid plugin warning: "Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated."
   *                see https://github.com/ionic-team/capacitor/blob/0333d8e78f5fe223094d81e72f7692d3218248d3/ios/Capacitor/Capacitor/assets/native-bridge.js#L976 )
   * @param callback
   */
  registerFLICManagerMessageHandler(options: Record<string, never>, callback: FLICManagerMessageHandler): Promise<CallbackID>;

  /**
   * Registrerer en FLICButtonMessageHandler som modtager af alle FLICButtonDelegate-events
   * Der kan kun registreres een handler. Senest registrerede handler vinder.
   *
   * @param options must provide an empty object, {}, because callback param has to be second even though we provide no values in options
   *               (work around to avoid plugin warning: "Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated."
   *                see https://github.com/ionic-team/capacitor/blob/0333d8e78f5fe223094d81e72f7692d3218248d3/ios/Capacitor/Capacitor/assets/native-bridge.js#L976 )
   * @param callback
   */
  registerFLICButtonMessageHandler(options: Record<string, never>, callback: FLICButtonMessageHandler): Promise<CallbackID>;

  /**
   *  This configuration method must be called before the manager can be used. It is recommended that this is done as
   *  soon as possible after your application has launched in order to minimize the delay of any pending click events.
   *  The flic2lib officially only support iOS 12 and up, however, to make it easier for the developer, the framework is
   *  built with a target of iOS 9 and contains slices for both arm64 and armv7. This means that you will be able to
   *  include, and load, the framework in apps that support iOS 9. However, if you try to configure the manager on a
   *  device running iOS 11, or below, then the manager state will switch to FLICManagerStateUnsupported. A good place
   *  to handle this would be in the FLICManagerDelegate#didUpdateSate-method.
   *
   *  @param options The arguments being passed to the native layer:
   *   - param background      Whether you intend to use this application in the background.
   *
   *  CALLBACKS ER IKKE IMPLEMENTERET!
   *  Kald i stedet registerFlicManagerDelegate og registerFlicButtonDelegate før config !!!
   *
   *  @param callback The callback method arguments:
   *   - param delegate        The delegate to be used with the manager singleton.
   *   - param buttonDelegate  The delegate to be automatically assigned to each FLICButton instance.
   */
  //configureWithDelegate(options: { delegate: FLICManagerDelegate, buttonDelegate: FLICButtonDelegate, background: boolean}): Promise<void>
  configureWithDelegate(
    options: { background: boolean }
    //,callback: (message: { managerDelegate: FLICManagerMessage, buttonDelegate:  FLICButtonMessage }) => void): Promise<CallbackID>
    ) : void
  /**
   * This array will contain every button that is currently paired with this application. Each button will be added to
   * the list after a call to scanForButtonsWithStateChangeHandler has completed without error. It is important to know
   * that you may not try to access this list until after the managerDidRestoreState-method has been sent to the manager
   * delegate.
   */
  buttons(): Promise<{ buttons: FLICButton[]}>

  /**
   * This will delete this button from the manager. After a successful call to this method you will no longer be able to
   * communicate with the associated Flic button unless you pair it again using the scanForButtonsWithStateChangeHandler.
   * On completion, the button will no longer be included in the manager's buttons array. After a successful call to
   * this method, you should discard of any references to that particular Flic button object. If you try to forget a
   * button that is already forgotten, then you will get an error with the FLICErrorAlreadyForgotten code.
   *
   * @param options uuid: The uuid of the button that you wish to delete from the manager.
   * @return The identifier of the button instance that was just removed along with an error, if needed.
   */
  forgetButton(options: { uuid: string }): Promise<{ uuid: string}>

  /**
   * This method lets you add new Flic buttons to the manager. The scan flow is automated and the stateHandler will let
   * you know what information you should provide to your application end user. If you try to scan for buttons while
   * running on an iOS version below the mimimun requirement, then you will get an error with the
   * FLICErrorUnsupportedOSVersion error code.
   *
   * @param options must provide an empty object, {}, because callback param has to be second even though we provide no values in options
   * (work around to avoid plugin warning: "Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated."
   * see https://github.com/ionic-team/capacitor/blob/0333d8e78f5fe223094d81e72f7692d3218248d3/ios/Capacitor/Capacitor/assets/native-bridge.js#L976 )
   * @param callback ScanForButtonsWithStateChangeHandlerResponse consisting of two 'callback handlers' as properties:
   *  - stateHandler This handler returns status events that lets you know what the scanner is currently doing. The
   *                 purpose of this handler is to provide a predefined states where you may update your application UI.
   *  - completion   The completion handler will always run and if successful it will return a new FLICButton
   *                 instance, otherwise it will provide you with an error.
   */
  //- (void)scanForButtonsWithStateChangeHandler:(void (^)(FLICButtonScannerStatusEvent event))stateHandler completion:(void (^)(FLICButton * _Nullable button, NSError * _Nullable error))completion;
  scanForButtonsWithStateChangeHandler(options: Record<string, never>, callback: (message: ScanForButtonsWithStateChangeHandlerResponse) => void): Promise<CallbackID>

  /**
   * Cancel an ongoing button scan. This will result in a scan completion with an error.
   */
  stopScan(): void
}

/**
 * Methods that can be performed on a FLICButton
 */
export interface FLICButtonPlugin {
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
  setNickname(options: { uuid: string, nickname : string }): Promise<{button: FLICButton}>

  /**
   * Use this property to let the flic2lib know what type of click events you are interested it. By default you will
   * get Click, Double Click and Hold events. However, if you for example are only interested in Click events then you
   * can set this property to FLICButtonTriggerModeClick. Doing so will allow the flic2lib to deliver the events
   * quicker since it can now ignore Double Click and Hold.
   *
   * @property(nonatomic, readwrite) FLICButtonTriggerMode triggerMode;
   */
  setTriggerMode(options: { uuid: string, triggerMode: FLICButtonTriggerMode }): Promise<{button: FLICButton}>

  /**
   * Lets you switch between two different latency modes. For most use-cases it is recommend to keep the default
   * Normal. Low should ideally only be used for foreground applications, such as games,
   * where low latency is needed. Keep in mind that the energy consumption will be significantly higher in the low
   * latency mode.
   *
   * @property(nonatomic, readwrite) FLICLatencyMode latencyMode;
   */
  setLatencyMode(options: { uuid: string, latencyMode: FLICLatencyMode }): Promise<{button: FLICButton}>

  /**
   * Attempts to connect the Flic. If the Flic is not available, due to either being out of range or not advertising,
   * then it will be connected once it becomes available as this call does not time out. This is often called a pending
   * connection. It can be canceled by calling disconnect.
   *
   * (void)connect;
   */
  connect(options: { uuid: string}): void

  /**
   * Disconnect a currently connected Flic or cancel a pending connection.
   *
   * (void)disconnect;
   */
  disconnect(options: { uuid: string}): void
}

/**
 * ScanForButtons Callback Handler
 */
export type ScanForButtonsWithStateChangeHandlerResponse = {
  scannerStateChanged?: { event: FLICButtonScannerStatusEvent },
  resolved?: { button: FLICButton }
}

/**
 * The delegate of a FLICManager instance must adopt the FLICManagerDelegate protocol. All calls to the delegate methods
 * will be on the main dispatch queue.
 */
export interface FLICManagerDelegate {
  /**
   * This is called once the manager has been restored. This means that all the FLICButton instances from your previous
   * session are restored as well. After this method has been called you may start using the manager and communicate
   * with the Flic buttons. This method will only be called once on each application launch.
   */
  managerDidRestoreState(): void

  /**
   * Each time the state of the Flic manager changes, you will get this callback. Usually this is related to bluetooth
   * state changes on the iOS device. It is also guaranteed to be called at least once after the manager has been
   * configured.
   *
   * @param state The state of the Flic manager singleton.
   */
  didUpdateState(state: FLICManagerState): void
}

export type FLICManagerMessageHandler = (message: FLICManagerMessage) => void
/** Represents a method call on a FLICManagerDelegate serialized as a 'message' */
export type FLICManagerMessage =
  { method: 'managerDidRestoreState' } |
  { method: 'didUpdateState', arguments: { state: FLICManagerState } }
export type FLICButtonMessageHandler = (message: FLICButtonMessage) => void
/** Represents a method call on a FLICButtonDelegate serialized as a 'message' */
export type FLICButtonMessage =
  { method: 'buttonDidConnect',                arguments: { button: FLICButton } } |
  { method: 'buttonIsReady',                   arguments: { button: FLICButton } } |
  { method: 'buttonDidDisconnectWithError',    arguments: { button: FLICButton } } |
  { method: 'buttonDidFailToConnectWithError', arguments: { button: FLICButton } } |
  { method: 'buttonDidReceiveButtonDown',        arguments: { button: FLICButton, queued: boolean, age: number } } |
  { method: 'buttonDidReceiveButtonUp',          arguments: { button: FLICButton, queued: boolean, age: number } } |
  { method: 'buttonDidReceiveButtonClick',       arguments: { button: FLICButton, queued: boolean, age: number } } |
  { method: 'buttonDidReceiveButtonDoubleClick', arguments: { button: FLICButton, queued: boolean, age: number } } |
  { method: 'buttonDidReceiveButtonHold',    arguments: { button: FLICButton, queued: boolean, age: number } } |
  { method: 'buttonDidUnpairWithError',      arguments: { button: FLICButton, error: undefined } } |
  { method: 'buttonDidUpdateBatteryVoltage', arguments: { button: FLICButton, voltage: number } } |
  { method: 'buttonDidUpdateNickname',       arguments: { button: FLICButton, nickname: string } }

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
  readonly identifier: string;

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
  readonly name: string;

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
  readonly bluetoothAddress: string;

  /**
   * This is a unique identifier string that best used to identify a Flic. This is for example used to identify Flics
   * on all our API endpoints.
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString *uuid;
   */
  readonly uuid: string;

  /**
   * The serial number is a production identifier that is printed on the backside of the Flic inside the battery
   * hatch. This serves no other purpose than allowing a user to identify a button by manually looking at it. Can be
   * useful in some cases.
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString * serialNumber;
   */
  readonly serialNumber: string;

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
  readonly state: FLICButtonState;

  /**
   * The number of times the Flic has been clicked since last time it booted.
   *
   * @property(nonatomic, readonly) uint32_t pressCount;
   */
  readonly pressCount: number;

  /**
   * The revision of the firmware currently running on the Flic.
   *
   * @property(nonatomic, readonly) uint32_t firmwareRevision;
   */
  readonly firmwareRevision: number;

  /**
   * When a Flic connects it will go through a quick cryptographic verification to ensure that it is both a genuine
   * Flic and that it is the correct Flic. Once this is completed this property will be set to YES and it is not until
   * after that that you will start receiving click events (if any). As soon as the button disconnects this will be
   * set to NO again.
   *
   * @property(nonatomic, readonly) BOOL isReady;
   */
  readonly isReady: boolean;

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
  readonly batteryVoltage: number;

  /**
   * If this property is YES, then it means that this app's pairing with this specific Flic is no longer valid. This
   * can for example occur if the Flic has been factory reset, or if the maximum number of pairings have been reached.
   * In this case you will need to delete the button from the manager and then scan for it again.
   *
   * @property(nonatomic, readonly) BOOL isUnpaired;
   */
  readonly isUnpaired: boolean;

  /**
   * Lets you switch between two different latency modes. For most use-cases it is recommended to keep the default
   * Normal. Low should ideally only be used for foreground applications, such as games,
   * where low latency is needed. Keep in mind that the energy consumption will be significantly higher in the low
   * latency mode.
   *
   * @property(nonatomic, readwrite) FLICLatencyMode latencyMode;
   */
  latencyMode: FLICLatencyMode;

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
   * @param button The FLICButton instance that the event originated from.
   */
  buttonDidConnect: (button: FLICButton) => void

  /**
   * This method is called after each connection once the Flic has been cryptographically verified. You will not receive
   * any click events before this is called.
   *
   * (void)buttonIsReady:(FLICButton *)button;
   *
   * @param button The FLICButton instance that the event originated from.
   */
  buttonIsReady: (button: FLICButton) => void

  /**
   * This method is called every time the bluetooth link with the Flic is lost. This can occur for several different
   * reasons. The most common would be that the iOS device and the Flic is no longer within range of each other.
   *
   * (void)button:(FLICButton *)button didDisconnectWithError:(NSError * _Nullable)error;
   *
   * @param button The FLICButton instance that the event originated from.
   * @param error  This error lets you know the reason for the disconnect. An error does not necessarily mean that
   *               something went wrong.
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
   * @param button The FLICButton instance that the event originated from.
   * @param queued Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age    If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
  buttonDidReceiveButtonDown: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a button up event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonUp:(BOOL)queued age:(NSInteger)age;
   *
   * @param button The FLICButton instance that the event originated from.
   * @param queued Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age    If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
  buttonDidReceiveButtonUp: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a button click event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonClick:(BOOL)queued age:(NSInteger)age;
   *
   * @param button The FLICButton instance that the event originated from.
   * @param queued Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age    If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
  buttonDidReceiveButtonClick: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a double click event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonDoubleClick:(BOOL)queued age:(NSInteger)age;
   *
   * @param button The FLICButton instance that the event originated from.
   * @param queued Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age    If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
  buttonDidReceiveButtonDoubleClick: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The Flic registered a button hold event.
   *
   * (void)button:(FLICButton *)button didReceiveButtonHold:(BOOL)queued age:(NSInteger)age;
   *
   * @param button The FLICButton instance that the event originated from.
   * @param queued Whether the event is a queued event that happened before the Flic connected or if it is a real time event.
   * @param age    If the event was queued, then this will let you know the age of the event rounded to the nearest second.
   */
  buttonDidReceiveButtonHold: (button: FLICButton, queued: boolean, age: number) => void

  /**
   * The app no longer has a valid pairing with the Flic button. The isUnpaired property will now be YES and all
   * connection attempts made will immediately fail. To fix this you need to delete the button from the manager and then
   * re-scan it again.
   *
   * (void)button:(FLICButton *)button didUnpairWithError:(NSError * _Nullable)error;
   *
   * @param button The FLICButton instance that the event originated from.
   * @param error  This will always be nil at this time.
   */
  buttonDidUnpairWithError: (button: FLICButton, error:undefined) => void

  /**
   * This callback will be sent once the Flic button updates its battery voltage with a new value. Typically this will
   * occur a few seconds after the button connects. If you show a battery indicator in you app, then this would be a
   * good place to refresh your UI. Please see the description for the batteryVoltage property for more information.
   *
   * (void)button:(FLICButton *)button didUpdateBatteryVoltage:(float)voltage;
   *
   * @param button  The FLICButton instance that the event originated from.
   * @param voltage Float representation of the latest battery voltage sample.
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

/** helper-method to translate FLICManagerMessages to method calls on a provided delegate */
export const flicManagerMessageToDelegateConverter = (delegateProvider : () => FLICManagerDelegate | undefined) => (message: FLICManagerMessage) : void => {
  if (delegateProvider()) {
    switch (message.method) {
      case 'managerDidRestoreState':
        delegateProvider()?.managerDidRestoreState(); break
      case 'didUpdateState':
        delegateProvider()?.didUpdateState(message.arguments.state); break
      default: throw 'unknown method call: ' + message
    }
  }
}

/** helper-method to translate FLICButtonMessages to method calls on a provided delegate */
export const flicButtonMessageToDelegateConverter = (delegateProvider : () => FLICButtonDelegate | undefined) => (message: FLICButtonMessage) : void => {
  if(delegateProvider()){
    switch (message.method) {
      case 'buttonDidConnect':
        delegateProvider()?.buttonDidConnect(message.arguments.button); break
      case 'buttonIsReady':
        delegateProvider()?.buttonIsReady(message.arguments.button); break
      case 'buttonDidDisconnectWithError':
        delegateProvider()?.buttonDidDisconnectWithError(message.arguments.button); break
      case 'buttonDidFailToConnectWithError':
        delegateProvider()?.buttonDidFailToConnectWithError(message.arguments.button); break
      case 'buttonDidReceiveButtonClick':
        delegateProvider()?.buttonDidReceiveButtonClick(message.arguments.button, message.arguments.queued, message.arguments.age); break
      case 'buttonDidReceiveButtonDoubleClick':
        delegateProvider()?.buttonDidReceiveButtonDoubleClick(message.arguments.button, message.arguments.queued, message.arguments.age); break
      case 'buttonDidReceiveButtonDown':
        delegateProvider()?.buttonDidReceiveButtonDown(message.arguments.button, message.arguments.queued, message.arguments.age); break
      case 'buttonDidReceiveButtonHold':
        delegateProvider()?.buttonDidReceiveButtonHold(message.arguments.button, message.arguments.queued, message.arguments.age); break
      case 'buttonDidReceiveButtonUp':
        delegateProvider()?.buttonDidReceiveButtonUp(message.arguments.button, message.arguments.queued, message.arguments.age); break
      case 'buttonDidUnpairWithError':
        delegateProvider()?.buttonDidUnpairWithError(message.arguments.button, message.arguments.error); break
      case 'buttonDidUpdateBatteryVoltage':
        delegateProvider()?.buttonDidUpdateBatteryVoltage(message.arguments.button, message.arguments.voltage); break
      case 'buttonDidUpdateNickname':
        delegateProvider()?.buttonDidUpdateNickname(message.arguments.button, message.arguments.nickname); break
    }
  }
}

/**
 * Client side FLICManager, neatly wrapping all the nasty bloated plugin bridging stuff.
 *
 * This class is intended to be used as a singleton. The FLICManager keeps track of all the buttons
 * that have been paired with this particular app and restores them on each application launch.
 *
 * Use the flicManager()-method to get hold on the singleton instance of this class!
 *
 * To subscribe to state events use the shared "*-MessageObservable" properties. Example:
 *
 *   let buttonMessageSubscription : Subscription
 *
 *   onMount(async () => {
 *       ...
 *       let buttonSubject = flicManager().buttonMessageObservable;
 *       buttonMessageSubscription = flicManager().buttonMessageObservable.subscribe({
 *       next: m => {console.log("This subscriber logs message to console", message)},
 *       error: error => {console.error(error)},
 *       complete: () => {console.log('A: completed')}
 *   })
 *   buttonMessageSubscription.add(
 *       // this subscriber sets a status variable
 *       flicManager().buttonMessageObservable.subscribe(
 *           (m) => buttonIsPressed = m.method === 'buttonDidReceiveButtonDown'
 *       )
 *   )
 *   });
 *
 *   onDestroy(() => {
 *       ...
 *       managerMessageSubscription.unsubscribe()
 *       buttonMessageSubscription.unsubscribe()
 *   });
 *
 */
export class FLICManager {

  /**
   *
   * @param bridge               The Capacitor Flic2Plugin instance bridging to the native Flic2Manager
   * @param allowRunInBackground When true, listen and react to messages when running in the background
   * @param flicManagerMessageHandler Handler that will receive all events from the manager
   * @param flicButtonMessageHandler  Handler that will receive all events from the buttons
   * @param flicManagerDelegate  The FLICManagerDelegate instance that will receive all events from the manager
   * @param flicButtonDelegate   The FLICButtonDelegate instance that will receive all events from the buttons
   */
  constructor(
    private bridge: Flic2Plugin,
    private allowRunInBackground?: boolean,
    private flicManagerMessageHandler?: FLICManagerMessageHandler,
    private flicButtonMessageHandler?: FLICButtonMessageHandler,
    private flicManagerDelegate?: FLICManagerDelegate,
    private flicButtonDelegate?: FLICButtonDelegate,
  ) {
    console.log('FLICManager constructor called!');
    if(sharedInstance)
      console.warn("FLICManager constructor should only be called ONCE!!!")
    this.configureWithDelegate(
        this.allowRunInBackground,
        this.flicManagerMessageHandler, this.flicManagerDelegate,
        this.flicButtonMessageHandler, this.flicButtonDelegate)
  }

  public registerFlicManagerMessageHandler(handler?: FLICManagerMessageHandler): void {
    this.flicManagerMessageHandler = handler
  }

  public registerFlicButtonMessageHandler(handler?: FLICButtonMessageHandler): void {
    this.flicButtonMessageHandler = handler
  }

  public registerFlicManagerDelegate(delegate?: FLICManagerDelegate): void {
    this.flicManagerDelegate = delegate
  }

  public registerFlicButtonDelegate(delegate?: FLICButtonDelegate): void {
    this.flicButtonDelegate = delegate
  }

  /**
   * This is the state of the Flic manager. This state closely resembles the CBManager state of Apple's CoreBluetooth
   * framework. You will only be able to communicate with Flic buttons while the manager is in the
   * FlicManagerStatePoweredOn state.
   */
  public getState(): Promise<FLICManagerState> {
    return this.bridge.getState().then(value => value.state)
  }

  /**
   * Lets you know if a scan is currently running or not. Reading this value will not affect a scan.
   */
  public getIsScanning(): Promise<boolean> {
    return this.bridge.getIsScanning().then(value => value.isScanning)
  }

  /**
   * This class method return the singleton manager, assuming that it has been configured first using the
   * configureWithDelegate method first, otherwise nil is returned.
   *
   * NOT IMPLEMENTED ON CLIENT SIDE!
   */
  //sharedManager(): undefined

  /** The Subject that emits FLICManagerMessages */
  private flicManagerMessageSubject: Subject<FLICManagerMessage> = new Subject<FLICManagerMessage>()

  /** The Subject that receives and emits FLICButtonMessages */
  private flicButtonMessageSubject: Subject<FLICButtonMessage> = new Subject<FLICButtonMessage>();


  /**
   * The shared observable that emits FLICManagerMessages. The returned observable can be subscribed to
   * multiple times. Set up subscription on page mount and unsubscribe on page destroy.
   */
  public managerMessageObservable: Observable<FLICManagerMessage> = this.flicManagerMessageSubject.pipe(
      share()
  )

  /**
   * The shared observable that emits FLICManagerMessages. The returned observable can be subscribed to
   * multiple times. This observable replays previous messages upon subscription.
   * Set up subscription on page mount and unsubscribe on page destroy.
   */
  public managerMessageObservableWithReplay: Observable<FLICManagerMessage> = this.flicManagerMessageSubject.pipe(
      shareReplay()
  )

  /**
   * The shared observable that emits FLICButtonMessages. The returned observable can be subscribed to
   * multiple times. Set up subscription on page mount and unsubscribe on page destroy. E.g.:
   *
   *  let buttonMessageSubscription : Subscription
   *
   *  onMount(async () => {
   *      ...
   *      let buttonSubject = flicManager().buttonMessageObservable;
   *      buttonMessageSubscription = flicManager().buttonMessageObservable.subscribe({
   *          next: m => {console.log("This subscriber logs message to console", message)},
   *          error: error => {console.error(error)},
   *          complete: () => {console.log('A: completed')}
   *      })
   *      buttonMessageSubscription.add(
   *          // this subscriber sets a status variable
   *          flicManager().buttonMessageObservable.subscribe(
   *              m => buttonIsPressed = m.method === 'buttonDidReceiveButtonDown'
   *          )
   *      )
   *  });
   *
   *  onDestroy(() => {
   *      ...
   *      managerMessageSubscription.unsubscribe()
   *      buttonMessageSubscription.unsubscribe()
   *  });
   */
  public buttonMessageObservable: Observable<FLICButtonMessage> = this.flicButtonMessageSubject.pipe(
      share()
  )

  // public sharedFLICManagerMessageObservableWithReplayFactory : () => Observable<FLICManagerMessage> = () => {
  //   return this.flicManagerMessageSubject.pipe(
  //       tap((message : FLICManagerMessage) => console.log('sharedFLICManagerMessageObservable Processing: ', message.method)),
  //       shareReplay()
  //   )
  // }
  //
  // /**
  //  * Creates a shared observable that emits FLICButtonMessages. The returned observable can be subscribed to
  //  * multiple times.
  //  */
  // public sharedFLICButtonMessageObservableFactory : () => Observable<FLICButtonMessage> = () => {
  //   return this.flicButtonMessageSubject.pipe(
  //       tap((message: FLICButtonMessage) => console.log('sharedFLICButtonMessageObservable Processing: ', message.method)),
  //       share()
  //   )
  // }

  /**
   *  @param options The arguments being passed to the native layer:
   *   - param background      Whether you intend to use this application in the background.
   @param callback The callback method arguments:
    *   - param delegate        The delegate to be used with the manager singleton.
    *   - param buttonDelegate  The delegate to be automatically assigned to each FLICButton instance.
    *
    *  This configuration method must be called before the manager can be used. It is recommended that this is done as
    *  soon as possible after your application has launched in order to minimize the delay of any pending click events.
    *  The flic2lib officially only support iOS 12 and up, however, to make it easier for the developer, the framework is
    *  built with a target of iOS 9 and contains slices for both arm64 and armv7. This means that you will be able to
    *  include, and load, the framework in apps that support iOS 9. However, if you try to configure the manager on a
    *  device running iOS 11, or below, then the manager state will switch to FLICManagerStateUnsupported. A good place
    *  to handle this would be in the FLICManagerDelegate#didUpdateSate-method.
   */
  //configureWithDelegate(options: { delegate: FLICManagerDelegate, buttonDelegate: FLICButtonDelegate, background: boolean}): Promise<void>
  public configureWithDelegate(
      allowRunInBackground = false,
      flicManagerMessageHandler?: FLICManagerMessageHandler,
      flicManagerDelegate?: FLICManagerDelegate,
      flicButtonMessageHandler?: FLICButtonMessageHandler,
      flicButtonDelegate?: FLICButtonDelegate): void {
    console.log('FLICManager configureWithDelegate');

    // register client message handlers
    this.registerFlicManagerMessageHandler(flicManagerMessageHandler)
    this.registerFlicButtonMessageHandler(flicButtonMessageHandler)

    // register client delegates
    this.registerFlicManagerDelegate(flicManagerDelegate)
    this.registerFlicButtonDelegate(flicButtonDelegate)

    // register callback handlers forwarding to client message handlers and/or delegates:
    this.bridge.registerFLICManagerMessageHandler({}, (message: FLICManagerMessage): void => {
        if (!message)
          return
        // forward to shared client message subject
        this.flicManagerMessageSubject.next(message)
        // forward to client message handler
        if (this.flicManagerMessageHandler)
          this.flicManagerMessageHandler(message);
        // forward to client delegate
        flicManagerMessageToDelegateConverter(() => this.flicManagerDelegate)(message)
      }
    ).then(callbackId => console.log("Received manager delegate CallbackId", callbackId))

    this.bridge.registerFLICButtonMessageHandler({}, (message: FLICButtonMessage): void => {
        if (!message)
          return
        // forward to shared client message subject
        this.flicButtonMessageSubject.next(message)
        // forward to client message handler
        if (this.flicButtonMessageHandler)
          this.flicButtonMessageHandler(message);
        // forward to client delegate
        flicButtonMessageToDelegateConverter(() => this.flicButtonDelegate)(message)
      }
    ).then(callbackId => console.log("Received button delegate CallbackId", callbackId))

    // configure native manager
    return this.bridge.configureWithDelegate({background: allowRunInBackground})
  }

  /**
   * This array will contain every button that is currently paired with this application. Each button will be added to
   * the list after a call to scanForButtonsWithStateChangeHandler has completed without error. It is important to know
   * that you may not try to access this list until after the managerDidRestoreState-method has been sent to the manager
   * delegate.
   */
  public buttons(): Promise<FLICButton[]> {
    return this.bridge.buttons().then(value => value.buttons)
  }

  /**
   * This will delete this button from the manager. After a successful call to this method you will no longer be able to
   * communicate with the associated Flic button unless you pair it again using the scanForButtonsWithStateChangeHandler.
   * On completion, the button will no longer be included in the manager's buttons array. After a successful call to
   * this method, you should discard of any references to that particular Flic button object. If you try to forget a
   * button that is already forgotten, then you will get an error with the FLICErrorAlreadyForgotten code.
   *
   * @param options uuid: The uuid of the button that you wish to delete from the manager.
   * @return The identifier of the button instance that was just removed along with an error, if needed.
   */
  public forgetButton(uuid: string): Promise<string> {
    return this.bridge.forgetButton({uuid: uuid}).then(value => value.uuid)
  }

  /**
   * This method lets you add new Flic buttons to the manager. The scan flow is automated and the stateHandler will let
   * you know what information you should provide to your application end user. If you try to scan for buttons while
   * running on an iOS version below the mimimun requirement, then you will get an error with the
   * FLICErrorUnsupportedOSVersion error code.
   *
   * The provided handler returns status events that lets you know what the scanner is currently doing. The
   * purpose of the handler is to provide a predefined states where you may update your application UI. In addition,
   * it will always receive either a 'scanningCompleted' with a new FLICButton or a 'scanningFailed' event with an error
   * message.
   *
   * @params callback: ScanForButtonsStateChangeHandler for receiving events until the scanning completes
   */
  //- (void)scanForButtonsWithStateChangeHandler:(void (^)(FLICButtonScannerStatusEvent event))stateHandler completion:(void (^)(FLICButton * _Nullable button, NSError * _Nullable error))completion;
  public scanForButtonsWithStateChangeHandler(handler: ScanForButtonsStateChangeHandler): Promise<CallbackID> {
    //const callbackHandler =
    return this.bridge.scanForButtonsWithStateChangeHandler({},
      (message: ScanForButtonsWithStateChangeHandlerResponse, error?: any) => {
        console.log("scanForButtonsWithStateChangeHandler: ", message, error);
        if (message?.scannerStateChanged)
          handler?.stateChanged(message.scannerStateChanged.event)
        if (message?.resolved)
          handler?.scanningSucceeded(message.resolved.button)
        if (error) {
          if(error.data.rejected?.code === FLICButtonScannerErrorCode.userCanceled)
            handler?.scanningCancelled()
          else {
            console.log('scanning failed with code ', FLICButtonScannerErrorCode[error.data.rejected?.code ?? 0])
            handler?.scanningFailed(error)
          }
        }
      })
  }

  /**
   * Cancel an ongoing button scan. This will result in a scan completion with an error.
   */
  public stopScan(): void {
    this.bridge.stopScan()
  }

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
  public setNickname(uuid: string, nickname : string): Promise<FLICButton> {
    return this.bridge.setNickname({ uuid: uuid, nickname : nickname }).then(value => value.button)
  }

  /**
   * Use this property to let the flic2lib know what type of click events you are interested it. By default you will
   * get Click, Double Click and Hold events. However, if you for example are only interested in Click events then you
   * can set this property to FLICButtonTriggerModeClick. Doing so will allow the flic2lib to deliver the events
   * quicker since it can now ignore Double Click and Hold.
   *
   * @property(nonatomic, readwrite) FLICButtonTriggerMode triggerMode;
   */
  public setTriggerMode(uuid: string, triggerMode: FLICButtonTriggerMode): Promise<FLICButton> {
    return this.bridge.setTriggerMode({ uuid: uuid, triggerMode : triggerMode }).then(value => value.button)
  }

  /**
   * Use this property to let the flic2lib know what type of click events you are interested it. By default you will
   * get Click, Double Click and Hold events. However, if you for example are only interested in Click events then you
   * can set this property to FLICButtonTriggerModeClick. Doing so will allow the flic2lib to deliver the events
   * quicker since it can now ignore Double Click and Hold.
   *
   * @property(nonatomic, readwrite) FLICButtonTriggerMode triggerMode;
   */
  public setLatencyMode(uuid: string, latencyMode: FLICLatencyMode): Promise<FLICButton> {
    return this.bridge.setLatencyMode({ uuid: uuid, latencyMode : latencyMode }).then(value => value.button)
  }

  /**
   * Attempts to connect the Flic. If the Flic is not available, due to either being out of range or not advertising,
   * then it will be connected once it becomes available as this call does not time out. This is often called a pending
   * connection. It can be canceled by calling disconnect.
   *
   * (void)connect;
   */
  public connect(uuid: string): void {
    this.bridge.connect({uuid: uuid})
  }

  /**
   * Disconnect a currently connected Flic or cancel a pending connection.
   *
   * (void)disconnect;
   */
  public disconnect(uuid: string): void {
    this.bridge.disconnect({uuid: uuid})
  }

}

/**
 * Handler of events that may occur during scan for buttons (see scanForButtonsWithStateChangeHandler)
 */
export interface ScanForButtonsStateChangeHandler {
  stateChanged(event: FLICButtonScannerStatusEvent) : void
  scanningSucceeded(button: FLICButton) : void
  scanningCancelled() : void
  scanningFailed(error: any) : void
}



export type CallbackID = string;

export type ButtonDelegate = (message: FLICButtonEvent | null, err?: never) => void;
export interface FLICButtonEvent {
  button: FLICButton;
  event: string;
  queued: boolean;
  age: number;
}

export type FLICButtonScannerStatusEventHandlerCallback = (message: FLICButtonScannerStatusEventMessage) => void;
export interface FLICButtonScannerStatusEventMessage {
  status: FLICButtonScannerStatusEvent;
}

// ---------------------------------------------------------------------------------------------------------------------
// FLIC Enums
// (from FLICEnums.h)
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Represents the different states that a Flic manager can be in at any given time.
 * These states are mostly translated values of Apple's CoreBluetooth CBManagerState enums.
 */
export enum FLICManagerState {
  /**
   * State is unknown, update imminent.
   */
  unknown,
  /**
   * The bluetooth connection with the system service was momentarily lost, update imminent.
   */
  resetting,
  /**
   * The Flic manager can not be used on this platform.
   */
  unsupported,
  /**
   * The application is not authorized to use Bluetooth Low Energy.
   */
  unauthorized,
  /**
   * Bluetooth is currently powered off.
   */
  poweredOff,
  /**
   * Bluetooth is currently powered on and available to use.
   */
  poweredOn
}

/**
 * Represents the different error codes that can be generated while scanning and pairing new Flics.
 */
export enum FLICButtonScannerErrorCode {
  /**
   * The scan was unsuccessful due to an unknown reason.
   */
  unknown,
  /**
   * The scan could not be started since bluetooth was not in the powered on state.
   */
  bluetoothNotActivated,
  /**
   * No button was advertising in public mode within proximity.
   */
  noPublicButtonDiscovered,
  /**
   * The bluetooth pairing failed since the user already has paired this button before with this device.
   * This is solved by removing the pairing from the iOS bluetooth pairing settings screen.
   */
  blePairingFailedPreviousPairingAlreadyExisting,
  /**
   * The bluetooth pairing failed since the user pressed cancel on the pairing dialog.
   */
  blePairingFailedUserCanceled,
  /**
   * The bluetooth pairing failed since iOS decided to decline the request. It is unknown why or if this can happen.
   */
  blePairingFailedUnknownReason,
  /**
   * Indicates that the button cannot be unlocked since it belongs to a different brand.
   */
  appCredentialsDontMatch,
  /**
   * The scan was manually canceled using the stopScan method.
   */
  userCanceled,
  /**
   * The Flic's certificate belongs to a different bluetooth address.
   */
  invalidBluetoothAddress,
  /**
   * The framework was unable to pair with the Flic since it did not pass the authenticity check.
   */
  genuineCheckFailed,
  /**
   * The discovered Flic cannot be connected since it is currently connected to a different device.
   */
  alreadyConnectedToAnotherDevice,
  /**
   * The discovered Flic cannot be connected since the maximum number of simultaneous app connections has been reached.
   */
  tooManyApps,
  /**
   * A bluetooth specific error. The framework was unable to establish a connection to the Flic peripheral.
   */
  couldNotSetBluetoothNotify,
  /**
   * A bluetooth specific error. The framework was unable to establish a connection to the Flic peripheral.
   */
  couldNotDiscoverBluetoothServices,
  /**
   * The bluetooth connection was dropped during the verification process.
   */
  buttonDisconnectedDuringVerification,
  /**
   * The Flic peripheral connection was unexpectedly lost.
   */
  connectionTimeout,
  /**
   * The bluetooth connection failed.
   */
  failedToEstablish,
  /**
   * The iOS device reached the maximum number of allowed bluetooth peripherals.
   */
  connectionLimitReached,
  /**
   * The signature generated by the Flic button could not be verified.
   */
  invalidVerifier,
  /**
   * The Flic button was no longer in public mode when the verification process ran.
   */
  notInPublicMode,
}

/**
 * While the scanner is running, it will send a status events to let you know what it is doing.
 * These enums represents those events.
 * Notice: Extended with two events on the typescript side, not in the native ditto!
 */
export enum FLICButtonScannerStatusEvent {
  /**
   * A public Flic has been discovered and a connection attempt will now be made.
   */
  discovered,
  /**
   * The Flic was successfully bluetooth connected.
   */
  connected,
  /**
   * The Flic has been verified and unlocked for this app. The Flic will soon be delivered in the assigned completion
   * handler.
   */
  verified,
  /**
   * The Flic could not be verified. The completion handler will soon run to let you know what the error was.
   */
  verificationFailed,
  /** The scanning has been initiated (typescript only - not in native api) */
  scanningStarted,
  /** The scanning has stopped (typescript only - not in native api) */
  scanningStopped
}

/**
 * These enums represents the different error codes that can be sent from flic2lib, excluding the button scanner which
 * has its own set of error codes.
 */
export enum FLICError {
  /**
   * An unknown error has occurred.
   */
  unknown,
  /**
   * You are trying to use the manager while it has not been configured yet.
   */
  notConfigured,
  /**
   * A bluetooth specific error code. This means that something went wrong while the phone tried to establish a
   * connection with the Flic peripheral.
   */
  couldNotDiscoverBluetoothServices,
  /**
   * The framework was unable to verify the cryptographic signature from the Flic while setting up a session.
   */
  verificationSignatureMismatch,
  /**
   * The UUID of a button is not correct.
   */
  invalidUuid,
  /**
   * While establishing a connection with the Flic the framework was unable to verify the authenticity of the button.
   */
  genuineCheckFailed,
  /**
   * The app was unable to establish a connection with the Flic button because it already had a connection with too many
   * apps on this particular phone.
   */
  tooManyApps,
  /**
   * The pairing on the Flic button has been lost so the app's pairing data is no longer valid. This typically happens
   * if the Flic is factory reset.
   */
  unpaired,
  /**
   * The manager was unable to complete the task since the device is not running on a supported iOS version.
   */
  unsupportedOSVersion,
  /**
   * You are trying to use a FLICButton object that has already been forgotten by the manager. Please discard of your
   * references to this object.
   */
  alreadyForgotten,
};

/**
 * The different states that a Flic can be in at any given time.
 */
export enum FLICButtonState {
  /**
   * The Flic is currently disconnected and a pending connection is not set. The Flic will not connect again unless you
   * manually call the connect method.
   */
  disconnected,
  /**
   * The Flic is currently disconnected, but a pending connection is set. The Flic will automatically connect again as
   * soon as it becomes available.
   */
  connecting,
  /**
   * The Flic currently has a bluetooth connection with the phone. This does not necessarily mean that it has been
   * verified. Please listen for the isReady event, or read the isReady property, for that information
   */
  connected,
  /**
   * The Flic is currently connected, but is attempting to disconnect. Typically this state will only occur for very
   * short periods of time before either switching to
   * the connecting or disconnected state again.
   */
  disconnecting,
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
  clickAndHold,

  /**
   * Used to distinguish between only single click and double click.
   * Double click will be registered if the time between two button down events was at most 0.5 seconds.
   * The double click event will then be fired upon button release.
   *
   * If the time was more than 0.5 seconds, a single click event will be fired; either directly upon button release
   * if the button was down for more than 0.5 seconds, or after 0.5 seconds if the button was down for less than 0.5
   * seconds.
   */
  clickAndDoubleClick,

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
  clickAndDoubleClickAndHold,

  /**
   * This mode will only send click and the event will be sent directly on buttonDown.
   * This will be the same as listening for buttonDown.
   *
   * Note: This is optimal if your application requires the lowest latency possible.
   */
  click
}

/**
 * The different latency modes that you can configure the Flic button to use.
 */
export enum FLICLatencyMode {

  /**
   * For most use-cases it is recommended to keep the default Normal
   */
  normal,

  /**
   * Low should ideally only be used for foreground applications, such as games, where low latency is
   * needed. Keep in mind that the energy consumption will be significantly higher in the low latency mode.
   */
  low
}

