import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Everything stays on the phone. Nothing is uploaded anywhere.
const KEY = 'bloom:data:v1';

export const initialData = {
  onboarded: false,
  name: '',
  periods: [], // [{ id, start: 'YYYY-MM-DD', end?: 'YYYY-MM-DD' }]
  logs: {}, // { 'YYYY-MM-DD': { flow, pain, symptoms: [], note } }
  pads: { count: 0, lowAt: 5, perDay: 4, product: 'sanitary pads' },
  doctors: [], // [{ id, name, phone, specialty }]
  settings: {
    remindDaysBefore: 3,
    reminderHour: 9,
    defaultCycle: 28,
    defaultPeriodLength: 5,
    dismissedVersion: '',
  },
};

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setData({
            ...initialData,
            ...saved,
            pads: { ...initialData.pads, ...saved.pads },
            settings: { ...initialData.settings, ...saved.settings },
          });
        }
      } catch (e) {
        console.warn('Could not load saved data', e);
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch((e) => console.warn('Save failed', e));
  }, [data]);

  const update = useCallback((fn) => setData((d) => fn(d)), []);
  const value = useMemo(() => ({ data, update, ready }), [data, update, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
