import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';
import { Image } from 'react-native';
import { useSchoolData } from '../contexts/SchoolDataContext';

interface HardwareStreamPlayerProps {
  url: string;
  style?: any;
}

export const HardwareStreamPlayer: React.FC<HardwareStreamPlayerProps> = ({ url, style }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { schoolDetails } = useSchoolData();

  // Logic to detect MJPEG vs HLS
  const isMjpeg = useMemo(() => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    // common MJPEG patterns
    return (
      lowerUrl.includes('/video') || 
      lowerUrl.includes('mjpeg') || 
      lowerUrl.includes('cgi') || 
      (!lowerUrl.endsWith('.m3u8') && !lowerUrl.endsWith('.mp4'))
    );
  }, [url]);

  const player = useVideoPlayer(url || '', (player) => {
    player.loop = true;
    if (url && !isMjpeg) player.play();
  });

  React.useEffect(() => {
    if (url && !isMjpeg) {
      player.replaceAsync(url).then(() => player.play());
    } else {
      player.pause();
    }
  }, [url, isMjpeg]);

  if (!url) {
    return (
      <View style={[styles.container, style, styles.centered]}>
        <Text style={styles.errorText}>No Source Selected</Text>
      </View>
    );
  }

  if (isMjpeg) {
    const htmlContent = `
      <html>
        <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:center; background-color:black;">
          <img src="${url}" style="width:100%; height:auto;" />
        </body>
      </html>
    `;

    return (
      <View style={[styles.container, style]}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={false}
          scalesPageToFit={true}
          originWhitelist={['*']}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError('Connection Timeout');
          }}
        />
        {isLoading && (
          <View style={styles.stateOverlay}>
            <ActivityIndicator color="white" />
            <Text style={styles.stateText}>Initializing Hardware Bridge...</Text>
          </View>
        )}
        {error && (
          <View style={[styles.stateOverlay, styles.errorOverlay]}>
            <Text style={styles.errorTitle}>Network Mismatch Detected</Text>
            <Text style={styles.errorSubtitle}>Ensure you are on the same Wi-Fi as the camera. (HTTP error: {error})</Text>
          </View>
        )}
        <View style={styles.overlay}>
           <Text style={styles.overlayText}>MJPEG COMPATIBILITY MODE</Text>
        </View>
        {schoolDetails?.logo_url && (
          <View style={styles.watermarkContainer}>
            <Image 
              source={{ uri: schoolDetails.logo_url }} 
              style={styles.watermarkImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <VideoView 
        player={player} 
        style={styles.video}
        contentMode="contain"
      />
      <View style={styles.overlay}>
         <Text style={styles.overlayText}>NATIVE HLS STREAM</Text>
      </View>
      {schoolDetails?.logo_url && (
        <View style={styles.watermarkContainer}>
          <Image 
            source={{ uri: schoolDetails.logo_url }} 
            style={styles.watermarkImage}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overlayText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stateText: {
    color: 'white',
    fontSize: 10,
    marginTop: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  errorOverlay: {
    backgroundColor: 'rgba(20,0,0,0.9)',
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  watermarkImage: {
    width: 48,
    height: 48,
    opacity: 0.5,
  }
});
