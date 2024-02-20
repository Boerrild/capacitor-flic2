#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

/// Define the plugin using the CAP_PLUGIN Macro, and
/// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
/// See https://capacitorjs.com/docs/plugins/method-types
CAP_PLUGIN(Flic2Plugin, "Flic2Plugin",
    CAP_PLUGIN_METHOD(registerFLICManagerMessageHandler, CAPPluginReturnCallback);
    CAP_PLUGIN_METHOD(registerFLICButtonMessageHandler,  CAPPluginReturnCallback);
    // manager methods
    CAP_PLUGIN_METHOD(getState,                             CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getIsScanning,                        CAPPluginReturnPromise);
    //CAP_PLUGIN_METHOD(configureWithDelegate,                CAPPluginReturnCallback);
    CAP_PLUGIN_METHOD(configureWithDelegate,                CAPPluginReturnNone); // TODO bør returnere et promise som resolves når manager er restored!!!
    CAP_PLUGIN_METHOD(buttons,                              CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(forgetButton,                         CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(scanForButtonsWithStateChangeHandler, CAPPluginReturnCallback);
    CAP_PLUGIN_METHOD(stopScan,                             CAPPluginReturnNone);
    // button methods
    CAP_PLUGIN_METHOD(setNickname,                          CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setTriggerMode,                       CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setLatencyMode,                       CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(connect,                              CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(disconnect,                           CAPPluginReturnNone);
)
