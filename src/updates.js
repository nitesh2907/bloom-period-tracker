import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { UPDATE_CHECK_URL, PLAY_STORE_URL, APP_STORE_URL } from './config';

export const currentVersion = Constants.expoConfig?.version || '1.0.0';

// 1.2.10 > 1.2.9
export function isNewer(latest, current) {
  const a = String(latest).split('.').map(Number);
  const b = String(current).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

// Expected JSON: { "latestVersion": "1.1.0", "message": "...", "mandatory": false, "androidUrl": "...", "iosUrl": "..." }
export async function checkForUpdate() {
  if (!UPDATE_CHECK_URL) return null;
  try {
    const res = await fetch(`${UPDATE_CHECK_URL}?t=${Date.now()}`);
    if (!res.ok) return null;
    const info = await res.json();
    if (!info.latestVersion || !isNewer(info.latestVersion, currentVersion)) return null;
    return {
      version: info.latestVersion,
      message: info.message || 'A new version of Bloom is ready with improvements and fixes.',
      mandatory: !!info.mandatory,
      url: Platform.OS === 'ios' ? info.iosUrl || APP_STORE_URL : info.androidUrl || PLAY_STORE_URL,
    };
  } catch {
    return null; // offline – try again next launch
  }
}
