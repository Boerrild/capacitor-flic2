import Foundation
import Capacitor
import flic2lib

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(Flic2Plugin)
public class Flic2Plugin: CAPPlugin {
    private let delegate = Flic2()

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
            "debugDescription": button.debugDescription,
            "description": button.description,
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

    @objc func recieveButtonEvents(_ call: CAPPluginCall) {
        delegate.recieveEvents(callback: {button, event, queued, age in
            call.resolve([
                "button": self.toDictionary(button: button),
                "event" : event,
                "queued": queued,
                "age"   : age
            ])
        })
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
}
