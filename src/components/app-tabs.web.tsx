import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FitnessColors } from '@/constants/theme';

const TAB_ITEMS = [
  { name: 'index', href: '/', label: 'Dashboard', icon: '🏠' },
  { name: 'track', href: '/track', label: 'Track', icon: '📊' },
  { name: 'workout', href: '/workout', label: 'Workout', icon: '💪' },
  { name: 'history', href: '/history', label: 'History', icon: '📋' },
  { name: 'timer', href: '/timer', label: 'Timer', icon: '⏱️' },
  { name: 'library', href: '/library', label: 'Library', icon: '📚' },
] as const;

export function TabButton({
  children,
  isFocused,
  ...props
}: TabTriggerSlotProps & { children?: React.ReactNode }) {
  return (
    <Pressable
      {...props}
      style={[styles.tabBtn, isFocused && styles.tabBtnActive]}>
      {children}
    </Pressable>
  );
}

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <View style={styles.tabBar}>
          {TAB_ITEMS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={styles.tabLabel}>{tab.label}</Text>
              </TabButton>
            </TabTrigger>
          ))}
        </View>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    // leave room for fixed bottom tab bar
    paddingBottom: 64,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: FitnessColors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: FitnessColors.border,
    paddingBottom: 8,
    paddingTop: 6,
    height: 64,
    zIndex: 100,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabBtnActive: {
    borderTopWidth: 2,
    borderTopColor: FitnessColors.accent,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
  },
});
