// General wellbeing guidance. Not a diagnosis – the app always points to a doctor for anything serious.

export const FLOWS = [
  { id: 'spotting', label: 'Spotting', hint: 'A few drops' },
  { id: 'light', label: 'Light', hint: 'Pad lasts 6+ hrs' },
  { id: 'medium', label: 'Medium', hint: 'Change every 4–6 hrs' },
  { id: 'heavy', label: 'Heavy', hint: 'Change every 2–3 hrs' },
  { id: 'very_heavy', label: 'Very heavy', hint: 'Soak through in 1–2 hrs' },
];

export const SYMPTOMS = ['Cramps', 'Back pain', 'Headache', 'Bloating', 'Tired', 'Mood swings', 'Nausea', 'Clots', 'Dizzy', 'Acne', 'Cravings'];

const IRON_FOODS = [
  { icon: 'mci:food-apple', name: 'Pomegranate & apple', why: 'Iron to replace what you lose' },
  { icon: 'mci:fruit-grapes', name: 'Dates & raisins', why: 'Iron + quick energy' },
  { icon: 'mci:leaf', name: 'Spinach / palak', why: 'Rich in iron and folate' },
  { icon: 'mci:sprout', name: 'Beetroot', why: 'Iron and folate' },
  { icon: 'mci:fruit-citrus', name: 'Orange, guava, amla', why: 'Vitamin C helps your body absorb iron' },
];

const CRAMP_FOODS = [
  { icon: 'mci:fruit-pear', name: 'Banana', why: 'Potassium & B6 can ease cramps and bloating' },
  { icon: 'mci:tea', name: 'Ginger tea', why: 'Studies show ginger can reduce period pain' },
  { icon: 'mci:peanut', name: 'Almonds, walnuts, pumpkin seeds', why: 'Magnesium relaxes muscles' },
  { icon: 'mci:candy', name: 'A little dark chocolate', why: 'Magnesium + a mood lift' },
  { icon: 'mci:seed', name: 'Flaxseeds', why: 'Omega-3 may lower inflammation' },
];

const LIGHT_FOODS = [
  { icon: 'mci:fruit-watermelon', name: 'Watermelon & cucumber', why: 'Keeps you hydrated, less bloating' },
  { icon: 'mci:bowl-mix', name: 'Curd / yogurt', why: 'Calcium; gentle on the stomach' },
  { icon: 'mci:fruit-cherries', name: 'Kiwi & berries', why: 'Vitamin C and antioxidants' },
];

const NAUSEA_FOODS = [{ icon: 'mci:cup-water', name: 'Lemon water / jeera water', why: 'Light on the stomach when you feel sick' }];

export function getAdvice({ flow, pain = 0, symptoms = [] }) {
  const foods = [];
  const care = [];
  const doctorReasons = [];
  const s = new Set(symptoms);

  const heavy = flow === 'heavy' || flow === 'very_heavy';
  const cramps = pain >= 3 || s.has('Cramps') || s.has('Back pain');
  if (s.has('Nausea')) foods.push(...NAUSEA_FOODS);
  if (heavy && cramps) foods.push(...interleave(IRON_FOODS, CRAMP_FOODS));
  else if (heavy) foods.push(...IRON_FOODS);
  else if (cramps) foods.push(...CRAMP_FOODS);
  if (!foods.length) foods.push(...LIGHT_FOODS, IRON_FOODS[0], CRAMP_FOODS[0]);

  care.push('Drink plenty of water (8–10 glasses).');
  if (pain >= 3) {
    care.push('Put a hot water bag on your lower tummy or back for 15–20 minutes.');
    care.push('Gentle stretching, a slow walk or child’s pose yoga can relax the muscles.');
  }
  if (flow === 'heavy' || flow === 'very_heavy') care.push('Change your pad every 3–4 hours (sooner if needed) and rest when you can.');
  care.push('Cut down on very salty food, fizzy drinks and too much tea/coffee – they can make bloating and cramps worse.');
  if (s.has('Tired')) care.push('Try to sleep 7–9 hours; tiredness is common, but extreme tiredness can mean low iron.');

  // When to see a doctor
  if (pain >= 8) doctorReasons.push('Your pain is severe (8/10 or more).');
  if (flow === 'very_heavy') doctorReasons.push('Soaking through a pad every 1–2 hours is very heavy bleeding.');
  if (s.has('Clots') && (flow === 'heavy' || flow === 'very_heavy')) doctorReasons.push('Heavy flow with clots (especially bigger than a coin) should be checked.');
  if (s.has('Dizzy')) doctorReasons.push('Feeling dizzy or faint during your period can mean low iron (anaemia).');

  let level = 'ok';
  if (doctorReasons.length) level = 'doctor';
  else if (pain >= 6) level = 'watch';

  return { foods: dedupe(foods).slice(0, 6), care, doctorReasons, level };
}

function interleave(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((f) => (seen.has(f.name) ? false : seen.add(f.name)));
}

// Several painful days in a row also deserve a doctor visit.
export function recentPainWarning(logs, dates) {
  const painful = dates.filter((d) => (logs[d]?.pain || 0) >= 7);
  return painful.length >= 3 ? 'You logged strong pain (7+/10) on 3 or more days recently.' : null;
}
