import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { C } from '../theme';

// name: an Ionicons name (https://icons.expo.fyi). Prefix "mci:" to use MaterialCommunityIcons.
export default function Icon({ name, size = 20, color = C.rose, style, onPress }) {
  if (name.startsWith('mci:')) return <MaterialCommunityIcons name={name.slice(4)} size={size} color={color} style={style} onPress={onPress} />;
  return <Ionicons name={name} size={size} color={color} style={style} onPress={onPress} />;
}

// Icon inside a soft round badge (for food tips, stat cards, headings).
export function IconBadge({ name, size = 20, color = C.rose, bg = C.roseSoft, box = 40 }) {
  return (
    <View style={{ width: box, height: box, borderRadius: box / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size} color={color} />
    </View>
  );
}
