import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, H, P, Row, Title } from '../components/ui';
import ShopButtons from '../components/ShopButtons';
import { C } from '../theme';
import { pretty, todayKey, addDays } from '../dates';
import { useStore } from '../store';
import { startPeriod, endPeriod } from '../actions';
import { cycleWarnings } from '../cycle';
import Icon, { IconBadge } from '../components/Icon';

export default function HomeScreen({ stats, goTo }) {
  const { data, update } = useStore();
  const { status, last } = stats;
  const today = todayKey();
  const needed = stats.avgPeriod * data.pads.perDay;
  const lowPads = data.pads.count <= data.pads.lowAt;
  const warnings = cycleWarnings(data.periods, stats);

  let big = '–';
  let small = 'Log your last period to start';
  let caption = '';
  if (status.kind === 'period') {
    big = `Day ${status.day}`;
    small = 'of your period';
    caption = last.end ? `Ends ${pretty(last.end)}` : `Usually lasts ~${stats.avgPeriod} days`;
  } else if (status.kind === 'waiting') {
    big = status.daysUntil === 0 ? 'Today' : String(status.daysUntil);
    small = status.daysUntil === 0 ? 'period expected' : status.daysUntil === 1 ? 'day until your period' : 'days until your period';
    caption = `Expected ${pretty(stats.nextStart)} · cycle day ${status.dayOfCycle}`;
  } else if (status.kind === 'late') {
    big = `${status.daysLate}`;
    small = status.daysLate === 1 ? 'day late' : 'days late';
    caption = `Was expected ${pretty(stats.nextStart)}`;
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Row style={{ gap: 6 }}>
        <Text style={s.hello}>{data.name ? `Hi ${data.name}` : 'Hi there'}</Text>
        <Icon name="flower" size={16} color={C.rose} />
      </Row>
      <Title style={{ marginBottom: 16 }}>Your cycle</Title>

      <View style={s.hero}>
        <View style={s.ring}>
          <Icon name={status.kind === 'period' ? 'water' : status.kind === 'late' ? 'time' : 'calendar'} size={22} color={C.rose} />
          <Text style={s.big}>{big}</Text>
          <Text style={s.small}>{small}</Text>
        </View>
        {caption ? <Text style={s.caption}>{caption}</Text> : null}
        <Row style={{ marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {status.kind === 'period' && !last.end ? (
            <Button label="My period ended today" icon="checkmark-circle" kind="soft" onPress={() => endPeriod(update, last.start, today)} />
          ) : status.kind !== 'period' ? (
            <Button label="My period started today" icon="water" onPress={() => startPeriod(update, today)} />
          ) : null}
          {status.kind === 'period' && <Button label="Log flow & pain" icon="create-outline" kind="ghost" onPress={() => goTo('today')} style={{ backgroundColor: '#fff' }} />}
        </Row>
        <Button small kind="ghost" icon="calendar-outline" label="Started on another day? Add it" onPress={() => goTo('calendar')} style={{ marginTop: 8, borderWidth: 0 }} />
      </View>

      {status.stale && (
        <Card tone="peach">
          <H icon="information-circle" style={{ color: C.plum }}>Rough guess</H>
          <P>Your last logged period was a while ago, so this is a rough guess. Add your recent period dates for a better prediction.</P>
          <Button small icon="add" label="Add recent periods" onPress={() => goTo('calendar')} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        </Card>
      )}

      {status.kind === 'late' && status.daysLate >= 7 && (
        <Card tone="amber">
          <H icon="hourglass" style={{ color: C.amberInk }}>Period is late</H>
          <P style={{ color: C.amberInk }}>
            Your period is a week or more late. Stress, travel, illness or weight changes can do this. If it’s often late, or you could be pregnant, talk to a doctor.
          </P>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card tone="red">
          <H icon="medkit" style={{ color: C.redInk }}>Worth checking with a doctor</H>
          {warnings.map((w) => (
            <Row key={w} style={{ alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <Icon name="alert-circle" size={16} color={C.redInk} style={{ marginTop: 2 }} />
              <P style={{ color: C.redInk, flex: 1 }}>{w}</P>
            </Row>
          ))}
          <Button small kind="danger" icon="medkit" label="Open my doctors" onPress={() => goTo('doctors')} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        </Card>
      )}

      <Row style={{ alignItems: 'stretch' }}>
        <Card style={s.stat}>
          <IconBadge name="sync" size={18} box={34} />
          <Text style={s.statNum}>{stats.avgCycle}</Text>
          <Text style={s.statLabel}>day cycle{stats.hasHistory ? ' (avg)' : ' (default)'}</Text>
        </Card>
        <Card style={s.stat}>
          <IconBadge name="water" size={18} box={34} />
          <Text style={s.statNum}>{stats.avgPeriod}</Text>
          <Text style={s.statLabel}>day period</Text>
        </Card>
        <Card style={s.stat}>
          <IconBadge name="heart-circle" size={18} box={34} />
          <Text style={[s.statNum, lowPads && { color: C.rose }]}>{data.pads.count}</Text>
          <Text style={s.statLabel}>pads left</Text>
        </Card>
      </Row>

      {stats.gaps.length > 0 && (
        <Card>
          <H icon="analytics">Gap between your periods</H>
          {stats.gaps
            .slice(-4)
            .reverse()
            .map((g) => (
              <View key={g.from + g.to} style={s.gapRow}>
                <Row style={{ gap: 6 }}>
                  <Text style={s.gapDates}>{pretty(g.from)}</Text>
                  <Icon name="arrow-forward" size={14} color={C.faint} />
                  <Text style={s.gapDates}>{pretty(g.to)}</Text>
                </Row>
                <Text style={s.gapDays}>{g.days} days</Text>
              </View>
            ))}
          <Button small kind="soft" icon="list" label="See full history" onPress={() => goTo('calendar')} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        </Card>
      )}

      {(lowPads || (status.kind === 'waiting' && status.daysUntil <= 5 && data.pads.count < needed)) && (
        <Card tone="rose">
          <H icon="cart">{data.pads.count === 0 ? 'You’re out of pads' : `Only ${data.pads.count} pads left`}</H>
          <P style={{ marginBottom: 12 }}>
            You usually need about {needed} per period. Order now and get them in minutes{stats.nextStart ? `, before ${pretty(stats.nextStart)}` : ''}.
          </P>
          <ShopButtons product={data.pads.product.trim() || 'sanitary pads'} />
        </Card>
      )}

      {!last && (
        <Card tone="peach">
          <H icon="bulb" style={{ color: C.plum }}>Tip</H>
          <P>
            Add your last 2–3 period start dates (for example 28 Jan and 27 Feb). Bloom works out your cycle gap and predicts the next one.
          </P>
          <Button small icon="add" label="Add past periods" onPress={() => goTo('calendar')} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        </Card>
      )}
      <Row style={{ justifyContent: 'center', gap: 6 }}>
        <Icon name="lock-closed" size={13} color={C.sub} />
        <P style={{ fontSize: 12 }}>Predictions are estimates. Your data stays on this phone.</P>
      </Row>
      <View style={{ height: 8 }} />
      {stats.nextStart && <P style={{ fontSize: 12, textAlign: 'center' }}>Next 3 periods: {[0, 1, 2].map((i) => pretty(addDays(stats.nextStart, i * stats.avgCycle))).join(' · ')}</P>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  hello: { fontSize: 15, color: C.sub, fontWeight: '600' },
  hero: { backgroundColor: C.roseSoft, borderRadius: 28, padding: 22, alignItems: 'center', marginBottom: 14 },
  ring: { width: 190, height: 190, borderRadius: 95, borderWidth: 10, borderColor: C.rose, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 16 },
  big: { fontSize: 46, fontWeight: '800', color: C.plum, letterSpacing: -1 },
  small: { fontSize: 14, color: C.sub, textAlign: 'center', fontWeight: '600' },
  caption: { marginTop: 14, color: C.plum, fontWeight: '600', textAlign: 'center' },
  stat: { flex: 1, padding: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 26, fontWeight: '800', color: C.plum },
  statLabel: { fontSize: 12, color: C.sub, textAlign: 'center' },
  gapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.line },
  gapDates: { color: C.ink, fontSize: 15 },
  gapDays: { color: C.rose, fontWeight: '800', fontSize: 15 },
});
