package com.zulpikarsandira.xnuver.target;

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

    public FlashlightModule(ReactApplicationContext context) {
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

    private void ensureCameraId() {
        try {
            if (cameraId == null && cameraManager != null) {
                String[] cameraIdList = cameraManager.getCameraIdList();
                if (cameraIdList.length > 0) {
                    cameraId = cameraIdList[0];
                    Log.d(TAG, "Camera ID found: " + cameraId);
                }
            }
        } catch (CameraAccessException e) {
            Log.e(TAG, "Failed to get camera list", e);
        }
    }

    @ReactMethod
    public void turnOn() {
        ensureCameraId();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraManager != null && cameraId != null) {
                cameraManager.setTorchMode(cameraId, true);
                Log.d(TAG, "Flashlight turned ON");
            } else {
                Log.e(TAG, "Cannot turn ON: cameraManager=" + (cameraManager != null) + ", cameraId=" + cameraId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error turning flashlight ON: " + e.getMessage());
        }
    }

    @ReactMethod
    public void turnOff() {
        ensureCameraId();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraManager != null && cameraId != null) {
                cameraManager.setTorchMode(cameraId, false);
                Log.d(TAG, "Flashlight turned OFF");
            } else {
                Log.e(TAG, "Cannot turn OFF: cameraManager=" + (cameraManager != null) + ", cameraId=" + cameraId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error turning flashlight OFF: " + e.getMessage());
        }
    }

    @ReactMethod
    public void toggle() {
        // For future use if needed
        Log.d(TAG, "Toggle not implemented - use turnOn/turnOff");
    }
}
