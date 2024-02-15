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
    private let delegate = Flic2()

    override public func load() {
        print("Flic2Plugin load function called")
        delegate.configure(false)
    }

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": delegate.echo(value)
        ])
    }

    @objc func buttons(_ call: CAPPluginCall) {
        print("method buttons called")
        let buttons: ([FLICButton]) = FLICManager.shared()!.buttons()
        let jsonButtons = buttons.map { button in toDictionary(button: button)}
        call.resolve(["buttons":jsonButtons])
    }

    @objc func forgetButton(_ call: CAPPluginCall) {
        let buttonUuid = call.getString("uuid") ?? ""
        delegate.forgetButton(buttonUuid)
        call.resolve()
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

    @objc func receiveButtonEvents(_ call: CAPPluginCall) {
        print("receiveButtonEvents called from Capacitor plugin")
        delegate.receiveButtonEvents(callback: {button, event, queued, age in
            call.resolve([
                "button": self.toDictionary(button: button),
                "event" : event,
                "queued": queued,
                "age"   : age
            ])
        })
        call.keepAlive = true
    }

    @objc func registerFlicButtonDelegate(_ call: CAPPluginCall) {
        print("registerFlicButtonDelegate called from Capacitor plugin")
        delegate.registerFLICButtonDelegate(callback: JsCallbackFlicButtonDelegate(capPlugin: self, call))
        call.keepAlive = true
    }

    @objc func configure(_ call: CAPPluginCall) {
        let background = call.getBool("background") ?? false
        delegate.configure(background)
        call.resolve()
    }

    @objc func startScan(_ call: CAPPluginCall) {
        let senderId = call.getString("senderId") ?? ""
        delegate.startScan(senderId)
        call.resolve()
    }

    @objc func stopScan(_ call: CAPPluginCall) {
        delegate.stopScan()
        call.resolve()
    }

    @objc func forget(_ call: CAPPluginCall) {
        let buttonUuid = call.getString("buttonUuid") ?? ""
        delegate.forgetButton(buttonUuid)
        call.resolve()
    }

    /**
    Class that knows how to wrap and forward events to JS via Capacitor
     */
    @objc(FLICButtonDelegate)
    class JsCallbackFlicButtonDelegate : NSObject, FLICButtonDelegate {
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
