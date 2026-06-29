package dev.educonecta.app;

import android.net.Uri;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class MainActivity extends LauncherActivity {
    @Override
    protected Uri getLaunchingUrl() {
        return new Uri.Builder()
                .scheme("https")
                .authority("educonecta-zeta.vercel.app")
                .path("/")
                .build();
    }
}
