// ---- Things YOU (the developer) change before publishing ----

// A small JSON file you host anywhere public (GitHub raw, Firebase Hosting, your website).
// When you release a new version, bump "latestVersion" in that file and every user gets the update popup.
// See version.json in the project root for the format. Leave '' to turn the check off.
export const UPDATE_CHECK_URL = 'https://nitesh2907.github.io/bloom-period-tracker/version.json';

// Your store pages (fill in after you publish).
// The app is shared as an APK from the website, so the update button downloads the newest APK.
export const PLAY_STORE_URL = 'https://nitesh2907.github.io/bloom-period-tracker/bloom.apk';
export const APP_STORE_URL = 'https://apps.apple.com/app/id0000000000';

// Quick-commerce apps for ordering pads. Opening these links opens the app if it is installed.
export const SHOPS = [
  { id: 'blinkit', name: 'Blinkit', color: '#F8CB46', text: '#1A1A1A', url: (q) => `https://blinkit.com/s/?q=${encodeURIComponent(q)}` },
  { id: 'instamart', name: 'Swiggy Instamart', color: '#FC8019', text: '#FFFFFF', url: (q) => `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(q)}` },
  { id: 'zepto', name: 'Zepto', color: '#5E1A8C', text: '#FFFFFF', url: (q) => `https://www.zeptonow.com/search?query=${encodeURIComponent(q)}` },
  { id: 'bbnow', name: 'BigBasket', color: '#84C225', text: '#1A1A1A', url: (q) => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(q)}` },
];
