const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = "com.zulpikarsandira.xnuver.target";
const PACKAGE_PATH = PACKAGE_NAME.replace(/\./g, '/');

const JAVA_MODULE = `
package ${PACKAGE_NAME};

import android.content.Context;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraManager;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FlashlightModule extends ReactContextBaseJavaModule {
    private static final String TAG = "FlashlightModule";
    private static ReactApplicationContext reactContext;
    private CameraManager cameraManager;
    private String cameraId;

    FlashlightModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        
        try {
            cameraManager = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
            // Get the first camera with flash
            if (cameraManager != null) {
                String[] cameraIdList = cameraManager.getCameraIdList();
                if (cameraIdList.length > 0) {
                    cameraId = cameraIdList[0]; // Usually back camera
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error initializing camera manager", e);
        }
    }

    @Override
    public String getName() {
        return "FlashlightModule";
    }

    @ReactMethod
    public void turnOn() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraManager != null && cameraId != null) {
                cameraManager.setTorchMode(cameraId, true);
                Log.d(TAG, "Flashlight turned ON");
            }
        } catch (CameraAccessException e) {
            Log.e(TAG, "Error turning flashlight ON", e);
        }
    }

    @ReactMethod
    public void turnOff() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraManager != null && cameraId != null) {
                cameraManager.setTorchMode(cameraId, false);
                Log.d(TAG, "Flashlight turned OFF");
            }
        } catch (CameraAccessException e) {
            Log.e(TAG, "Error turning flashlight OFF", e);
        }
    }

    @ReactMethod
    public void toggle() {
        // For future use if needed
        Log.d(TAG, "Toggle not implemented - use turnOn/turnOff");
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

public class FlashlightPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new FlashlightModule(reactContext));
        return modules;
    }
}
`;

const withFlashlight = (config) => {
    // 1. Add FLASHLIGHT permission to manifest
    config = withAndroidManifest(config, (config) => {
        const manifest = config.modResults;

        if (!manifest.manifest['uses-permission']) {
            manifest.manifest['uses-permission'] = [];
        }

        const flashlightPerm = 'android.permission.FLASHLIGHT';
        if (!manifest.manifest['uses-permission'].some(p => p.$['android:name'] === flashlightPerm)) {
            manifest.manifest['uses-permission'].push({
                $: { 'android:name': flashlightPerm }
            });
        }

        // Add camera feature (required for flashlight)
        if (!manifest.manifest['uses-feature']) {
            manifest.manifest['uses-feature'] = [];
        }

        const cameraFeature = 'android.hardware.camera';
        if (!manifest.manifest['uses-feature'].some(f => f.$['android:name'] === cameraFeature)) {
            manifest.manifest['uses-feature'].push({
                $: {
                    'android:name': cameraFeature,
                    'android:required': 'false' // Not all devices have camera, but most do
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
            fs.writeFileSync(path.join(packagePath, 'FlashlightModule.java'), JAVA_MODULE);
            fs.writeFileSync(path.join(packagePath, 'FlashlightPackage.java'), JAVA_PACKAGE);

            // Inject into MainApplication.java
            const mainAppPath = path.join(packagePath, 'MainApplication.java');

            if (fs.existsSync(mainAppPath)) {
                let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
                if (!mainAppContent.includes('new FlashlightPackage()')) {
                    const importStatement = `import ${PACKAGE_NAME}.FlashlightPackage;\\n`;

                    if (!mainAppContent.includes(importStatement)) {
                        mainAppContent = mainAppContent.replace(/package .*?;/, `$& \\n${importStatement}`);
                    }

                    if (mainAppContent.includes('new PackageList')) {
                        mainAppContent = mainAppContent.replace(
                            /new PackageList\(this\)\.getPackages\(\);/,
                            `new PackageList(this).getPackages();\\n          packages.add(new FlashlightPackage());`
                        );
                        fs.writeFileSync(mainAppPath, mainAppContent);
                    } else {
                        console.warn("Could not find suitable injection point in MainApplication.java for FlashlightPackage");
                    }
                }
            } else {
                // If using Kotlin
                const mainAppKtPath = path.join(packagePath, 'MainApplication.kt');
                if (fs.existsSync(mainAppKtPath)) {
                    let mainAppContent = fs.readFileSync(mainAppKtPath, 'utf8');
                    if (!mainAppContent.includes('FlashlightPackage()')) {
                        mainAppContent = mainAppContent.replace(
                            /PackageList\(this\)\.packages/,
                            `PackageList(this).packages.apply { add(FlashlightPackage()) }`
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

module.exports = withFlashlight;
