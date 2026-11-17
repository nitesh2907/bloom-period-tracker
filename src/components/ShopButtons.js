import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SHOPS } from '../config';
import { openLink } from '../actions';
import Icon from './Icon';

export default function ShopButtons({ product }) {
  return (
    <View style={s.grid}>
      {SHOPS.map((shop) => (
        <Pressable
          key={shop.id}
          onPress={() => openLink(shop.url(product))}
          style={({ pressed }) => [s.btn, { backgroundColor: shop.color }, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`Order ${product} on ${shop.name}`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="cart" size={18} color={shop.text} />
            <Text style={[s.name, { color: shop.text }]}>{shop.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Icon name="flash" size={12} color={shop.text} />
            <Text style={[s.sub, { color: shop.text }]}>Order in ~10 min</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { flexGrow: 1, flexBasis: '45%', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14 },
  name: { fontSize: 16, fontWeight: '800' },
  sub: { fontSize: 12, opacity: 0.85 },
});
