package com.zulpikarsandira.xnuver.target;

import android.content.Context;
import android.os.PowerManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PowerModule extends ReactContextBaseJavaModule {
    private PowerManager.WakeLock wakeLock;
    private static final String TAG = "PowerModule";

    public PowerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "PowerModule";
    }

    @ReactMethod
    public void acquireWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            return;
        }

        PowerManager powerManager = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            // PARTIAL_WAKE_LOCK keeps CPU on even if screen is off
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Xnuver:BackgroundPolling");
            wakeLock.acquire();
            Log.d(TAG, "CPU WakeLock Acquired");
        }
    }

    @ReactMethod
    public void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            Log.d(TAG, "CPU WakeLock Released");
        }
    }
}
