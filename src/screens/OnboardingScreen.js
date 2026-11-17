import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Field, P, Title } from '../components/ui';
import { C } from '../theme';
import { useStore, newId } from '../store';
import { diffDays, parseTyped, todayKey } from '../dates';

export default function OnboardingScreen() {
  const { update } = useStore();
  const [name, setName] = useState('');
  const [lastStart, setLastStart] = useState('');
  const [prevStart, setPrevStart] = useState('');
  const [pads, setPads] = useState('');
  const [error, setError] = useState('');

  const finish = () => {
    const periods = [];
    const today = todayKey();
    for (const [txt, label] of [[prevStart, 'earlier'], [lastStart, 'last']]) {
      if (!txt.trim()) continue;
      const k = parseTyped(txt);
      if (!k) return setError(`Please type your ${label} period date like 28-01-2026`);
      if (k > today) return setError('Dates can’t be in the future');
      periods.push({ id: newId(), start: k });
    }
    if (periods.length === 2 && diffDays(periods[0].start, periods[1].start) <= 0) {
      return setError('The earlier period should be before your last period');
    }
    update((d) => ({
      ...d,
      onboarded: true,
      name: name.trim(),
      periods,
      pads: { ...d.pads, count: parseInt(pads, 10) || 0 },
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Image source={require('../../assets/logo.png')} style={s.logo} accessibilityIgnoresInvertColors />
        <Title style={{ textAlign: 'center' }}>Welcome to Bloom</Title>
        <P style={{ textAlign: 'center', marginTop: 6, marginBottom: 22 }}>
          Track your periods, know your cycle, never run out of pads. Everything stays private on your phone.
        </P>

        <Card>
          <Field label="Your name (optional)" placeholder="Ananya" value={name} onChangeText={setName} />
          <Field label="When did your last period start?" placeholder="DD-MM-YYYY  e.g. 27-02-2026" value={lastStart} onChangeText={setLastStart} keyboardType="numbers-and-punctuation" />
          <Field label="And the one before that? (optional)" placeholder="DD-MM-YYYY  e.g. 28-01-2026" value={prevStart} onChangeText={setPrevStart} keyboardType="numbers-and-punctuation" />
          <Field label="How many pads do you have now?" placeholder="e.g. 12" value={pads} onChangeText={(t) => setPads(t.replace(/\D/g, ''))} keyboardType="number-pad" />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Button label="Start tracking" icon="arrow-forward" onPress={finish} />
        </Card>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 22 },
  logo: { width: 110, height: 110, alignSelf: 'center', marginTop: 20, marginBottom: 6 },
  error: { color: C.redInk, marginBottom: 10, fontWeight: '600' },
});
