import {Capacitor, registerPlugin} from '@capacitor/core';

export type CallbackID = string;

export type ButtonDelegate = (message: FLICButtonEvent | null, err?: any) => void;

export interface FLICButtonEvent {
  button: FLICButton;
  event: string;
  queued: boolean;
  age: number;
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
  recieveButtonEvents(callback: ButtonDelegate): Promise<CallbackID>;

  //recieveButtonEvents(options: { value: string }): Promise<{ value: string }>;
  configure(options: { background: boolean }): void;

  startScan(options: { senderId: string }): void;

  stopScan(): void;

  forgetButton(options: { uuid: string }): void;
}


const Flic2 = (Capacitor.isNativePlatform()) ? registerPlugin<Flic2Plugin>('Flic2LibPlugin') : null;

export default Flic2;


// class Flic2Instance implements Flic2Plugin {
//
//     buttons(): Promise<Array<FLICButton>> {
//         return Flic2.buttons().then(value => value.);
//     }
//
//     configure(options: { background: boolean }): void {
//     }
//
//     echo(options: { value: string }): Promise<{ value: string }> {
//         return Promise.resolve({value: ""});
//     }
//
//     forget(options: { buttonUuid: string }): void {
//     }
//
//     recieveButtonEvents(callback: MyPluginCallback): Promise<CallbackID> {
//         return Promise.resolve(undefined);
//     }
//
//     startScan(options: { senderId: string }): void {
//     }
//
//     stopScan(): void {
//     }
//
// }
//
// export async function flic2buttons() {
//     Flic2.buttons().then(buttons => lastCmd = buttons.map(b => b.serialNumber ).join(", "));
// }



/**
 * An instance of this class represents a physical Flic 2 button.
 */
export interface FLICButton {
  /**
   * This identifier is guaranteed to be the same for each Flic paired to a particular iOS device. Thus it can be used
   * to identify a Flic within an app. However, If you need to identify Flics cross different apps on different iOS
   * devices, then you should have look at the either uuid, serialNumber, or bluetoothAddress.
   *
   * @property(readonly, nonatomic, strong, nonnull) NSUUID *
   */
  identifier: string;

  /** The delegate that will receive events related to this particular Flic. You can either set this delegate manually
   * for each button, or let the manager do so automatically using the buttonDelegate as default.
   *
   * @property(weak, nonatomic, nullable) id<FLICButtonDelegate>
   */
  //delegate: string;

  /**
   * The bluetooth advertisement name of the Flic. This will be the same name that is shown by iOS it its bluetooth
   * settings.
   *
   * @property(nonatomic, readonly, strong, nullable) NSString *
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
   * @property(nonatomic, readwrite, strong, nullable) NSString *
   */
  nickname: string;

  /**
   * The bluetooth address of the Flic. This will be a string representation of a 49 bit long address.
   * Example: "00:80:e4:da:12:34:56"
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString *
   */
  bluetoothAddress: string;

  /**
   * This is a unique identifier string that best used to identify a Flic. This is for example used to identify Flics
   * on all our API endpoints.
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString *
   */
  uuid: string;

  /**
   * The serial number is a production identifier that is printed on the backside of the Flic inside the battery
   * hatch. This serves no other purpose than allowing a user to identify a button by manually looking at it. Can be
   * useful in some cases.
   *
   * @property(nonatomic, readonly, strong, nonnull) NSString *
   */
  serialNumber: string;

  /**
   * Use this property to let the flic2lib know what type of click events you are interested it. By default you will
   * get Click, Double Click and Hold events. However, if you for example are only interested in Click events then you
   * can set this property to FLICButtonTriggerModeClick. Doing so will allow the flic2lib to deliver the events
   * quicker since it can now ignore Double Click and Hold.
   *
   * @property(nonatomic, readwrite) FLICButtonTriggerMode
   */
  triggerMode: FLICButtonTriggerMode;

  /**
   * Lets you know if the Flic is Connected, Disconnected, Connecting, or Disconnecting.
   *
   * @property(nonatomic, readonly) FLICButtonState
   */
  state: string;

  /**
   * The number of times the Flic has been clicked since last time it booted.
   *
   * @property(nonatomic, readonly) uint32_t
   */
  pressCount: number;

  /**
   * The revision of the firmware currently running on the Flic.
   *
   * @property(nonatomic, readonly) uint32_t
   */
  firmwareRevision: number;

  /**
   * When a Flic connects it will go through a quick cryptographic verification to ensure that it is both a genuine
   * Flic and that it is the correct Flic. Once this is completed this property will be set to YES and it is not until
   * after that that you will start receiving click events (if any). As soon as the button disconnects this will be
   * set to NO again.
   *
   * @property(nonatomic, readonly) BOOL
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
   * @property(nonatomic, readonly) float
   */
  batteryVoltage: number;

  /**
   * If this property is YES, then it means that this app's pairing with this specific Flic is no longer valid. This
   * can for example occur if the Flic has been factory reset, or if the maximum number of pairings have been reached.
   * In this case you will need to delete the button from the manager and then scan for it again.
   *
   * @property(nonatomic, readonly) BOOL
   */
  isUnpaired: boolean;
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
