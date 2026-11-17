import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { getStats } from './src/cycle';
import { C } from './src/theme';
import { Button, H, P } from './src/components/ui';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TodayScreen from './src/screens/TodayScreen';
import PadsScreen from './src/screens/PadsScreen';
import DoctorsScreen from './src/screens/DoctorsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { scheduleCycleReminders, setupNotifications } from './src/notifications';
import { checkForUpdate, currentVersion } from './src/updates';
import { openLink } from './src/actions';
import Icon, { IconBadge } from './src/components/Icon';

const TABS = [
  { id: 'home', label: 'Home', icon: 'flower' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'today', label: 'Log', icon: 'create' },
  { id: 'pads', label: 'Pads', icon: 'heart-circle' },
  { id: 'doctors', label: 'Doctors', icon: 'medkit' },
];

function Main() {
  const { data, update, ready } = useStore();
  const [tab, setTab] = useState('home');
  const [updateInfo, setUpdateInfo] = useState(null);
  const stats = useMemo(() => getStats(data.periods, data.settings), [data.periods, data.settings]);

  // Ask for notification permission once the user has finished onboarding.
  useEffect(() => {
    if (ready && data.onboarded) setupNotifications();
  }, [ready, data.onboarded]);

  // Re-plan "period coming" reminders whenever the prediction or pad stock changes.
  useEffect(() => {
    if (!ready || !data.onboarded) return;
    scheduleCycleReminders({ nextStart: stats.nextStart, avgPeriod: stats.avgPeriod, settings: data.settings, pads: data.pads });
  }, [ready, data.onboarded, stats.nextStart, stats.avgPeriod, data.pads.count, data.pads.perDay, data.settings]);

  // Check for a new app version on launch.
  useEffect(() => {
    if (!ready) return;
    checkForUpdate().then((info) => {
      if (info && (info.mandatory || info.version !== data.settings.dismissedVersion)) setUpdateInfo(info);
    });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  if (!data.onboarded) return <OnboardingScreen />;

  const screenProps = { stats, goTo: setTab };
  const Screen = { home: HomeScreen, calendar: CalendarScreen, today: TodayScreen, pads: PadsScreen, doctors: DoctorsScreen }[tab];

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen {...screenProps} />
      </KeyboardAvoidingView>
      <SafeAreaView edges={['bottom']} style={s.tabBar}>
        <View style={s.tabs}>
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <Pressable key={t.id} style={s.tab} onPress={() => setTab(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <View style={[s.tabIcon, on && s.tabIconOn]}>
                  <Icon name={on ? t.icon : `${t.icon}-outline`} size={22} color={on ? C.rose : C.sub} />
                </View>
                <Text style={[s.tabLabel, on && { color: C.rose }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <Modal visible={!!updateInfo} transparent animationType="fade" onRequestClose={() => !updateInfo?.mandatory && setUpdateInfo(null)}>
        <View style={s.backdrop}>
          <View style={s.sheet}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <IconBadge name="sparkles" size={30} box={64} />
            </View>
            <H style={{ textAlign: 'center', fontSize: 20 }}>Update available</H>
            <P style={{ textAlign: 'center', marginBottom: 6 }}>
              Version {updateInfo?.version} is ready (you have {currentVersion}).
            </P>
            <P style={{ textAlign: 'center', marginBottom: 18 }}>{updateInfo?.message}</P>
            <Button label="Update now" icon="cloud-download" onPress={() => openLink(updateInfo.url)} />
            {!updateInfo?.mandatory && (
              <Button
                kind="ghost"
                label="Later"
                style={{ marginTop: 10, borderWidth: 0 }}
                onPress={() => {
                  update((d) => ({ ...d, settings: { ...d.settings, dismissedVersion: updateInfo.version } }));
                  setUpdateInfo(null);
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  tabs: { flexDirection: 'row', paddingTop: 6, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { width: 48, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIconOn: { backgroundColor: C.roseSoft },
  tabLabel: { fontSize: 11, fontWeight: '700', color: C.sub, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(43,26,34,0.45)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: 28, padding: 24 },
});
