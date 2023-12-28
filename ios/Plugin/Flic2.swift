import Foundation
import flic2lib

/**
  Denne klasse implementerer de to Flic2 interfaces FLICButtonDelegate, FLICManagerDelegate.
  Konfigurer Flic2 Manageren med en instans af denne klase så den kan videresende hændelser til den.
 */
@objc public class Flic2: NSObject, FLICButtonDelegate, FLICManagerDelegate {

    /**
      Reference til en Callback metode til at modtage FLICButtonEvents. Benytter en dummy-instans indtil
      konfigureret via kald til receiveEvents(callback)
     */
    private var myButtonDelegate: (FLICButton, String, Bool, NSInteger) -> Void = {button, event, queued, age in } // dummy function
   
    /**
      The FLICButtonDelegate callback object provided from the javascript side
     */
    private var jsFLICButtonDelegate: Optional<FLICButtonDelegate> = Optional.none




    // ---------------------------------------------------------------------------------------------------
    // FLICManagerDelegate metoder:
    // ---------------------------------------------------------------------------------------------------

    /**
     It is good practice to newer call any methods on the manager before managerDidRestoreState: has been called.
     */
    public func managerDidRestoreState(_ manager: FLICManager) {
        print("managerDidRestoreState")
        // The manager was restored and can now be used.
        for button in manager.buttons() {
            print("Did restore Flic button: \(String(describing: button.name)), uuid: \(String(describing: button.uuid)), identifier: \(String(describing: button.identifier)), Voltage: \(String(describing: button.batteryVoltage)) V, pressCount: \(String(describing: button.pressCount)) ")
            // Sæt TriggerMode til ClickAndHold
            button.triggerMode = FLICButtonTriggerMode.clickAndDoubleClickAndHold
        }
    }

    /**
     The manager:didUpdateState: is recommended in order to keep track of the state changes. Here you should handle
     the FLICManagerStateUnsupported state in case you intend to include the framework on devices with a deployment
     target lower than iOS 12. Please read the OS Compatibility document if that is relevant to you.
     */
    public func manager(_ manager: FLICManager, didUpdate state: FLICManagerState) {
        print("manager")
        switch (state)
        {
        case FLICManagerState.poweredOn:
            // Flic buttons can now be scanned and connected.
            print("Bluetooth is turned on")
            break;
        case FLICManagerState.poweredOff:
            // Bluetooth is not powered on.
            print("Bluetooth is turned off")
            break;
        case FLICManagerState.unsupported:
            // The framework can not run on this device.
            print("FLICManagerStateUnsupported")
        default:
            print("FLICManagerState in default switch")
            break;
        }
    }



    // ---------------------------------------------------------------------------------------------------
    // FLICButtonDelegate metoder:
    // ---------------------------------------------------------------------------------------------------
    public func buttonDidConnect(_ button: FLICButton) {
        print("buttonDidConnect \(String(describing: button.name))")
        jsFLICButtonDelegate?.buttonDidConnect(button)
    }

    public func buttonIsReady(_ button: FLICButton) {
        print("buttonIsReady \(String(describing: button.name))")
        jsFLICButtonDelegate?.buttonIsReady(button)
    }

    public func button(_ button: FLICButton, didDisconnectWithError error: Error?) {
        print("button \(String(describing: button.name)) didDisconnectWithError")
        jsFLICButtonDelegate?.button(button, didDisconnectWithError: error)
    }

    public func button(_ button: FLICButton, didFailToConnectWithError error: Error?) {
        print("button \(String(describing: button.name)) didFailToConnectWithError")
        jsFLICButtonDelegate?.button(button, didFailToConnectWithError: error)
    }

    public func button(_ button: FLICButton, didReceiveButtonDown queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonDown \(queued) \(age)s")
        myButtonDelegate(button, "didReceiveButtonDown", queued, age)
        jsFLICButtonDelegate?.button?(button, didReceiveButtonDown: queued, age: age)
    }

    public func button(_ button: FLICButton, didReceiveButtonUp queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonUp \(queued) \(age)s")
        myButtonDelegate(button, "didReceiveButtonUp", queued, age)
        jsFLICButtonDelegate?.button?(button, didReceiveButtonUp: queued, age: age)
    }

    public func button(_ button: FLICButton, didReceiveButtonClick queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonClick \(queued) \(age)s")
        myButtonDelegate(button, "didReceiveButtonClick", queued, age)
        jsFLICButtonDelegate?.button?(button, didReceiveButtonClick: queued, age: age)
    }

    public func button(_ button: FLICButton, didReceiveButtonDoubleClick queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonDoubleClick \(queued) \(age)s")
        myButtonDelegate(button, "didReceiveButtonDoubleClick", queued, age)
        jsFLICButtonDelegate?.button?(button, didReceiveButtonDoubleClick: queued, age: age)
    }

