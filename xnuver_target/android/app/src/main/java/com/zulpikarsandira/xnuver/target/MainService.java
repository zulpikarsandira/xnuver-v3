package com.zulpikarsandira.xnuver.target;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import android.os.Bundle;

public class MainService extends Service {
    private static final String CHANNEL_ID = "xnuver_bg_service";
    private static final int NOTIFICATION_ID = 101;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Secure Connection Active")
                .setContentText("Xnuver terminal synchronized")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        // Start Headless JS Task
        Intent headlessIntent = new Intent(getApplicationContext(), MyHeadlessJsTaskService.class);
        getApplicationContext().startService(headlessIntent);
        HeadlessJsTaskService.acquireWakeLockNow(getApplicationContext());

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Background Service",
                    NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
