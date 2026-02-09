package com.zulpikarsandira.xnuver.target;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import javax.annotation.Nullable;

public class MyHeadlessJsTaskService extends HeadlessJsTaskService {

    @Override
    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            return new HeadlessJsTaskConfig(
                    "XNUVER_BG_TASK",
                    Arguments.fromBundle(extras),
                    5000, // timeout for the task
                    true // allowed in foreground
            );
        }
        return new HeadlessJsTaskConfig(
                "XNUVER_BG_TASK",
                Arguments.createMap(),
                5000, // timeout for the task
                true // allowed in foreground
        );
    }
}
