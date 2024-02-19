import Foundation
import Capacitor
import flic2lib

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 *
 * Denne klasse implementerer Capacitors interface "CAPPlugin" og
 * delegerer alle kald videre til en instans af klassen Flic2 som
 * implementerer Flic2lib-ios interfacene og viderestiller kald
 * til den underliggende "Flic2-driver".
 */
@objc(Flic2Plugin)
public class Flic2Plugin: CAPPlugin {
    private let delegate = NativeFlic2Delegate()

    override public func load() {
//        print("Flic2Plugin load function called")
        // TODO hmmm? ...måske initialisere senere?
//        delegate.configure(false)
    }

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value + " echoed back from iOS"
        ])
    }

    @objc func buttons(_ call: CAPPluginCall) {
        print("method buttons called")
        let buttons: ([FLICButton]) = FLICManager.shared()!.buttons()
        let jsonButtons = buttons.map { button in toDictionary(button: button)}
        call.resolve(["buttons":jsonButtons])
    }

    func toDictionary(button:FLICButton) -> [String:Any] {
        return [
            "name": button.name ?? "",
            "uuid": button.uuid,
            "nickname": button.nickname ?? "",
            "bluetoothAddress": button.bluetoothAddress,
            "serialNumber": button.serialNumber,
            "pressCount": button.pressCount,
            "firmwareRevision": button.firmwareRevision,
            "batteryVoltage": button.batteryVoltage,
            "isReady": button.isReady,
            "isUnpaired": button.isUnpaired,
            "latencyMode": button.latencyMode.rawValue,
            "state": button.state.rawValue,
            "triggerMode": button.triggerMode.rawValue
        ]
    }

    @objc func registerFLICManagerMessageHandler(_ call: CAPPluginCall) {
        print("registerFLICManagerMessageHandler called from Capacitor plugin")
        delegate.registerFLICManagerDelegate(callback: JsCallbackFLICManagerDelegate(capPlugin: self, call))
        call.keepAlive = true
    }

    @objc func registerFLICButtonMessageHandler(_ call: CAPPluginCall) {
        print("registerFLICButtonMessageHandler called from Capacitor plugin")
        delegate.registerFLICButtonDelegate(callback: JsCallbackFLICButtonDelegate(capPlugin: self, call))
        call.keepAlive = true
    }

    /*!
     * BEMÆRK:
     * delegate callbacks skal eller kan være sat i forvejen med
     * registerFLICManagerDelegate og registerFLICButtonDelegate
     */
    @objc func configureWithDelegate(_ call: CAPPluginCall) {
        let background = call.getBool("background") ?? false
        delegate.configure(background)
        call.resolve()
    }

    @objc func scanForButtons(_ call: CAPPluginCall) {
        let senderId = call.getString("senderId") ?? ""
        delegate.scanForButtons(senderId)
        call.resolve()
    }

    @objc func scanForButtonsWithStateChangeHandler(_ call: CAPPluginCall) {
        print("scanForButtonsWithStateChangeHandler er blevet kaldt")
        call.keepAlive = true
        let manager = FLICManager.shared()
        
        manager?.scanForButtons(
        // You can use these events to update your UI.
        stateChangeHandler: { (event: FLICButtonScannerStatusEvent) in
            call.resolve([
                "stateChangeHandler" : [
                    "event" : event.rawValue
                ]
            ])
        },
        completion: { (button: FLICButton?, error: Error?) in
            if let unwrapped = button, let name = button?.name, let bluetoothAddress = button?.bluetoothAddress, let serialNumber = button?.serialNumber {
                print("Successfully verified button: \(name), \(bluetoothAddress), \(serialNumber)")
                call.resolve([
                    "completion": [
                        "button" : self.toDictionary(button: unwrapped)
                    ]
                ])
            } else {
                if let unwrappedError = error {
                    print("Scanning failed")
                    //call.reject(unwrappedError.localizedDescription, "SCANNING_ERROR", unwrappedError, [
                    //    "completion": [
                    //        "error" : unwrappedError.localizedDescription
                    //    ]
                    //])
                    call.resolve([
                        "completion": [
                            "error" : unwrappedError.localizedDescription,
                            "code" : "SCANNING_ERROR"
                        ]
                    ])
                } else {
                    print("Something else than Scanning failed")
                    call.resolve([
                        "completion": [
                            "error" : "Unexpected state error",
                            "code" : "SCANNING_ERROR"
                        ]
                    ])
                    call.reject("Unexpected state error", "UNEXPECTED_ERROR")
                }
            }
            print("Scanning stopped")
            // maybe needed to clean up the call ?
            if self.bridge?.savedCall(withID: call.callbackId) != nil {
               print("Removing callback handle")
               self.bridge?.releaseCall(call)
            }
        })
    }

    /*!
     *  @discussion     Cancel an ongoing button scan. This will result in a scan completion with an error.
     */
    @objc func stopScan(_ call: CAPPluginCall) {
        print("Stopping scanning...")
        FLICManager.shared()?.stopScan()
        call.resolve()
    }

    @objc func forgetButton(_ call: CAPPluginCall) {
        let button = getButton(call)
        if(button != nil) {
            print("forgetting button with uuid \(String(describing: button!.uuid))")
            FLICManager.shared()!.forgetButton(button!, completion: { forgottenButtonUuid, error in
                if error == nil {
                    print("Successfully forgot button with uuid \(forgottenButtonUuid), \(String(describing: button!.name))")
                    call.resolve(["uuid":button!.uuid])
                } else {
                    print("Failed to forget button with uuid  \(forgottenButtonUuid), \(String(describing: button!.name)), \(error!.localizedDescription)")
                    call.reject(error!.localizedDescription)
                }
            })
        }
    }
    
    @objc func setTriggerMode(_ call: CAPPluginCall) {
        let triggerMode = FLICButtonTriggerMode(rawValue: call.getInt("triggerMode")!)
        let button = getButton(call)
        if(button != nil && triggerMode != nil) {
            print("changing triggerMode from \(String(describing: button!.triggerMode)) to \(String(describing: triggerMode)) for button with uuid \(String(describing: button!.uuid))")
            button!.triggerMode = triggerMode!
            call.resolve(["button": toDictionary(button: button!)])
        }
    }

    @objc func setNickname(_ call: CAPPluginCall) {
        guard let nickname = call.options["nickname"] as? String else {
            call.reject("Must provide a nickname")
            return
        }
        let button = getButton(call)
        if(button != nil) {
            print("changing nickname from \(String(describing: button!.nickname)) to \(String(describing: nickname)) for button with uuid \(String(describing: button!.uuid))")
            button?.nickname = nickname
            call.resolve(["button": toDictionary(button: button!)])
        }
    }

    @objc func setLatencyMode(_ call: CAPPluginCall) {
        let latencyMode = FLICLatencyMode(rawValue: call.getInt("latencyMode")!)
        let button = getButton(call)
        if(button != nil && latencyMode != nil) {
            print("changing latencyMode from \(String(describing: button!.latencyMode)) to \(String(describing: latencyMode)) for button with uuid \(String(describing: button!.uuid))")
            button!.latencyMode = latencyMode!
            call.resolve(["button": toDictionary(button: button!)])
        }
    }

    @objc func connect(_ call: CAPPluginCall) {
        let button = getButton(call)
        if(button != nil) {
            print("connecting to button with uuid \(String(describing: button!.uuid))")
            button!.connect()
            call.resolve()
        }
    }

    @objc func disconnect(_ call: CAPPluginCall) {
        let button = getButton(call)
        if(button != nil) {
            print("disconnecting to button with uuid \(String(describing: button!.uuid))")
            button!.disconnect()
            call.resolve()
        }
    }

    /**
     Lookup the button from its uuid reference. Will call reject on the provided call and return nil if a button is not found! 
     */
    private func getButton(_ call: CAPPluginCall) -> FLICButton? {
        let uuid = call.getString("uuid")!
        let button = findButton(uuid: uuid)
        if(button == nil) {
            call.reject("Cannot find a button with uuid " + uuid)
        }
        return button
    }

    /** 
     Lookup a button from its uuid reference
     */
    private func findButton(uuid: String) -> FLICButton? {
        let buttons: ([FLICButton]) = FLICManager.shared()!.buttons()
        return buttons.first(where:  {$0.uuid == uuid})
    }

    /**
    Class that knows how to wrap and forward FLICManagerDelegate events to JS layer via Capacitor bridge
     */
    @objc(FLICManagerDelegate)
    class JsCallbackFLICManagerDelegate : NSObject, FLICManagerDelegate {
        var capPlugin: Flic2Plugin
        var call: CAPPluginCall

        init(capPlugin: Flic2Plugin, _ call: CAPPluginCall){
            print("Flic2Plugin.swift: JsCallbackFLICManagerDelegate constructed")
            self.capPlugin = capPlugin
            self.call = call
        }

        // TODO dette kald bør være configureWithDelegates promise resolve!
        func managerDidRestoreState(_ manager: FLICManager) {
            print("Flic2Plugin.swift: JsCallbackFLICManagerDelegate managerDidRestoreState")
            call.resolve([
                "method" : "managerDidRestoreState"
            ])
        }
        
        func manager(_ manager: FLICManager, didUpdate state: FLICManagerState) {
            print("Flic2Plugin.swift: JsCallbackFLICManagerDelegate didUpdateState")
            call.resolve([
                "state" : state.rawValue
            ])
            call.resolve([
                "method" : "didUpdateState",
                "arguments": [
                    "state" : state.rawValue
                ]
            ])
        }
    }
    
    
    /**
    Class that knows how to wrap and forward FlicButtonDelegate events to JS via Capacitor
     */
    @objc(FLICButtonDelegate)
    class JsCallbackFLICButtonDelegate : NSObject, FLICButtonDelegate {
        var capPlugin: Flic2Plugin
        var call: CAPPluginCall
        
        init(capPlugin: Flic2Plugin, _ call: CAPPluginCall){
            self.capPlugin = capPlugin
            self.call = call
        }
        
        func buttonDidConnect(_ button: FLICButton) {
            print("Flic2Plugin.swift: buttonDidConnect")
            call.resolve([
                "method" : "buttonDidConnect",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button)
                ]
            ])
        }
        
        func buttonIsReady(_ button: FLICButton) {
            print("Flic2Plugin.swift: buttonIsReady")
            call.resolve([
                "method" : "buttonIsReady",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button)
                ]
            ])
        }
        
        func button(_ button: FLICButton, didDisconnectWithError error: Error?) {
            print("Flic2Plugin.swift: buttonDidDisconnectWithError")
            call.resolve([
                "method" : "buttonDidDisconnectWithError",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "error" : error?.localizedDescription ?? "unknown error occurred in didDisconnectWithError"
                ]
            ])
        }
        
        func button(_ button: FLICButton, didFailToConnectWithError error: Error?) {
            print("Flic2Plugin.swift: buttonDidFailToConnectWithError")
            call.resolve([
                "method" : "buttonDidFailToConnectWithError",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "error" : error?.localizedDescription ?? "unknown error occurred in didFailToConnectWithError"
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonClick queued: Bool, age: Int) {
            print("Flic2Plugin.swift: buttonDidReceiveButtonClick")
            call.resolve([
                "method" : "buttonDidReceiveButtonClick",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonDoubleClick queued: Bool, age: Int) {
            print("Flic2Plugin.swift: buttonDidReceiveButtonDoubleClick")
            call.resolve([
                "method" : "buttonDidReceiveButtonDoubleClick",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonDown queued: Bool, age: Int) {
            print("Flic2Plugin.swift: buttonDidReceiveButtonDown")
            call.resolve([
                "method" : "buttonDidReceiveButtonDown",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonHold queued: Bool, age: Int) {
            print("Flic2Plugin.swift: buttonDidReceiveButtonHold")
            call.resolve([
                "method" : "buttonDidReceiveButtonHold",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonUp queued: Bool, age: Int) {
            print("Flic2Plugin.swift: buttonDidReceiveButtonUp")
            call.resolve([
                "method" : "buttonDidReceiveButtonUp",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didUnpairWithError error: Error?) {
            print("Flic2Plugin.swift: buttonDidUnpairWithError")
            call.resolve([
                "method" : "buttonDidUnpairWithError",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "error" : error?.localizedDescription ?? "unknown error occurred in didUnpairWithError"
                ]
            ])
        }
        
        func button(_ button: FLICButton, didUpdateBatteryVoltage voltage: Float) {
            print("Flic2Plugin.swift: buttonDidUpdateBatteryVoltage")
            call.resolve([
                "method" : "buttonDidUpdateBatteryVoltage",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "voltage" : voltage
                ]
            ])
        }
        
        func button(_ button: FLICButton, didUpdateNickname nickname: String) {
            print("Flic2Plugin.swift: buttonDidUpdateNickname")
            call.resolve([
                "method" : "buttonDidUpdateNickname",
                "arguments": [
                    "button" : capPlugin.toDictionary(button: button),
                    "nickname" : nickname
                ]
            ])
        }
    }
}
