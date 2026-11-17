import { addDays, diffDays, todayKey } from './dates';

export const DEFAULT_CYCLE = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export function sortedPeriods(periods) {
  return [...periods].sort((a, b) => (a.start < b.start ? -1 : 1));
}

// Gap between each period start and the next one, e.g. 28 Jan -> 27 Feb = 30 days.
export function cycleGaps(periods) {
  const list = sortedPeriods(periods);
  const gaps = [];
  for (let i = 1; i < list.length; i++) {
    gaps.push({ from: list[i - 1].start, to: list[i].start, days: diffDays(list[i - 1].start, list[i].start) });
  }
  return gaps;
}

export function periodLength(p) {
  return p.end ? diffDays(p.start, p.end) + 1 : null;
}

export function getStats(periods, settings = {}) {
  const list = sortedPeriods(periods);
  const gaps = cycleGaps(list);
  // Ignore gaps that are clearly a missed log (e.g. 2 cycles logged as one) when averaging.
  const usable = gaps.filter((g) => g.days >= 15 && g.days <= 60).slice(-6);
  const avgCycle = usable.length
    ? Math.round(usable.reduce((s, g) => s + g.days, 0) / usable.length)
    : settings.defaultCycle || DEFAULT_CYCLE;

  const lengths = list.map(periodLength).filter((n) => n && n > 0 && n <= 15).slice(-6);
  const avgPeriod = lengths.length
    ? Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length)
    : settings.defaultPeriodLength || DEFAULT_PERIOD_LENGTH;

  const shortest = usable.length ? Math.min(...usable.map((g) => g.days)) : null;
  const longest = usable.length ? Math.max(...usable.map((g) => g.days)) : null;

  const last = list[list.length - 1] || null;
  const today = todayKey();
  let status = { kind: 'empty' };
  let nextStart = null;

  if (last) {
    nextStart = addDays(last.start, avgCycle);
    const dayOfCycle = diffDays(last.start, today) + 1;
    const ongoing = !last.end && dayOfCycle <= Math.max(avgPeriod, 1) + 2;
    const inLoggedPeriod = last.end && today >= last.start && today <= last.end;
    if (ongoing || inLoggedPeriod) {
      status = { kind: 'period', day: dayOfCycle };
    } else {
      let daysUntil = diffDays(today, nextStart);
      if (daysUntil < -14) {
        // Very old data (she probably forgot to log): project forward instead of saying "200 days late".
        while (daysUntil < 0) {
          nextStart = addDays(nextStart, avgCycle);
          daysUntil = diffDays(today, nextStart);
        }
        status = { kind: 'waiting', daysUntil, dayOfCycle: avgCycle - daysUntil, stale: true };
      } else {
        status = daysUntil >= 0 ? { kind: 'waiting', daysUntil, dayOfCycle } : { kind: 'late', daysLate: -daysUntil, dayOfCycle };
      }
    }
  }

  return { avgCycle, avgPeriod, gaps, shortest, longest, nextStart, last, status, hasHistory: usable.length > 0 };
}

// Which logged days were period days (for the calendar).
export function periodDaySet(periods, avgPeriod) {
  const set = new Set();
  const today = todayKey();
  for (const p of periods) {
    const len = periodLength(p) || avgPeriod;
    for (let i = 0; i < len; i++) {
      const k = addDays(p.start, i);
      if (!p.end && k > today) break;
      set.add(k);
    }
  }
  return set;
}

export function predictedDaySet(stats, count = 3) {
  const set = new Set();
  if (!stats.nextStart) return set;
  let start = stats.nextStart;
  const today = todayKey();
  // If late, keep showing the next expected window starting today.
  if (start < today && stats.status.kind === 'late') start = today;
  for (let c = 0; c < count; c++) {
    const s = addDays(start, c * stats.avgCycle);
    for (let i = 0; i < stats.avgPeriod; i++) set.add(addDays(s, i));
  }
  return set;
}

// Things in the cycle history worth showing a doctor.
export function cycleWarnings(periods, stats) {
  const warnings = [];
  const recent = stats.gaps.slice(-3);
  if (recent.length >= 2 && recent.every((g) => g.days < 21)) {
    warnings.push('Your last few cycles were shorter than 21 days.');
  }
  if (recent.length >= 2 && recent.every((g) => g.days > 35 && g.days <= 60)) {
    warnings.push('Your last few cycles were longer than 35 days.');
  }
  const last = sortedPeriods(periods).slice(-1)[0];
  if (last) {
    const len = periodLength(last) || (!last.end ? diffDays(last.start, todayKey()) + 1 : 0);
    if (len > 7 && (last.end || len <= 15)) warnings.push(`Your period has lasted ${len} days (more than 7).`);
  }
  if (stats.shortest && stats.longest && stats.longest - stats.shortest > 20 && stats.gaps.length >= 3) {
    warnings.push('Your cycle length changes by more than 20 days between months.');
  }
  return warnings;
}
