import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, H, P, Row, Title } from '../components/ui';
import Advice from '../components/Advice';
import { C } from '../theme';
import { FLOWS, SYMPTOMS, getAdvice, recentPainWarning } from '../health';
import { addDays, pretty, todayKey } from '../dates';
import { useStore } from '../store';
import Icon from '../components/Icon';

const PAIN_FACES = ['happy', 'happy', 'outline', 'outline', 'neutral', 'neutral', 'confused', 'sad', 'frown', 'cry', 'cry'].map((f) => `mci:emoticon-${f === 'outline' ? '' : f + '-'}outline`.replace('--', '-'));
const painColor = (n) => (n >= 8 ? C.redInk : n >= 5 ? C.rose : n > 0 ? '#F4A3B3' : C.mintInk);

export default function TodayScreen({ goTo }) {
  const { data, update } = useStore();
  const day = todayKey();
  const log = data.logs[day] || { flow: null, pain: 0, symptoms: [] };

  const setLog = (patch) => update((d) => ({ ...d, logs: { ...d.logs, [day]: { ...log, ...patch } } }));
  const toggleSymptom = (sym) => {
    const has = log.symptoms.includes(sym);
    setLog({ symptoms: has ? log.symptoms.filter((x) => x !== sym) : [...log.symptoms, sym] });
  };

  const advice = getAdvice(log);
  const last5 = [0, 1, 2, 3, 4].map((i) => addDays(day, -i));
  const painWarn = recentPainWarning(data.logs, last5);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.date}>{pretty(day, true)}</Text>
      <Title style={{ marginBottom: 14 }}>How are you today?</Title>

      <Card>
        <H icon="water">Blood flow</H>
        <View style={s.wrapRow}>
          {FLOWS.map((f) => (
            <Chip key={f.id} label={f.label} sub={f.hint} selected={log.flow === f.id} onPress={() => setLog({ flow: log.flow === f.id ? null : f.id })} />
          ))}
        </View>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H icon="pulse">Pain level</H>
          <Row style={{ gap: 6, marginBottom: 8 }}>
            <Icon name={PAIN_FACES[log.pain]} size={26} color={painColor(log.pain)} />
            <Text style={s.painNow}>{log.pain}/10</Text>
          </Row>
        </Row>
        <View style={s.painRow}>
          {Array.from({ length: 11 }, (_, n) => (
            <Pressable
              key={n}
              onPress={() => setLog({ pain: n })}
              style={[s.painDot, n <= log.pain && n > 0 && { backgroundColor: n >= 8 ? C.redInk : n >= 5 ? C.rose : '#F4A3B3' }, n === log.pain && s.painSel]}
              accessibilityLabel={`Pain ${n} out of 10`}
            >
              <Text style={[s.painNum, n <= log.pain && n > 0 && { color: '#fff' }]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <Row style={{ gap: 4 }}>
            <Icon name="mci:emoticon-happy-outline" size={14} color={C.faint} />
            <Text style={s.scale}>No pain</Text>
          </Row>
          <Row style={{ gap: 4 }}>
            <Text style={s.scale}>Worst ever</Text>
            <Icon name="mci:emoticon-cry-outline" size={14} color={C.faint} />
          </Row>
        </Row>
      </Card>

      <Card>
        <H icon="list">Anything else?</H>
        <View style={s.wrapRow}>
          {SYMPTOMS.map((sym) => (
            <Chip key={sym} label={sym} selected={log.symptoms.includes(sym)} onPress={() => toggleSymptom(sym)} />
          ))}
        </View>
      </Card>

      <H icon="sparkles" style={{ marginTop: 6, fontSize: 20 }}>For you today</H>
      <Advice advice={advice} extraWarnings={painWarn ? [painWarn] : []} doctor={data.doctors[0]} onAddDoctor={() => goTo('doctors')} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 15, color: C.sub, fontWeight: '600' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  painNow: { fontSize: 18, fontWeight: '800', color: C.plum },
  painRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 3 },
  painDot: { flex: 1, aspectRatio: 1, maxWidth: 34, borderRadius: 17, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center' },
  painSel: { borderWidth: 2.5, borderColor: C.plum },
  painNum: { fontSize: 12, fontWeight: '700', color: C.plum },
  scale: { fontSize: 12, color: C.faint },
});
