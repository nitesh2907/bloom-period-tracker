import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { C, R, shadow } from '../theme';
import Icon from './Icon';

export function Card({ children, style, tone }) {
  const bg = { rose: C.roseSoft, mint: C.mint, amber: C.amber, red: C.red, peach: C.peach, plum: C.plum }[tone] || C.card;
  return <View style={[s.card, { backgroundColor: bg }, !tone && shadow, style]}>{children}</View>;
}

export function Title({ children, style }) {
  return <Text style={[s.title, style]}>{children}</Text>;
}

export function H({ children, style, icon, iconColor }) {
  if (!icon) return <Text style={[s.h, style]}>{children}</Text>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Icon name={icon} size={20} color={iconColor || style?.color || C.rose} />
      <Text style={[s.h, { marginBottom: 0, flexShrink: 1 }, style]}>{children}</Text>
    </View>
  );
}

export function P({ children, style, ...rest }) {
  return (
    <Text style={[s.p, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Button({ label, onPress, kind = 'primary', small, style, disabled, icon }) {
  const styles = {
    primary: [s.btnPrimary, s.btnPrimaryText],
    soft: [s.btnSoft, s.btnSoftText],
    ghost: [s.btnGhost, s.btnGhostText],
    danger: [s.btnDanger, s.btnPrimaryText],
  }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [s.btn, small && s.btnSmall, styles[0], (pressed || disabled) && { opacity: 0.6 }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon ? <Icon name={icon} size={small ? 16 : 19} color={StyleSheet.flatten(styles[1]).color} /> : null}
        <Text style={[s.btnText, small && { fontSize: 14 }, styles[1]]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, sub }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, selected && s.chipOn]} accessibilityState={{ selected }}>
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
      {sub ? <Text style={[s.chipSub, selected && { color: '#FFE3E8' }]}>{sub}</Text> : null}
    </Pressable>
  );
}

export function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={C.faint} style={s.input} {...props} />
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>{children}</View>;
}

const s = StyleSheet.create({
  card: { borderRadius: R.lg, padding: 18, marginBottom: 14 },
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  h: { fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 8 },
  p: { fontSize: 15, color: C.sub, lineHeight: 21 },
  btn: { borderRadius: R.pill, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 14 },
  btnText: { fontSize: 16, fontWeight: '700' },
  btnPrimary: { backgroundColor: C.rose },
  btnPrimaryText: { color: '#fff' },
  btnSoft: { backgroundColor: C.roseSoft },
  btnSoftText: { color: C.roseDark },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.line },
  btnGhostText: { color: C.ink },
  btnDanger: { backgroundColor: C.redInk },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: R.pill, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.line },
  chipOn: { backgroundColor: C.rose, borderColor: C.rose },
  chipText: { color: C.ink, fontWeight: '600', fontSize: 14 },
  chipTextOn: { color: '#fff' },
  chipSub: { color: C.faint, fontSize: 11, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: C.sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  input: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink },
});
