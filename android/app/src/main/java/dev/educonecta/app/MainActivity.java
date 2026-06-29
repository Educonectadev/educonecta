package dev.educonecta.app;

import android.net.Uri;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class MainActivity extends LauncherActivity {
    @Override
    protected Uri getLaunchingUrl() {
        return new Uri.Builder()
                .scheme("https")
                .authority("CHANGE_ME_YOUR_DOMAIN_HERE")
                .path("/")
                .build();
    }
}
