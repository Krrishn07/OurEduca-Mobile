import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
  name?: string;
  email?: string;
  contact?: string;
}

interface RazorpayCheckoutProps {
  order: RazorpayOrder;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: any) => void;
  onClose: () => void;
}

export const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  order,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4f46e5;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <script>
          const options = {
            "key": "${order.key_id}",
            "amount": "${order.amount}",
            "currency": "${order.currency}",
            "name": "Oureduca Payments",
            "description": "Institutional Fee Settlement",
            "order_id": "${order.id}",
            "prefill": {
              "name": "${order.name || ''}",
              "email": "${order.email || ''}",
              "contact": "${order.contact || ''}"
            },
            "theme": {
              "color": "#4f46e5"
            },
            "modal": {
                "ondismiss": function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'CLOSED' }));
                }
            },
            "handler": function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: 'SUCCESS',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              }));
            }
          };
          
          const rzp = new Razorpay(options);
          
          rzp.on('payment.failed', function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'FAILURE',
              error: response.error
            }));
          });

          window.onload = function() {
            rzp.open();
          };
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[RAZORPAY_WEBVIEW] Message received:', data.event);
      
      switch (data.event) {
        case 'SUCCESS':
          onSuccess(data.paymentId, data.orderId, data.signature);
          break;
        case 'FAILURE':
          onFailure(data.error);
          break;
        case 'CLOSED':
          onClose();
          break;
      }
    } catch (err) {
      console.error('[RAZORPAY_WEBVIEW] Parse error:', err);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} className="bg-white z-[1000]">
      <WebView
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-slate-50/80">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}
        style={{ flex: 1 }}
      />
    </View>
  );
};
