import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, H, P } from './ui';
import { C } from '../theme';
import { callNumber } from '../actions';
import Icon, { IconBadge } from './Icon';

// Shows food suggestions, self-care and a "see a doctor" alert when needed.
export default function Advice({ advice, extraWarnings = [], doctor, onAddDoctor, compact }) {
  const reasons = [...advice.doctorReasons, ...extraWarnings];
  return (
    <View>
      {reasons.length > 0 && (
        <Card tone="red">
          <H icon="medkit" style={{ color: C.redInk }}>Please see a doctor</H>
          {reasons.map((r) => (
            <View key={r} style={s.line}>
              <Icon name="alert-circle" size={16} color={C.redInk} style={{ marginTop: 2 }} />
              <P style={{ color: C.redInk, flex: 1 }}>{r}</P>
            </View>
          ))}
          <P style={{ color: C.redInk, marginTop: 4, marginBottom: 12 }}>
            A gynaecologist can find the cause and help reduce the pain. If you feel faint, have chest pain or very heavy bleeding that won’t stop, go to the nearest hospital.
          </P>
          {doctor ? (
            <Button kind="danger" icon="call" label={`Call ${doctor.name}`} onPress={() => callNumber(doctor.phone)} />
          ) : (
            <Button kind="danger" icon="person-add" label="Add your doctor’s number" onPress={onAddDoctor} />
          )}
        </Card>
      )}
      {advice.level === 'watch' && reasons.length === 0 && (
        <Card tone="amber">
          <H icon="warning" style={{ color: C.amberInk }}>Strong pain today</H>
          <P style={{ color: C.amberInk }}>
            Your pain is fairly strong today. Try the tips below. If pain stops you doing daily things or painkillers don’t help, see a doctor.
          </P>
        </Card>
      )}

      <Card>
        <H icon="nutrition">Eat today</H>
        {advice.foods.map((f) => (
          <View key={f.name} style={s.food}>
            <IconBadge name={f.icon} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={s.foodName}>{f.name}</Text>
              <Text style={s.why}>{f.why}</Text>
            </View>
          </View>
        ))}
      </Card>

      {!compact && (
        <Card>
          <H icon="heart">Feel better</H>
          {advice.care.map((c) => (
            <View key={c} style={s.line}>
              <Icon name={careIcon(c)} size={18} color={C.rose} style={{ marginTop: 1 }} />
              <P style={{ flex: 1 }}>{c}</P>
            </View>
          ))}
        </Card>
      )}
      <P style={{ fontSize: 12, textAlign: 'center', marginBottom: 16 }}>General wellness tips, not medical advice.</P>
    </View>
  );
}

// Pick an icon that matches each self-care tip.
function careIcon(text) {
  const t = text.toLowerCase();
  if (t.includes('water (')) return 'water';
  if (t.includes('hot water')) return 'flame';
  if (t.includes('stretch') || t.includes('walk')) return 'walk';
  if (t.includes('pad')) return 'time';
  if (t.includes('salty') || t.includes('coffee')) return 'cafe';
  if (t.includes('sleep')) return 'moon';
  return 'checkmark-circle';
}

const s = StyleSheet.create({
  food: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line, gap: 12 },
  line: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  foodName: { fontSize: 15, fontWeight: '700', color: C.ink },
  why: { fontSize: 13, color: C.sub, marginTop: 1 },
});
