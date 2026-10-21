import type { CapacitorConfig } from '@capacitor/cli';

// NOTE: change appId BEFORE you first run `npx cap add android`.
// It becomes the permanent package name of the Android app.
const config: CapacitorConfig = {
  appId: 'in.citystar.hardware',
  appName: 'Citystar Hardware',
  webDir: 'dist',
};

export default config;
