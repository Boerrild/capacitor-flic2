#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(Flic2Plugin, "Flic2",
    CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(buttons, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(forgetButton, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(receiveButtonEvents, CAPPluginReturnCallback);
    CAP_PLUGIN_METHOD(registerFlicButtonDelegate, CAPPluginReturnCallback);
    CAP_PLUGIN_METHOD(registerFLICButtonScannerStatusEventHandler, CAPPluginReturnCallback);
    CAP_PLUGIN_METHOD(configure, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(scanForButtons, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(stopScan, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(forget, CAPPluginReturnNone);

    CAP_PLUGIN_METHOD(scanForButtonsWithStateChangeHandler, CAPPluginReturnCallback);
)
