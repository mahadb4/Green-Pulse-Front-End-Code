import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Renders a QR code for any string (e.g. an otpauth:// URL) inside a WebView,
 * using the qrcode library from a CDN. The value is encoded entirely on-device
 * (only the QR lib JS is fetched), so secrets are never sent anywhere.
 */
export default function QrCode({ value, size = 210 }: { value: string; size?: number }) {
  const html =
    '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">' +
    '<style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#fff}' +
    '#q{width:' + size + 'px;height:' + size + 'px}</style></head><body>' +
    '<canvas id="q"></canvas>' +
    '<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>' +
    '<script>(function(){var v=' + JSON.stringify(value) +
    ';function draw(){if(window.QRCode&&QRCode.toCanvas){QRCode.toCanvas(document.getElementById("q"),v,{width:' +
    size + ',margin:1},function(){});}else{setTimeout(draw,150);}}draw();})();</script>' +
    '</body></html>';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://greenpulse.local/' }}
        javaScriptEnabled
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
