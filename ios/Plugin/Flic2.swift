import Foundation

@objc public class Flic2: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
