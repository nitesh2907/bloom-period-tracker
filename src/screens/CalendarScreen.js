import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, H, P, Row, Title } from '../components/ui';
import { C } from '../theme';
import { MONTHS_LONG, diffDays, parseTyped, pretty, toKey, todayKey } from '../dates';
import { useStore } from '../store';
import { endPeriod, removePeriod, startPeriod } from '../actions';
import Icon from '../components/Icon';
import { periodDaySet, periodLength, predictedDaySet, sortedPeriods } from '../cycle';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function confirm(title, msg, onYes) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${msg}`)) onYes();
    return;
  }
  Alert.alert(title, msg, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: onYes }]);
}

export default function CalendarScreen({ stats }) {
  const { data, update } = useStore();
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayKey());
  const [typedStart, setTypedStart] = useState('');
  const [typedEnd, setTypedEnd] = useState('');
  const [error, setError] = useState('');

  const periodDays = useMemo(() => periodDaySet(data.periods, stats.avgPeriod), [data.periods, stats.avgPeriod]);
  const predicted = useMemo(() => predictedDaySet(stats), [stats]);
  const today = todayKey();
  const list = sortedPeriods(data.periods);

  const cells = useMemo(() => {
    const first = new Date(month.y, month.m, 1);
    const daysIn = new Date(month.y, month.m + 1, 0).getDate();
    const arr = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysIn; d++) arr.push(toKey(new Date(month.y, month.m, d)));
    while (arr.length % 7) arr.push(null);
    return arr;
  }, [month]);

  const shift = (n) => setMonth(({ y, m }) => {
    const d = new Date(y, m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  // Period that contains the selected day (or an open one before it)
  const containing = list.filter((p) => p.start <= selected).slice(-1)[0];
  const isStart = list.some((p) => p.start === selected);
  const canEnd = containing && !isStart && selected <= today && diffDays(containing.start, selected) < 15 && (!containing.end || containing.end !== selected);
  const log = data.logs[selected];

  const addTyped = () => {
    setError('');
    const start = parseTyped(typedStart);
    if (!start) return setError('Type the start date like 28-01-2026');
    if (start > today) return setError('Start date can’t be in the future');
    let end;
    if (typedEnd.trim()) {
      end = parseTyped(typedEnd);
      if (!end) return setError('Type the end date like 01-02-2026');
      if (end < start) return setError('End date is before the start date');
      if (diffDays(start, end) > 14) return setError('That period is longer than 15 days – please check the dates');
    }
    if (list.some((p) => p.start === start)) return setError('You already added a period on that date');
    startPeriod(update, start);
    if (end) endPeriod(update, start, end);
    setTypedStart('');
    setTypedEnd('');
    setMonth({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });
    setSelected(start);
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Title style={{ marginBottom: 14 }}>Calendar</Title>

      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <Pressable onPress={() => shift(-1)} hitSlop={12} accessibilityLabel="Previous month">
            <Icon name="chevron-back-circle" size={32} color={C.rose} />
          </Pressable>
          <Text style={s.month}>
            {MONTHS_LONG[month.m]} {month.y}
          </Text>
          <Pressable onPress={() => shift(1)} hitSlop={12} accessibilityLabel="Next month">
            <Icon name="chevron-forward-circle" size={32} color={C.rose} />
          </Pressable>
        </Row>
        <View style={s.grid}>
          {WEEK.map((w, i) => (
            <Text key={i} style={s.week}>
              {w}
            </Text>
          ))}
          {cells.map((k, i) => {
            if (!k) return <View key={i} style={s.cell} />;
            const isPeriod = periodDays.has(k);
            const isPred = !isPeriod && predicted.has(k) && k >= today;
            const sel = k === selected;
            return (
              <Pressable key={k} style={s.cell} onPress={() => setSelected(k)}>
                <View style={[s.day, isPeriod && s.dayPeriod, isPred && s.dayPred, sel && s.daySel]}>
                  <Text style={[s.dayText, isPeriod && { color: '#fff' }, k === today && s.today]}>{Number(k.slice(8))}</Text>
                </View>
                {data.logs[k] ? <View style={s.dot} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Row style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <View style={[s.legend, { backgroundColor: C.rose }]} />
          <Text style={s.legendText}>Period</Text>
          <View style={[s.legend, s.dayPred]} />
          <Text style={s.legendText}>Predicted</Text>
          <View style={[s.dot, { position: 'relative', bottom: 0 }]} />
          <Text style={s.legendText}>Logged flow/pain</Text>
        </Row>
      </Card>

      <Card tone="rose">
        <H icon="today">{pretty(selected, true)}</H>
        {log && (
          <P style={{ marginBottom: 10 }}>
            Flow: {log.flow ? log.flow.replace('_', ' ') : '–'} · Pain: {log.pain ?? 0}/10
            {log.symptoms?.length ? ` · ${log.symptoms.join(', ')}` : ''}
          </P>
        )}
        <Row style={{ flexWrap: 'wrap' }}>
          {selected <= today && !isStart && <Button small icon="water" label="Period started this day" onPress={() => startPeriod(update, selected)} />}
          {canEnd && <Button small kind="ghost" style={{ backgroundColor: '#fff' }} icon="checkmark-circle" label="Period ended this day" onPress={() => endPeriod(update, containing.start, selected)} />}
          {isStart && (
            <Button small kind="ghost" style={{ backgroundColor: '#fff' }} icon="trash-outline" label="Remove this period" onPress={() => confirm('Remove period?', `Delete the period that started ${pretty(selected)}?`, () => removePeriod(update, selected))} />
          )}
        </Row>
        {selected > today && <P>This is a future date – {predicted.has(selected) ? 'your period is predicted around here.' : 'nothing to log yet.'}</P>}
      </Card>

      <Card>
        <H icon="keypad">Type a past period</H>
        <P style={{ marginBottom: 12 }}>Example: started 28-01-2026, ended 01-02-2026. End date is optional.</P>
        <Row style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Field label="Started" placeholder="DD-MM-YYYY" value={typedStart} onChangeText={setTypedStart} keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Ended" placeholder="DD-MM-YYYY" value={typedEnd} onChangeText={setTypedEnd} keyboardType="numbers-and-punctuation" />
          </View>
        </Row>
        {error ? <Text style={s.error}>{error}</Text> : null}
        <Button label="Add period" icon="add-circle" onPress={addTyped} />
      </Card>

      <Card>
        <H icon="time">History</H>
        {list.length === 0 && <P>No periods yet.</P>}
        {[...list].reverse().map((p) => {
          const idx = list.indexOf(p);
          const next = list[idx + 1];
          const len = periodLength(p);
          return (
            <View key={p.id || p.start} style={s.hist}>
              <View style={{ flex: 1 }}>
                <Text style={s.histDate}>
                  {pretty(p.start, true)}
                  {p.end ? ` – ${pretty(p.end)}` : ''}
                </Text>
                <Text style={s.histSub}>
                  {len ? `${len} day period` : 'End date not logged'}
                  {next ? ` · next came after ${diffDays(p.start, next.start)} days` : ''}
                </Text>
              </View>
              <Pressable hitSlop={10} onPress={() => confirm('Remove period?', `Delete the period that started ${pretty(p.start)}?`, () => removePeriod(update, p.start))}>
                <Icon name="trash-outline" size={20} color={C.faint} />
              </Pressable>
            </View>
          );
        })}
        {stats.shortest && (
          <P style={{ marginTop: 10 }}>
            Average cycle {stats.avgCycle} days · shortest {stats.shortest} · longest {stats.longest}
          </P>
        )}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  arrow: { fontSize: 30, color: C.rose, paddingHorizontal: 8, fontWeight: '600' },
  month: { fontSize: 18, fontWeight: '800', color: C.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  week: { width: `${100 / 7}%`, textAlign: 'center', color: C.faint, fontWeight: '700', marginBottom: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayPeriod: { backgroundColor: C.rose },
  dayPred: { borderWidth: 2, borderColor: C.rose, borderStyle: 'dashed', backgroundColor: C.roseSoft },
  daySel: { borderWidth: 2.5, borderColor: C.plum, borderStyle: 'solid' },
  dayText: { fontSize: 15, color: C.ink, fontWeight: '600' },
  today: { textDecorationLine: 'underline', fontWeight: '900' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.plum, position: 'absolute', bottom: 2 },
  legend: { width: 16, height: 16, borderRadius: 8 },
  legendText: { color: C.sub, fontSize: 12, marginRight: 8 },
  error: { color: C.redInk, marginBottom: 10, fontWeight: '600' },
  hist: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line },
  histDate: { fontSize: 15, fontWeight: '700', color: C.ink },
  histSub: { fontSize: 13, color: C.sub, marginTop: 2 },
});
