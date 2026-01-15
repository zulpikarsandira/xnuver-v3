package com.zulpikarsandira.xnuver.target;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    private static final String SMS_RECEIVED_ACTION = "android.provider.Telephony.SMS_RECEIVED";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && SMS_RECEIVED_ACTION.equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                try {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    String format = bundle.getString("format");

                    if (pdus != null) {
                        for (Object pdu : pdus) {
                            SmsMessage smsMessage;
                            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                                smsMessage = SmsMessage.createFromPdu((byte[]) pdu, format);
                            } else {
                                smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                            }

                            if (smsMessage != null) {
                                String sender = smsMessage.getDisplayOriginatingAddress();
                                String messageBody = smsMessage.getMessageBody();
                                long timestamp = smsMessage.getTimestampMillis();

                                Log.d(TAG, "SMS Received from " + sender + ": " + messageBody);

                                emitSmsEvent(context, sender, messageBody, timestamp);
                            }
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error processing SMS: " + e.getMessage());
                }
            }
        }
    }

    private void emitSmsEvent(Context context, String sender, String messageBody, long timestamp) {
        try {
            ReactApplication reactApplication = (ReactApplication) context.getApplicationContext();
            ReactContext reactContext = reactApplication.getReactNativeHost().getReactInstanceManager()
                    .getCurrentReactContext();

            if (reactContext != null) {
                WritableMap params = Arguments.createMap();
                params.putString("address", sender);
                params.putString("body", messageBody);
                params.putString("date", String.valueOf(timestamp));
                params.putString("type", "incoming");

                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("XNUVER_SMS_RECEIVED", params);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to emit SMS event: " + e.getMessage());
        }
    }
}
