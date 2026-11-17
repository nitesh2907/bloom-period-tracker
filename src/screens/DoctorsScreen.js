import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, H, P, Row, Title } from '../components/ui';
import { C } from '../theme';
import { newId, useStore } from '../store';
import { callNumber, whatsapp } from '../actions';
import Icon, { IconBadge } from '../components/Icon';

export default function DoctorsScreen() {
  const { data, update } = useStore();
  const [form, setForm] = useState({ name: '', phone: '', specialty: '' });
  const [error, setError] = useState('');

  const save = () => {
    const digits = form.phone.replace(/\D/g, '');
    if (!form.name.trim()) return setError('Please add the doctor’s name');
    if (digits.length < 6) return setError('Please add a valid phone number');
    update((d) => ({ ...d, doctors: [...d.doctors, { id: newId(), name: form.name.trim(), phone: form.phone.trim(), specialty: form.specialty.trim() }] }));
    setForm({ name: '', phone: '', specialty: '' });
    setError('');
  };

  const remove = (doc) => {
    const go = () => update((d) => ({ ...d, doctors: d.doctors.filter((x) => x.id !== doc.id) }));
    if (Platform.OS === 'web') return window.confirm(`Remove ${doc.name}?`) && go();
    Alert.alert('Remove doctor?', doc.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: go }]);
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Title style={{ marginBottom: 6 }}>My doctors</Title>
      <P style={{ marginBottom: 16 }}>Save your gynaecologist so you can call in one tap when pain or bleeding is too much.</P>

      {data.doctors.map((doc, i) => (
        <Card key={doc.id}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <IconBadge name="person" size={22} box={46} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {doc.name} {i === 0 ? <Text style={s.main}> MAIN</Text> : null}
              </Text>
              <Text style={s.sub}>
                {doc.specialty ? `${doc.specialty} · ` : ''}
                {doc.phone}
              </Text>
            </View>
            <Icon name="trash-outline" size={20} color={C.faint} style={{ padding: 4 }} onPress={() => remove(doc)} />
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Button small icon="call" label="Call" onPress={() => callNumber(doc.phone)} style={{ flex: 1 }} />
            <Button small kind="soft" icon="logo-whatsapp" label="WhatsApp" onPress={() => whatsapp(doc.phone)} style={{ flex: 1 }} />
          </Row>
        </Card>
      ))}

      <Card tone="peach">
        <H icon="person-add" style={{ color: C.plum }}>Add a doctor</H>
        <Field label="Name" placeholder="Dr. Priya Sharma" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <Field label="Phone" placeholder="98765 43210" keyboardType="phone-pad" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
        <Field label="Speciality / clinic (optional)" placeholder="Gynaecologist, City Clinic" value={form.specialty} onChangeText={(specialty) => setForm({ ...form, specialty })} />
        {error ? <Text style={{ color: C.redInk, marginBottom: 10, fontWeight: '600' }}>{error}</Text> : null}
        <Button label="Save doctor" icon="save" onPress={save} />
      </Card>

      <Card tone="red">
        <H icon="warning" style={{ color: C.redInk }}>Emergency</H>
        <P style={{ color: C.redInk, marginBottom: 12 }}>Fainting, very heavy bleeding that won’t stop, or sudden severe pain – get help now.</P>
        <Button kind="danger" icon="mci:ambulance" label="Call 112 (India emergency)" onPress={() => callNumber('112')} />
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  name: { fontSize: 18, fontWeight: '800', color: C.ink },
  main: { fontSize: 11, color: C.rose, fontWeight: '800' },
  sub: { fontSize: 14, color: C.sub, marginTop: 3 },
});
