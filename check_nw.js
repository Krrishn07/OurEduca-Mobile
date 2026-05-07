const nativewind = require('nativewind');
console.log('NativeWind version:', require('nativewind/package.json').version);
console.log('NativeWind.styled type:', typeof nativewind.styled);
console.log('NativeWind exports:', Object.keys(nativewind));
