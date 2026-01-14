package com.zulpikarsandira.xnuver.target;

import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class WallpaperModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    WallpaperModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "WallpaperModule";
    }

    @ReactMethod
    public void setWallpaper(String imageUrl, Promise promise) {
        new SetWallpaperTask(imageUrl, promise).execute();
    }

    private static class SetWallpaperTask extends AsyncTask<Void, Void, Boolean> {
        private String imageUrl;
        private Promise promise;
        private String errorMessage = "";

        SetWallpaperTask(String imageUrl, Promise promise) {
            this.imageUrl = imageUrl;
            this.promise = promise;
        }

        @Override
        protected Boolean doInBackground(Void... voids) {
            try {
                URL url = new URL(imageUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setDoInput(true);
                connection.connect();
                InputStream input = connection.getInputStream();
                Bitmap myBitmap = BitmapFactory.decodeStream(input);

                if (myBitmap == null) {
                    errorMessage = "Failed to decode image. Make sure the URL points directly to an image file.";
                    Log.e("WallpaperModule", errorMessage);
                    return false;
                }

                WallpaperManager wallpaperManager = WallpaperManager.getInstance(reactContext);
                wallpaperManager.setBitmap(myBitmap);
                return true;
            } catch (Exception e) {
                Log.e("WallpaperModule", "Error setting wallpaper: " + e.getMessage());
                errorMessage = e.getMessage();
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (success) {
                promise.resolve("Wallpaper updated successfully");
            } else {
                promise.reject("ERROR", errorMessage);
            }
        }
    }
}
