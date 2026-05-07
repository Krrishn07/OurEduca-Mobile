import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Image, ImageBackground } from 'react-native';

// Central registry for NativeWind v4 component interop
export const registerInterops = () => {
  if (LinearGradient) {
    cssInterop(LinearGradient, {
      className: {
        target: 'style',
      },
    });
  }

  // Register common native components that might need className support
  cssInterop(Image, { className: 'style' });
  cssInterop(ImageBackground, { className: 'style' });
};

// Auto-execute if this file is imported
registerInterops();
