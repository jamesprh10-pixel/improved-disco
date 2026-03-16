import { useState, useCallback } from 'react';
import type { UserSettings } from '../types';
import { getSettings, saveSettings } from '../store';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(getSettings);

  const updateSettings = useCallback((newSettings: UserSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  return { settings, updateSettings };
}
