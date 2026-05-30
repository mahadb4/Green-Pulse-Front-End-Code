import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Renders a QR code for any string (e.g. an otpauth:// URL) inside a WebView.
 * The value is encoded entirely on-device — only the QR library JS is fetched —
 * so secrets are never transmitted. Tries node-qrcode (canvas) first, then falls
 * back to davidshimjs/qrcodejs (div); shows a message if both CDNs are blocked.
 */
export default function QrCode({ value, size = 210 }: { value: string; size?: number }) {
  const v = JSON.stringify(value);
  const html =
    '<!DOCTYPE html><html><head>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">' +
    '<style>' +
    'html,body{margin:0;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff}' +
    '#wrap{display:flex;align-items:center;justify-content:center}' +
    '#qd img,#qd canvas,#qc{width:' + size + 'px!important;height:' + size + 'px!important}' +
    '#msg{font-family:system-ui,sans-serif;color:#991B1B;font-size:12px;text-align:center;padding:10px;display:none}' +
    '</style></head><body>' +
    '<div id="wrap"><canvas id="qc"></canvas><div id="qd"></div></div>' +
    '<div id="msg">Could not draw the QR. Use the setup key below in your authenticator app.</div>' +
    '<script>(function(){' +
    'var V=' + v + ',SIZE=' + size + ';' +
    'function fail(){var m=document.getElementById("msg");if(m)m.style.display="block";}' +
    'function loadScript(src,cb){var s=document.createElement("script");s.src=src;s.onload=function(){cb(true);};s.onerror=function(){cb(false);};document.head.appendChild(s);}' +
    'function drawDavid(){try{var d=document.getElementById("qd");d.innerHTML="";new QRCode(d,{text:V,width:SIZE,height:SIZE,correctLevel:QRCode.CorrectLevel.M});return true;}catch(e){return false;}}' +
    'function goDavid(){loadScript("https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js",function(ok){if(!(ok&&window.QRCode&&drawDavid()))fail();});}' +
    'loadScript("https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js",function(ok){' +
    'if(ok&&window.QRCode&&QRCode.toCanvas){try{QRCode.toCanvas(document.getElementById("qc"),V,{width:SIZE,margin:1},function(err){if(err)goDavid();});}catch(e){goDavid();}}' +
    'else{goDavid();}});' +
    '})();</script></body></html>';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://greenpulse.local/' }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        scrollEnabled={false}
        style={{ width: size, height: size, backgroundColor: '#fff' }}
        containerStyle={{ width: size, height: size }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' },
});
