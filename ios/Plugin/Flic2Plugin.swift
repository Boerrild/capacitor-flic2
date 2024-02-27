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
    
    /// The FLICManagerDelegate callback object provided from the javascript side
    private var jsCallbackFLICManagerDelegate: JsCallbackFLICManagerDelegate = JsCallbackFLICManagerDelegate()
    
    /// The FLICButtonDelegate callback object provided from the javascript side
    private var jsCallbackFLICButtonDelegate: JsCallbackFLICButtonDelegate = JsCallbackFLICButtonDelegate()
    
    
    private func logButton(_ message: String,_ button: FLICButton?) {
        log("\(String(describing: button?.serialNumber ?? "")): \(message)")
    }
    
    private func logMethod(_ message: String) {
        log("[\(message)]")
    }
    
    private func log(_ message: String) {
        print("Flic2Plugin: \(message)")
    }
    
    
    override public func load() {
        // Should configure flic2 plugin on load?
        let configureOnLoad = getConfig().getBoolean("configureOnLoad", false)
        if(configureOnLoad) {
            configure(false)
        }
    }
    
    @objc func registerFLICManagerMessageHandler(_ call: CAPPluginCall) {
        log("registerFLICManagerMessageHandler called from Capacitor plugin")
        jsCallbackFLICManagerDelegate.setCallback(call, plugin: self)
        call.keepAlive = true
    }
    
    @objc func registerFLICButtonMessageHandler(_ call: CAPPluginCall) {
        log("registerFLICButtonMessageHandler called from Capacitor plugin")
        jsCallbackFLICButtonDelegate.setCallback(call, plugin: self)
        call.keepAlive = true
    }
    
    /// BEMÆRK:
    /// registerFLICManagerDelegate og registerFLICButtonDelegate bør kaldes før
    /// denne metode hvis man ønsker at modtage manager state events fra starten
    ///
    /// backround defaults to false, but can be overridden by both call argument and App plugin config property 'runInBackground' (see "capacitor.config.ts"-file)
    /// Setting background to true will break the app unless prober permissions is set up in XCode app;
    /// Error reason may be something like this: 'State restoration of CBCentralManager is only allowed for applications that have specified the "bluetooth-central" background mode'
    @objc func configureWithDelegate(_ call: CAPPluginCall) {
        if(FLICManager.shared() == nil) {
            configure(call.getBool("background") ?? false)
            call.resolve()
        } else {
            log("*** Flic2Manager already configured - ignoring JS request ***")
        }
    }
    
    @objc func configure(_ callerAllowRunInBackground: Bool) {
        /// "background" defaults to false, but can be overridden by both call argument and App plugin config
        /// property 'runInBackground' (see "capacitor.config.ts"-file). Setting background to true will break the app
        /// unless prober permissions is set up in XCode app. Error reason may be something like this:
        /// 'State restoration of CBCentralManager is only allowed for applications that have specified the "bluetooth-central" background mode'
        let configAllowRunInBackground = getConfig().getBoolean("allowRunInBackground", false)
        let allowRunInBackground = callerAllowRunInBackground || configAllowRunInBackground
        
        log("*** Configuring Flic2Manager with background listening set to \(allowRunInBackground) ***")
        log("(call argument was \(callerAllowRunInBackground) and config plugin property 'runInBackground' in 'capacitor.config.ts' was \(callerAllowRunInBackground))")
        FLICManager.configure(with: jsCallbackFLICManagerDelegate, buttonDelegate: jsCallbackFLICButtonDelegate,background: allowRunInBackground)
    }
    
    @objc func buttons(_ call: CAPPluginCall) {
        logMethod("buttons")
        let buttons: ([FLICButton]) = FLICManager.shared()!.buttons()
        let jsonButtons = buttons.map { button in Flic2Plugin.toDictionary(button: button)}
        call.resolve(["buttons":jsonButtons])
    }
    
    static func toDictionary(button:FLICButton) -> [String:Any] {
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
    
    /// Scans for buttons while delegating any state changes and completion (resolution or rejection error) to the callback call provided by the plugin
    /// State changes are resolved as "scannerStateChanged", resolution as "resolved" and rejection as "rejected"
    /// - Parameter call:
    @objc func scanForButtonsWithStateChangeHandler(_ call: CAPPluginCall) {
        logMethod("scanForButtonsWithStateChangeHandler")
        call.keepAlive = true
        FLICManager.shared()?.scanForButtons(
            
            // State change handler
            // (You can use these events to update your UI)
            stateChangeHandler: { (event: FLICButtonScannerStatusEvent) in
                call.resolve([
                    "scannerStateChanged" : [
                        "event" : event.rawValue
                    ]
                ])
            },
            
            // Completion handler
            completion: { (button: FLICButton?, error: Error?) in
                if let unwrapped = button, let name = button?.name, let bluetoothAddress = button?.bluetoothAddress, let serialNumber = button?.serialNumber {
                    self.log("[scanForButtonsWithStateChangeHandler] Verified button: \(name), \(bluetoothAddress), \(serialNumber)")
                    call.resolve([
                        "resolved": [
                            "button" : Flic2Plugin.toDictionary(button: unwrapped)
                        ]
                    ])
                } else {
                    CAPLog.print("Error on request", String(describing: error))
                    if let unwrappedError = error {
                        self.log("[scanForButtonsWithStateChangeHandler] Scanning failed with errorcode \(String(describing: (unwrappedError as NSError).code))")
                        call.reject(unwrappedError.localizedDescription, "SCANNING_ERROR_\(String(describing: (unwrappedError as NSError).code))", unwrappedError, [
                            "rejected": [
                                "error" : unwrappedError.localizedDescription,
                                "code" : (unwrappedError as NSError).code,
                                "errorMessage" : unwrappedError.localizedDescription
                            ]
                        ])
                    } else {
                        self.log("[scanForButtonsWithStateChangeHandler] Scanning failed for unknown reason")
                        call.reject("Unexpected state error", "UNEXPECTED_ERROR")
                    }
                }
                self.log("[scanForButtonsWithStateChangeHandler] Scanning stopped")
                // Clean up (see https://capacitorjs.com/docs/core-apis/saving-calls)
                self.bridge?.releaseCall(call)
            })
        
    }
    
    /*!
     *  @discussion     Cancel an ongoing button scan. This will result in a scan completion with an error.
     */
    @objc func stopScan(_ call: CAPPluginCall) {
        logMethod("stopScan")
        FLICManager.shared()?.stopScan()
        call.resolve()
    }
    
    @objc func forgetButton(_ call: CAPPluginCall) {
        let button = getButton(call)
        if(button != nil) {
            logButton("[forgetButton]", button)
            FLICManager.shared()!.forgetButton(button!, completion: { forgottenButtonUuid, error in
                if error == nil {
                    self.logButton("[forgetButton] Successfully forgot button", button)
                    call.resolve(["uuid":button!.uuid])
                } else {
                    self.logButton("[forgetButton] Failed to forget button", button)
                    call.reject(error!.localizedDescription)
                }
            })
        }
    }
    
    @objc func setTriggerMode(_ call: CAPPluginCall) {
        let triggerMode = FLICButtonTriggerMode(rawValue: call.getInt("triggerMode")!)
        let button = getButton(call)
        if(button != nil && triggerMode != nil) {
            log("[setTriggerMode] changing triggerMode from \(String(describing: button!.triggerMode.rawValue)) to \(String(describing: triggerMode?.rawValue ?? -1)) for button with uuid \(String(describing: button!.uuid))")
            button!.triggerMode = triggerMode!
            call.resolve(["button": Flic2Plugin.toDictionary(button: button!)])
        }
    }
    
    @objc func setNickname(_ call: CAPPluginCall) {
        guard let nickname = call.options["nickname"] as? String else {
            call.reject("Must provide a nickname")
            return
        }
        let button = getButton(call)
        if(button != nil) {
            log("[setNickname] changing nickname from \(String(describing: button!.nickname)) to \(String(describing: nickname)) for button with uuid \(String(describing: button!.uuid))")
            button?.nickname = nickname
            call.resolve(["button": Flic2Plugin.toDictionary(button: button!)])
        }
    }
    
    @objc func setLatencyMode(_ call: CAPPluginCall) {
        let latencyMode = FLICLatencyMode(rawValue: call.getInt("latencyMode")!)
        let button = getButton(call)
        if(button != nil && latencyMode != nil) {
            log("[setLatencyMode] changing latencyMode from \(String(describing: button!.latencyMode.rawValue)) to \(String(describing: latencyMode?.rawValue ?? -1)) for button with uuid \(String(describing: button!.uuid))")
            button!.latencyMode = latencyMode!
            call.resolve(["button": Flic2Plugin.toDictionary(button: button!)])
        }
    }
    
    @objc func connect(_ call: CAPPluginCall) {
        let button = getButton(call)
        if(button != nil) {
            log("[connect] connecting to button with uuid \(String(describing: button!.uuid))")
            button!.connect()
            call.resolve()
        }
    }
    
    @objc func disconnect(_ call: CAPPluginCall) {
        let button = getButton(call)
        if(button != nil) {
            log("[disconnect] disconnecting to button with uuid \(String(describing: button!.uuid))")
            button!.disconnect()
            call.resolve()
        }
    }
    
    /// Lookup the button from its uuid reference. Will call reject on the provided call and return nil if a button is not found!
    private func getButton(_ call: CAPPluginCall) -> FLICButton? {
        let uuid = call.getString("uuid")!
        let button = findButton(uuid: uuid)
        if(button == nil) {
            log("[Error] Cannot find a button with uuid " + uuid)
            call.reject("Cannot find a button with uuid " + uuid)
        }
        return button
    }
    
    /// Lookup a button from its uuid reference
    private func findButton(uuid: String) -> FLICButton? {
        let buttons: ([FLICButton]) = FLICManager.shared()!.buttons()
        return buttons.first(where:  {$0.uuid == uuid})
    }
    
    // ---------------------------------------------------------------------------------------------------
    // FLICManagerDelegate metoder:
    // ---------------------------------------------------------------------------------------------------
    
    /// Class that knows how to wrap and forward FLICManagerDelegate events to JS layer via Capacitor bridge
    @objc(FLICManagerDelegate)
    class JsCallbackFLICManagerDelegate : NSObject, FLICManagerDelegate {
        var call: Optional<CAPPluginCall> = Optional.none
        
        func setCallback(_ call: CAPPluginCall, plugin: Flic2Plugin) {
            if(self.call != nil && self.call?.callbackId != call.callbackId) {
                plugin.bridge?.releaseCall(self.call!)
            }
            self.call = call
        }
        
        private func log(_ message: String) {
            print("Manager Delegate: [\(message)]")
        }
        
        
        // TODO dette kald bør være configureWithDelegates promise resolve!
        /// The manager was restored and can now be used.
        func managerDidRestoreState(_ manager: FLICManager) {
            log("managerDidRestoreState")
            print("FLICManager restored button states \n")
            print("Restored buttons:")
            print("uuid                             | identifier                           | serialNumber| bluetoothAddress     |firmware |            | latency | trigger | state | pressCount | name             | nickname")
            print("                                 |                                      |             |                      |Revision | Voltage    | Mode    | Mode    |       |            |                  |         ")
            //     56a4e607b74f4f04afbb7ad9005deefc | C0AC750A-29CA-51BC-A2D7-76AA4D2670D4 | BE34-C73278 | 00:80:E4:DA:78:D0:BA |      11 | 3.0199218V |       0 |       3 |     1 |       2574 | Flic BE34-C73278 | nyt nickname
            //     4db8081361424d3c8e7a735e69cd8103 | 1A10C679-ACF3-06A8-1ADB-62265072B269 | BG14-D33595 | 00:80:E4:DA:79:9C:8C |      11 | 3.0199218V |       0 |       2 |     1 |       2760 | Flic BG14-D33595 | det nye navn
            for button in manager.buttons() {
                print("\(String(describing: button.uuid)) | \(String(describing: button.identifier)) | \(String(describing: button.serialNumber)) | \(String(describing: button.bluetoothAddress)) |      \(String(describing: button.firmwareRevision)) | \(String(describing: button.batteryVoltage))V |       \(String(describing: button.latencyMode.rawValue)) |       \(String(describing: button.triggerMode.rawValue)) |     \(String(describing: button.state.rawValue)) |       \(String(describing: button.pressCount)) | \(String(describing: button.name ?? "<undefined>")) | \(String(describing: button.nickname ?? "<undefined>")) ")
            }
            print("\n")
            // forward callback call to JS layer
            call?.resolve([
                "method" : "managerDidRestoreState"
            ])
        }
        
        func manager(_ manager: FLICManager, didUpdate state: FLICManagerState) {
            log("didUpdateState")
            call?.resolve([
                "method" : "didUpdateState",
                "arguments": [
                    "state" : state.rawValue
                ]
            ])
        }
    }
    
    
    // ---------------------------------------------------------------------------------------------------
    // FLICButtonDelegate metoder:
    // ---------------------------------------------------------------------------------------------------
    
    /**
     Class that knows how to wrap and forward FlicButtonDelegate events to JS via Capacitor
     */
    @objc(FLICButtonDelegate)
    class JsCallbackFLICButtonDelegate : NSObject, FLICButtonDelegate {
        var call: Optional<CAPPluginCall> = Optional.none
        
        func setCallback(_ call: CAPPluginCall, plugin: Flic2Plugin) {
            if(self.call != nil && self.call?.callbackId != call.callbackId) {
                plugin.bridge?.releaseCall(self.call!)
            }
            self.call = call
        }
        
        private func log(_ button: FLICButton,_ message: String) {
            print("Button Delegate \(String(describing: button.serialNumber)): [\(message)]")
        }
        
        func buttonDidConnect(_ button: FLICButton) {
            log(button, "buttonDidConnect")
            call?.resolve([
                "method" : "buttonDidConnect",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button)
                ]
            ])
        }
        
        func buttonIsReady(_ button: FLICButton) {
            log(button, "buttonIsReady")
            call?.resolve([
                "method" : "buttonIsReady",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button)
                ]
            ])
        }
        
        func button(_ button: FLICButton, didDisconnectWithError error: Error?) {
            log(button, "buttonDidDisconnectWithError")
            call?.resolve([
                "method" : "buttonDidDisconnectWithError",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "error" : error?.localizedDescription ?? "" // empty string to mean 'no error'
                ]
            ])
        }
        
        func button(_ button: FLICButton, didFailToConnectWithError error: Error?) {
            log(button, "buttonDidFailToConnectWithError")
            call?.resolve([
                "method" : "buttonDidFailToConnectWithError",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "error" : error?.localizedDescription ?? "" // empty string to mean 'no error'
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonClick queued: Bool, age: Int) {
            log(button, "buttonDidReceiveButtonClick")
            call?.resolve([
                "method" : "buttonDidReceiveButtonClick",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonDoubleClick queued: Bool, age: Int) {
            log(button, "buttonDidReceiveButtonDoubleClick")
            call?.resolve([
                "method" : "buttonDidReceiveButtonDoubleClick",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonDown queued: Bool, age: Int) {
            log(button, "buttonDidReceiveButtonDown")
            call?.resolve([
                "method" : "buttonDidReceiveButtonDown",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonHold queued: Bool, age: Int) {
            log(button, "buttonDidReceiveButtonHold")
            call?.resolve([
                "method" : "buttonDidReceiveButtonHold",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didReceiveButtonUp queued: Bool, age: Int) {
            log(button, "buttonDidReceiveButtonUp")
            call?.resolve([
                "method" : "buttonDidReceiveButtonUp",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "queued" : queued,
                    "age" : age
                ]
            ])
        }
        
        func button(_ button: FLICButton, didUnpairWithError error: Error?) {
            log(button, "buttonDidUnpairWithError")
            call?.resolve([
                "method" : "buttonDidUnpairWithError",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "error" : error?.localizedDescription ??  "" // empty string to mean 'no error'
                ]
            ])
        }
        
        func button(_ button: FLICButton, didUpdateBatteryVoltage voltage: Float) {
            log(button, "buttonDidUpdateBatteryVoltage")
            call?.resolve([
                "method" : "buttonDidUpdateBatteryVoltage",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "voltage" : voltage
                ]
            ])
        }
        
        func button(_ button: FLICButton, didUpdateNickname nickname: String) {
            log(button, "buttonDidUpdateNickname")
            call?.resolve([
                "method" : "buttonDidUpdateNickname",
                "arguments": [
                    "button" : Flic2Plugin.toDictionary(button: button),
                    "nickname" : nickname
                ]
            ])
        }
    }
}
