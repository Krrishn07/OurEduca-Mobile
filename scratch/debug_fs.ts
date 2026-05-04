import * as FileSystem from 'expo-file-system';

export const debugFileSystem = () => {
  console.log('FileSystem Keys:', Object.keys(FileSystem));
  if (FileSystem.File) {
    const testFile = new FileSystem.File(FileSystem.cacheDirectory + 'test.txt');
    console.log('File Instance Keys:', Object.keys(testFile));
    console.log('File Instance Proto Keys:', Object.keys(Object.getPrototypeOf(testFile)));
  }
};
