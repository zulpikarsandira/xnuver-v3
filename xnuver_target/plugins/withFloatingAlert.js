const { withAndroidManifest, withDangerousMod, withMainActivity, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = "com.zulpikarsandira.xnuver.target";
const PACKAGE_PATH = PACKAGE_NAME.replace(/\./g, '/');

const JAVA_MODULE = `
package ${PACKAGE_NAME};

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.WindowManager;
import android.view.Gravity;
import android.widget.TextView;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.graphics.PixelFormat;
import android.widget.LinearLayout;
import android.widget.Button;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FloatingAlertModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    FloatingAlertModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "FloatingAlert";
    }

    @ReactMethod
    public void checkPermission(com.facebook.react.bridge.Callback callback) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            callback.invoke(Settings.canDrawOverlays(reactContext));
        } else {
            callback.invoke(true);
        }
    }

    @ReactMethod
    public void requestPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(reactContext)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + reactContext.getPackageName()));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
            }
        }
    }

    @ReactMethod
    public void show(String title, String message) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
            return; // No permission
        }

        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                try {
                    final WindowManager windowManager = (WindowManager) reactContext.getSystemService(Context.WINDOW_SERVICE);
                    
                    // Root Layout
                    final LinearLayout layout = new LinearLayout(reactContext);
                    layout.setOrientation(LinearLayout.VERTICAL);
                    layout.setBackgroundColor(Color.parseColor("#1E1E1E"));
                    layout.setPadding(40, 40, 40, 40);
                    
                    // Border
                    android.graphics.drawable.GradientDrawable border = new android.graphics.drawable.GradientDrawable();
                    border.setColor(Color.parseColor("#1E1E1E"));
                    border.setStroke(4, Color.parseColor("#FFD700"));
                    border.setCornerRadius(30);
                    layout.setBackground(border);

                    // Title
                    TextView titleParams = new TextView(reactContext);
                    titleParams.setText(title);
                    titleParams.setTextColor(Color.WHITE);
                    titleParams.setTextSize(18);
                    titleParams.setTypeface(null, android.graphics.Typeface.BOLD);
                    titleParams.setGravity(Gravity.CENTER);
                    layout.addView(titleParams);

                    // Message
                    TextView msgParams = new TextView(reactContext);
                    msgParams.setText(message);
                    msgParams.setTextColor(Color.LTGRAY);
                    msgParams.setTextSize(14);
                    msgParams.setPadding(0, 20, 0, 30);
                    msgParams.setGravity(Gravity.CENTER);
                    layout.addView(msgParams);

                    // Button
                    Button closeBtn = new Button(reactContext);
                    closeBtn.setText("OK, UNDERSTOOD");
                    closeBtn.setBackgroundColor(Color.parseColor("#FFD700"));
                    closeBtn.setTextColor(Color.BLACK);
                    
                    layout.addView(closeBtn);

                    int type;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        type = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                    } else {
                        type = WindowManager.LayoutParams.TYPE_PHONE;
                    }

                    final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                            WindowManager.LayoutParams.MATCH_PARENT,
                            WindowManager.LayoutParams.WRAP_CONTENT,
                            type,
                            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED,
                            PixelFormat.TRANSLUCENT);

                    params.gravity = Gravity.CENTER;
                    params.width = (int) (reactContext.getResources().getDisplayMetrics().widthPixels * 0.85);

                    windowManager.addView(layout, params);

                    closeBtn.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            try {
                                windowManager.removeView(layout);
                            } catch (Exception e) {}
                        }
                    });

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
`;

const JAVA_PACKAGE = `
package ${PACKAGE_NAME};

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FloatingAlertPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new FloatingAlertModule(reactContext));
        return modules;
    }
}
`;

const withFloatingAlert = (config) => {
    // 1. Add Permissions & Service
    config = withAndroidManifest(config, (config) => {
        const manifest = config.modResults;
        const mainApplication = manifest.manifest.application[0];

        // Permissions
        const permissions = [
            'android.permission.SYSTEM_ALERT_WINDOW',
            'android.permission.FOREGROUND_SERVICE',
            'android.permission.FOREGROUND_SERVICE_DATA_SYNC'
        ];

        if (!manifest.manifest['uses-permission']) {
            manifest.manifest['uses-permission'] = [];
        }

        permissions.forEach(perm => {
            if (!manifest.manifest['uses-permission'].some(p => p.$['android:name'] === perm)) {
                manifest.manifest['uses-permission'].push({
                    $: { 'android:name': perm }
                });
            }
        });

        // Add Notifee Foreground Service
        if (!mainApplication.service) {
            mainApplication.service = [];
        }

        // Check if service already exists
        const notifeeServiceExists = mainApplication.service.some(
            s => s.$['android:name'] === 'app.notifee.core.ForegroundService'
        );

        if (!notifeeServiceExists) {
            mainApplication.service.push({
                $: {
                    'android:name': 'app.notifee.core.ForegroundService',
                    'android:foregroundServiceType': 'dataSync',
                    'android:exported': 'false'
                }
            });
        }

        return config;
    });

    // 2. Write Java Files & Inject Package
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const packagePath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', ...PACKAGE_PATH.split('/'));

            // Ensure dir exists
            fs.mkdirSync(packagePath, { recursive: true });

            // Write Files
            fs.writeFileSync(path.join(packagePath, 'FloatingAlertModule.java'), JAVA_MODULE);
            fs.writeFileSync(path.join(packagePath, 'FloatingAlertPackage.java'), JAVA_PACKAGE);

            // Inject into MainApplication.java (Naive Injection - works with default Expo template)
            const mainAppPath = path.join(packagePath, 'MainApplication.java');

            if (fs.existsSync(mainAppPath)) {
                let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
                if (!mainAppContent.includes('new FloatingAlertPackage()')) {
                    const importStatement = `import ${PACKAGE_NAME}.FloatingAlertPackage;\n`;

                    if (!mainAppContent.includes(importStatement)) {
                        // Add import after package declaration
                        mainAppContent = mainAppContent.replace(/package .*?;/, `$& \n${importStatement}`);
                    }

                    if (mainAppContent.includes('new PackageList')) {
                        mainAppContent = mainAppContent.replace(
                            /new PackageList\(this\)\.getPackages\(\);/,
                            `new PackageList(this).getPackages();\n          packages.add(new FloatingAlertPackage());`
                        );
                        fs.writeFileSync(mainAppPath, mainAppContent);
                    } else {
                        console.warn("Could not find suitable injection point in MainApplication.java for FloatingAlertPackage");
                    }
                }
            } else {
                // If using Kotlin (MainApplication.kt)
                const mainAppKtPath = path.join(packagePath, 'MainApplication.kt');
                if (fs.existsSync(mainAppKtPath)) {
                    let mainAppContent = fs.readFileSync(mainAppKtPath, 'utf8');
                    if (!mainAppContent.includes('FloatingAlertPackage()')) {
                        mainAppContent = mainAppContent.replace(
                            /PackageList\(this\)\.packages/,
                            `PackageList(this).packages.apply { add(FloatingAlertPackage()) }`
                        );
                        fs.writeFileSync(mainAppKtPath, mainAppContent);
                    }
                }
            }

            return config;
        }
    ]);

    return config;
};

module.exports = withFloatingAlert;
