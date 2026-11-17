import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, H, P, Row, Title } from '../components/ui';
import ShopButtons from '../components/ShopButtons';
import { C } from '../theme';
import { useStore } from '../store';
import { changePads } from '../actions';
import { pretty } from '../dates';
import Icon, { IconBadge } from '../components/Icon';

function Stepper({ label, value, onChange, min = 0, max = 50 }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line }}>
      <Text style={{ fontSize: 15, color: C.ink, flex: 1 }}>{label}</Text>
      <Row>
        <Pressable style={s.step} onPress={() => onChange(Math.max(min, value - 1))} accessibilityLabel={`Decrease ${label}`}>
          <Icon name="remove" size={20} color={C.roseDark} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '800', minWidth: 28, textAlign: 'center', color: C.plum }}>{value}</Text>
        <Pressable style={s.step} onPress={() => onChange(Math.min(max, value + 1))} accessibilityLabel={`Increase ${label}`}>
          <Icon name="add" size={20} color={C.roseDark} />
        </Pressable>
      </Row>
    </Row>
  );
}

export default function PadsScreen({ stats }) {
  const { data, update } = useStore();
  const { pads } = data;
  const [custom, setCustom] = useState('');
  const needed = stats.avgPeriod * pads.perDay;
  const product = pads.product.trim() || 'sanitary pads';
  const setPads = (patch) => update((d) => ({ ...d, pads: { ...d.pads, ...patch } }));
  const level = pads.count === 0 ? 'out' : pads.count <= pads.lowAt ? 'low' : pads.count < needed ? 'short' : 'ok';
  const pct = Math.min(1, pads.count / Math.max(needed * 2, 1));

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Title style={{ marginBottom: 14 }}>My pads</Title>

      <Card style={{ alignItems: 'center' }}>
        <IconBadge name={level === 'ok' ? 'shield-checkmark' : level === 'short' ? 'alert-circle' : 'warning'} size={26} box={52} color={level === 'ok' ? C.mintInk : level === 'short' ? '#B07A00' : C.rose} bg={level === 'ok' ? C.mint : level === 'short' ? C.amber : C.roseSoft} />
        <Text style={s.count}>{pads.count}</Text>
        <Text style={s.countLabel}>{product} left</Text>
        <View style={s.bar}>
          <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: level === 'ok' ? C.mintInk : level === 'short' ? '#E3A008' : C.rose }]} />
        </View>
        <P style={{ textAlign: 'center', marginBottom: 14 }}>
          {level === 'out' && 'You have none left – order now.'}
          {level === 'low' && `Running low. You need about ${needed} for one period.`}
          {level === 'short' && `Enough for part of a period. You usually need about ${needed}.`}
          {level === 'ok' && `Enough for your next period (about ${needed} needed).`}
        </P>
        <Row>
          <Button label="Used 1" icon="remove-circle" onPress={() => changePads(update, data, -1)} disabled={pads.count === 0} />
          <Button label="Add 1" icon="add-circle" kind="soft" onPress={() => changePads(update, data, 1)} />
        </Row>
      </Card>

      <Card>
        <H icon="bag-add">Bought a new pack?</H>
        <Row style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          {[6, 10, 20, 30].map((n) => (
            <Button key={n} small kind="soft" label={`+${n}`} onPress={() => changePads(update, data, n)} />
          ))}
        </Row>
        <Row style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Field placeholder="Other amount" keyboardType="number-pad" value={custom} onChangeText={(t) => setCustom(t.replace(/\D/g, ''))} />
          </View>
          <Button
            label="Add"
            icon="add"
            onPress={() => {
              const n = parseInt(custom, 10);
              if (n > 0) changePads(update, data, n);
              setCustom('');
            }}
          />
        </Row>
      </Card>

      <Card tone="rose">
        <H icon="flash">Order in 10 minutes</H>
        <P style={{ marginBottom: 12 }}>
          Searches for “{product}”{stats.nextStart ? `. Next period expected ${pretty(stats.nextStart)}.` : '.'}
        </P>
        <ShopButtons product={product} />
      </Card>

      <Card>
        <H icon="settings">Settings</H>
        <Field label="What do you use? (brand / type)" value={pads.product} onChangeText={(t) => setPads({ product: t })} placeholder="e.g. Whisper XL pads" />
        <Stepper label="Warn me when this many are left" value={pads.lowAt} onChange={(v) => setPads({ lowAt: v })} />
        <Stepper label="Pads I use per day" value={pads.perDay} onChange={(v) => setPads({ perDay: v })} min={1} max={15} />
        <Row style={{ alignItems: 'flex-start', gap: 8, marginTop: 8 }}>
          <Icon name="notifications" size={16} color={C.rose} style={{ marginTop: 2 }} />
          <P style={{ fontSize: 13, flex: 1 }}>You get a notification when pads run low, when they run out, and before your period if you don’t have enough.</P>
        </Row>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  count: { fontSize: 72, fontWeight: '800', color: C.plum, letterSpacing: -2 },
  countLabel: { fontSize: 15, color: C.sub, marginTop: -4, marginBottom: 14 },
  bar: { height: 10, width: '100%', backgroundColor: C.line, borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  fill: { height: '100%', borderRadius: 5 },
  step: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, fontWeight: '700', color: C.roseDark },
});
