import Foundation
import flic2lib

/// Denne klasse implementerer de to Flic2 interfaces FLICButtonDelegate, FLICManagerDelegate.
/// Konfigurer Flic2 Manageren med en instans af denne klasse så den kan videresende hændelser til den.
/// Hændelser vil blive viderestillet til de to registrerede JS-*-Delegates instanser
@objc public class NativeFlic2Delegate: NSObject, FLICButtonDelegate, FLICManagerDelegate {
    
    /// The FLICManagerDelegate callback object provided from the javascript side
    private var jsFLICManagerDelegate: Optional<FLICManagerDelegate> = Optional.none
    
    /// The FLICButtonDelegate callback object provided from the javascript side
    private var jsFLICButtonDelegate: Optional<FLICButtonDelegate> = Optional.none
    
    /// call this method to provide a managerDelegate (a callback method) for receiving manager events
    /// There can be only one! Last one wins!
    @objc public func registerFLICManagerDelegate(callback: FLICManagerDelegate) {
        print("registerFLICButtonDelegate callback method registrered")
        jsFLICManagerDelegate = Optional.init(callback)
    }
    
    /// call this method to provide a buttonDelegate (a callback method) for receiving button events
    /// There can be only one! Last one wins!
    @objc public func registerFLICButtonDelegate(callback: FLICButtonDelegate) {
        print("registerFLICButtonDelegate callback method registrered")
        jsFLICButtonDelegate = Optional.init(callback)
    }
    
    // ---------------------------------------------------------------------------------------------------
    // FLICManagerDelegate metoder:
    // ---------------------------------------------------------------------------------------------------
    
    /// It is good practice to newer call any methods on the manager before managerDidRestoreState: has been called.
    public func managerDidRestoreState(_ manager: FLICManager) {
        // The manager was restored and can now be used.
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
        jsFLICManagerDelegate?.managerDidRestoreState(manager)
    }
    
    /// The manager:didUpdateState: is recommended in order to keep track of the state changes. Here you should handle
    /// the FLICManagerStateUnsupported state in case you intend to include the framework on devices with a deployment
    /// target lower than iOS 12. Please read the OS Compatibility document if that is relevant to you.
    public func manager(_ manager: FLICManager, didUpdate state: FLICManagerState) {
        print("FLICManager DidUpdateState to \(String(describing: state))")
        switch (state)
        {
        case FLICManagerState.unknown:
            print(" FLICManagerState = Unknown! State is unknown, update imminent");
            break;
        case FLICManagerState.resetting:
            print(" FLICManagerState = Resetting! The bluetooth connection with the system service was momentarily lost, update imminent.");
            break;
        case FLICManagerState.unsupported:
            print(" FLICManagerState = Unsupported! The framework can not run on this device")
        case FLICManagerState.poweredOff:
            print(" FLICManagerState = PoweredOff! Bluetooth is turned off")
            break;
        case FLICManagerState.unauthorized:
            print(" FLICManagerState = Unauthorized! The application is not authorized to use Bluetooth Low Energy.");
            break;
        case FLICManagerState.poweredOn:
            // Bluetooth is currently powered on and available to use. Flic buttons can now be scanned and connected
            print(" FLICManagerState = PoweredOn! Bluetooth is turned on")
            break;
        @unknown default:
            print(" FLICManagerState = Unexpected state!?!!")
            break;
        }
        // forward callback call to JS layer
        jsFLICManagerDelegate?.manager(manager, didUpdate: state)
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
        jsFLICButtonDelegate?.button?(button, didReceiveButtonDown: queued, age: age)
    }
    
    public func button(_ button: FLICButton, didReceiveButtonUp queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonUp \(queued) \(age)s")
        jsFLICButtonDelegate?.button?(button, didReceiveButtonUp: queued, age: age)
    }
    
    public func button(_ button: FLICButton, didReceiveButtonClick queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonClick \(queued) \(age)s")
        jsFLICButtonDelegate?.button?(button, didReceiveButtonClick: queued, age: age)
    }
    
    public func button(_ button: FLICButton, didReceiveButtonDoubleClick queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonDoubleClick \(queued) \(age)s")
        jsFLICButtonDelegate?.button?(button, didReceiveButtonDoubleClick: queued, age: age)
    }
    
    public func button(_ button: FLICButton, didReceiveButtonHold queued: Bool, age:NSInteger) {
        print("button \(String(describing: button.name)) didReceiveButtonHold \(queued) \(age)s")
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
}
