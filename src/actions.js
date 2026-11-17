// Shared actions so every screen changes data the same way (and pad alerts always fire).
import { Linking, Alert } from 'react-native';
import { newId } from './store';
import { notifyNow } from './notifications';

export function startPeriod(update, dateKey) {
  update((d) => {
    if (d.periods.some((p) => p.start === dateKey)) return d;
    return { ...d, periods: [...d.periods, { id: newId(), start: dateKey }] };
  });
}

export function endPeriod(update, startKey, endKey) {
  update((d) => ({ ...d, periods: d.periods.map((p) => (p.start === startKey ? { ...p, end: endKey } : p)) }));
}

export function removePeriod(update, startKey) {
  update((d) => ({ ...d, periods: d.periods.filter((p) => p.start !== startKey) }));
}

// Change pad count and send a push notification when stock gets low / runs out.
export function changePads(update, data, delta) {
  const before = data.pads.count;
  const after = Math.max(0, before + delta);
  update((d) => ({ ...d, pads: { ...d.pads, count: after } }));
  const { lowAt } = data.pads;
  const product = data.pads.product.trim() || 'pads';
  if (after === 0 && before > 0) {
    notifyNow('You’re out of pads!', `Your ${product} are finished. Tap to order from Blinkit, Instamart or Zepto – delivered in minutes.`, { kind: 'pads' });
  } else if (after <= lowAt && before > lowAt) {
    notifyNow('Pads running low', `Only ${after} ${product} left. Order now so you’re ready before your next period.`, { kind: 'pads' });
  }
  return after;
}

export async function openLink(url) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open', 'Please check the app is installed or try again.');
  }
}

export const callNumber = (phone) => openLink(`tel:${phone.replace(/[^\d+]/g, '')}`);

export function whatsapp(phone) {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits; // assume India if no country code
  return openLink(`https://wa.me/${digits}`);
}
