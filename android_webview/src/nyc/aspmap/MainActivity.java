package nyc.aspmap;
import android.os.*;
import android.app.*;
import android.webkit.*;

public class MainActivity extends Activity {
   @Override
   protected void onCreate(Bundle savedInstanceState) {       
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_main);
      WebView myWebView = (WebView) findViewById(R.id.webview);
      WebSettings webSettings = myWebView.getSettings();

      webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
      webSettings.setAllowFileAccess(true);
      webSettings.setAllowFileAccessFromFileURLs(true);
      webSettings.setDomStorageEnabled(true);
      webSettings.setJavaScriptEnabled(true);

      myWebView.loadUrl("file:///android_asset/index.html");
   }
}