    public func button(_ button: FLICButton, didReceiveButtonHold queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonHold \(queued) \(age)s")
        myButtonDelegate(button, "didReceiveButtonHold", queued, age)
        jsFLICButtonDelegate?.button?(button, didReceiveButtonHold: queued, age: age)
    }

    public func button(_ button: FLICButton, didUnpairWithError error: Error?) {
        print("button \(String(describing: button.name)) didUnpairWithError")
        jsFLICButtonDelegate?.button?(button, didUnpairWithError: error)
    }

    public func button(_ button: FLICButton, didUpdateBatteryVoltage voltage: Float) {
        print("button \(String(describing: button.name)) didUpdateBatteryVoltage \(voltage)V")
        jsFLICButtonDelegate?.button?(button, didUpdateBatteryVoltage: voltage)
    }

    public func button(_ button: FLICButton, didUpdateNickname nickname: String) {
        print("button \(String(describing: button.name)) didUpdateNickname \(nickname)")
        jsFLICButtonDelegate?.button?(button, didUpdateNickname: nickname)
    }


    public func forgetButton(_ buttonUuid: String) {
        print("forgetting button with uuid \(String(describing: buttonUuid))")
        let button = findButton(uuid: buttonUuid)
        if(button != nil) {
            FLICManager.shared()!.forgetButton(button!, completion: { forgottenButtonUuid, error in
                if error == nil {
                    print("Successfully forgot button with uuid \(forgottenButtonUuid), \(String(describing: button!.name))")
                } else {
                    print("Failed to forget button with uuid  \(forgottenButtonUuid), \(String(describing: button!.name))")
                }

            })
        }
    }

    private func findButton(uuid: String) -> FLICButton? {
        let buttons: ([FLICButton]) = FLICManager.shared()!.buttons()
        let button = buttons.first(where:  {$0.uuid == uuid})
        print("forgetting button with uuid \(String(describing: button?.uuid))")
        return button
    }

    /**
      call this method to provide a buttonDelegate (a callback method) for receiving button events
     */
    @objc public func receiveEvents(callback: @escaping (FLICButton, String, Bool, NSInteger) -> Void) {
        myButtonDelegate = callback
    }

    
    /**
      NY call this method to provide a buttonDelegate (a callback method) for receiving button events
     */
    @objc public func registerFLICButtonDelegate(callback: FLICButtonDelegate) {
        jsFLICButtonDelegate = Optional.init(callback)
    }

    @objc public func echo(_ value: String) -> String {
        print(value)
        return value + "cpb"
    }

    /**
      Call this method to setup the Flic2 manager in preparation to interact with it. Call once, early after start up.
     */
    @objc public func configure(_ background: Bool) {
        print("configuring flic2 manager with background listening set to \(background)")
        FLICManager.configure(with: self, buttonDelegate: self, background: background)
    }

    @objc public func forgetButton(_ buttonUuid: Any) {
        print("Forgetting all about \(buttonUuid)")
        for button in FLICManager.shared()!.buttons() {
            print("Forgetting all about \(String(describing: button.name))")
            FLICManager.shared()?.forgetButton(button, completion: { forgottenButtonUuid, error in
                if error == nil {
                    print("Successfully forgot button with uuid \(forgottenButtonUuid), \(String(describing: button.name))")
                } else {
                    print("Failed to forget button with uuid  \(forgottenButtonUuid), \(String(describing: button.name))")
                }

            })
        }
    }

    @objc @IBAction public func startScan(_ sender: Any) {

        FLICManager.shared()?.scanForButtons(stateChangeHandler: { event in
            // You can use these events to update your UI.
            switch event {
            case FLICButtonScannerStatusEvent.discovered:
                print("A Flic was discovered.")
            case FLICButtonScannerStatusEvent.connected:
                print("A Flic is being verified.")
                break;
            case FLICButtonScannerStatusEvent.verified:
                print("The Flic was verified successfully.")
                break;
            case FLICButtonScannerStatusEvent.verificationFailed:
                print("The Flic verification failed.")
                break;
            default:
                print("Scanner ended with the default state")
                break;
            }

        }) { button, error in
                if let name = button?.name, let bluetoothAddress = button?.bluetoothAddress, let serialNumber = button?.serialNumber {
                    print("Successfully verified: \(name), \(bluetoothAddress), \(serialNumber)")

                    // Listen to single click only.
                    button?.triggerMode = FLICButtonTriggerMode.click
                    //button?.triggerMode = FLICButtonTriggerMode.clickAndDoubleClickAndHold
                }
                print("Scanning stopped")

            }
    }

    @objc public func stopScan() {
        print("Stopping scanning...")
        FLICManager.shared()?.stopScan()
    }


}
