
package com.zulpikarsandira.xnuver.target;

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
