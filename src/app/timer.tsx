import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, BottomTabInset, FitnessColors, Spacing } from '@/constants/theme';

export interface TimerPreset {
  id: string;
  name: string;
  category: 'HIIT' | 'Tabata' | 'Strength' | 'Cardio' | 'Custom';
  work: number; // work seconds
  rest: number; // rest seconds
  rounds: number;
  color: string;
  description?: string;
}

export const builtInPresets: TimerPreset[] = [
  {
    id: 'p-tabata',
    name: 'Classic Tabata',
    category: 'Tabata',
    work: 20,
    rest: 10,
    rounds: 8,
    color: '#CCFF00',
    description: 'High intensity 4-minute burner (20s work / 10s rest)',
  },
  {
    id: 'p-hiit-pro',
    name: 'HIIT Power Intervals',
    category: 'HIIT',
    work: 40,
    rest: 20,
    rounds: 10,
    color: '#FF7A2E',
    description: 'Endurance & fat burn: 40s push / 20s recovery',
  },
  {
    id: 'p-strength-heavy',
    name: 'Heavy Strength Rest',
    category: 'Strength',
    work: 45,
    rest: 90,
    rounds: 5,
    color: '#4D8EF7',
    description: 'Compounds & strength: 45s set / 90s full rest',
  },
  {
    id: 'p-hypertrophy',
    name: 'Hypertrophy 60s Rest',
    category: 'Strength',
    work: 40,
    rest: 60,
    rounds: 4,
    color: '#9B59F5',
    description: 'Standard muscle building: 40s set / 60s rest',
  },
  {
    id: 'p-emom-10',
    name: 'EMOM 10 Min',
    category: 'HIIT',
    work: 50,
    rest: 10,
    rounds: 10,
    color: '#2ECC71',
    description: 'Every minute on the minute for 10 rounds',
  },
  {
    id: 'p-boxing',
    name: 'Boxing Rounds',
    category: 'Cardio',
    work: 180,
    rest: 60,
    rounds: 3,
    color: '#FF4C4C',
    description: 'Championship tempo: 3 min rounds / 1 min rest',
  },
  {
    id: 'p-quick-burst',
    name: 'Speed Bursts',
    category: 'Cardio',
    work: 30,
    rest: 30,
    rounds: 6,
    color: '#00E5FF',
    description: '1:1 ratio for sprint intervals & conditioning',
  },
  {
    id: 'p-core-blaster',
    name: 'Plank & Core Circuit',
    category: 'HIIT',
    work: 45,
    rest: 15,
    rounds: 4,
    color: '#FFAA00',
    description: 'Core stability: 45s isometric hold / 15s transition',
  },
];

type TimerPhase = 'work' | 'rest' | 'finished';

export default function TimerScreen() {
  const [presets, setPresets] = useState<TimerPreset[]>(builtInPresets);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(builtInPresets[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Real Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [currentRound, setCurrentRound] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(builtInPresets[0].work);

  // Custom Preset Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('My Custom Timer');
  const [customWork, setCustomWork] = useState('30');
  const [customRest, setCustomRest] = useState('15');
  const [customRounds, setCustomRounds] = useState('5');
  const [customColor, setCustomColor] = useState('#CCFF00');

  // Quick increment/decrement adjustments
  const adjustSeconds = (delta: number) => {
    setSecondsRemaining((prev) => Math.max(1, prev + delta));
  };

  // Timer interval ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load preset helper
  const loadPreset = (preset: TimerPreset) => {
    setIsRunning(false);
    setSelectedPreset(preset);
    setPhase('work');
    setCurrentRound(1);
    setSecondsRemaining(preset.work);
  };

  // Handle countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Beep / Vibrate feedback
            try {
              Vibration.vibrate(250);
            } catch (_) {}

            // Transition logic
            if (phase === 'work') {
              if (selectedPreset.rest > 0) {
                setPhase('rest');
                return selectedPreset.rest;
              } else {
                // If 0 rest, go straight to next round
                if (currentRound >= selectedPreset.rounds) {
                  setIsRunning(false);
                  setPhase('finished');
                  return 0;
                } else {
                  setCurrentRound((r) => r + 1);
                  return selectedPreset.work;
                }
              }
            } else if (phase === 'rest') {
              if (currentRound >= selectedPreset.rounds) {
                setIsRunning(false);
                setPhase('finished');
                return 0;
              } else {
                setCurrentRound((r) => r + 1);
                setPhase('work');
                return selectedPreset.work;
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, phase, currentRound, selectedPreset]);

  // Restart timer
  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setCurrentRound(1);
    setSecondsRemaining(selectedPreset.work);
  };

  // Skip to next phase or round
  const handleSkip = () => {
    if (phase === 'work') {
      if (selectedPreset.rest > 0) {
        setPhase('rest');
        setSecondsRemaining(selectedPreset.rest);
      } else if (currentRound < selectedPreset.rounds) {
        setCurrentRound((r) => r + 1);
        setSecondsRemaining(selectedPreset.work);
      } else {
        setIsRunning(false);
        setPhase('finished');
      }
    } else if (phase === 'rest') {
      if (currentRound < selectedPreset.rounds) {
        setCurrentRound((r) => r + 1);
        setPhase('work');
        setSecondsRemaining(selectedPreset.work);
      } else {
        setIsRunning(false);
        setPhase('finished');
      }
    }
  };

  // Create custom preset
  const handleSaveCustomPreset = () => {
    const workSec = parseInt(customWork, 10);
    const restSec = parseInt(customRest, 10);
    const roundsCount = parseInt(customRounds, 10);

    if (isNaN(workSec) || workSec <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid work duration in seconds.');
      return;
    }
    if (isNaN(restSec) || restSec < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid rest duration in seconds.');
      return;
    }
    if (isNaN(roundsCount) || roundsCount <= 0) {
      Alert.alert('Invalid Input', 'Please enter at least 1 round.');
      return;
    }

    const newPreset: TimerPreset = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || 'Custom Timer',
      category: 'Custom',
      work: workSec,
      rest: restSec,
      rounds: roundsCount,
      color: customColor,
      description: `Custom: ${workSec}s work / ${restSec}s rest · ${roundsCount} rounds`,
    };

    setPresets([newPreset, ...presets]);
    loadPreset(newPreset);
    setIsCustomModalOpen(false);
  };

  const categories = ['All', 'HIIT', 'Tabata', 'Strength', 'Cardio', 'Custom'];
  const filteredPresets = activeCategory === 'All'
    ? presets
    : presets.filter((p) => p.category === activeCategory);

  // Formatting minutes and seconds
  const mm = String(Math.floor(secondsRemaining / 60)).padStart(2, '0');
  const ss = String(secondsRemaining % 60).padStart(2, '0');

  // Compute ring progress
  const totalPhaseDuration = phase === 'work' ? selectedPreset.work : selectedPreset.rest || 1;
  const progressRatio = Math.max(0, Math.min(1, secondsRemaining / totalPhaseDuration));

  // Determine current active color
  const activeColor =
    phase === 'finished'
      ? FitnessColors.green
      : phase === 'work'
      ? selectedPreset.color || FitnessColors.accent
      : FitnessColors.blue;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Interval Timer</Text>
            <Text style={styles.pageSubtitle}>Precision workouts & rest tracking</Text>
          </View>

          {/* Phase Badge */}
          <View style={[styles.phaseBadge, { backgroundColor: activeColor + '20', borderColor: activeColor }]}>
            <Text style={[styles.phaseText, { color: activeColor }]}>
              {phase === 'finished' ? '🎉 COMPLETE' : phase === 'work' ? '🔥 WORK' : '💤 REST'}
            </Text>
          </View>
        </View>

        {/* Large Timer Display */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerRingOuter, { borderColor: activeColor + '15' }]} />
          <View style={[styles.timerRingMid, { borderColor: activeColor + '30' }]} />

          <View style={[styles.timerBg, { borderColor: activeColor }]}>
            <Text style={[styles.timerTime, { color: activeColor }]}>
              {mm}:{ss}
            </Text>
            
            <Text style={styles.timerLabel}>
              {phase === 'finished'
                ? 'All rounds completed!'
                : `${selectedPreset.name} · ${phase === 'work' ? 'Work Interval' : 'Rest Interval'}`}
            </Text>

            {/* Round indicator dots */}
            <View style={styles.roundsRow}>
              {Array.from({ length: Math.min(selectedPreset.rounds, 16) }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.roundDot,
                    {
                      backgroundColor:
                        i < currentRound - (phase === 'work' ? 0 : 0)
                          ? activeColor
                          : FitnessColors.backgroundElement,
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.roundText}>
              Round {Math.min(currentRound, selectedPreset.rounds)} of {selectedPreset.rounds}
            </Text>

            {/* Quick ±5s adjustment when paused */}
            {!isRunning && phase !== 'finished' && (
              <View style={styles.quickAdjustRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => adjustSeconds(-5)}>
                  <Text style={styles.adjustBtnText}>-5s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => adjustSeconds(+5)}>
                  <Text style={styles.adjustBtnText}>+5s</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controls}>
          {/* Reset button */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleReset}
            activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>↺</Text>
          </TouchableOpacity>

          {/* Primary Play/Pause button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: isRunning ? FitnessColors.red : activeColor }]}
            onPress={() => setIsRunning(!isRunning)}
            activeOpacity={0.8}>
            <Text style={[styles.primaryBtnText, { color: isRunning ? '#ffffff' : '#000000' }]}>
              {isRunning ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Skip button */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleSkip}
            activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Current Interval Metrics Breakdown */}
        <View style={styles.breakdownRow}>
          <View style={[styles.breakdownCard, { borderColor: (selectedPreset.color || FitnessColors.accent) + '60' }]}>
            <Text style={[styles.breakdownNum, { color: selectedPreset.color || FitnessColors.accent }]}>
              {selectedPreset.work}s
            </Text>
            <Text style={styles.breakdownLabel}>Work</Text>
          </View>
          <View style={[styles.breakdownCard, { borderColor: FitnessColors.blue + '60' }]}>
            <Text style={[styles.breakdownNum, { color: FitnessColors.blue }]}>
              {selectedPreset.rest}s
            </Text>
            <Text style={styles.breakdownLabel}>Rest</Text>
          </View>
          <View style={[styles.breakdownCard, { borderColor: FitnessColors.orange + '60' }]}>
            <Text style={[styles.breakdownNum, { color: FitnessColors.orange }]}>
              {selectedPreset.rounds}x
            </Text>
            <Text style={styles.breakdownLabel}>Rounds</Text>
          </View>
          <View style={[styles.breakdownCard, { borderColor: FitnessColors.purple + '60' }]}>
            <Text style={[styles.breakdownNum, { color: FitnessColors.purple }]}>
              {Math.max(1, Math.round(((selectedPreset.work + selectedPreset.rest) * selectedPreset.rounds) / 60))}m
            </Text>
            <Text style={styles.breakdownLabel}>Total</Text>
          </View>
        </View>

        {/* Presets Header & Custom Button */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Timer Presets</Text>
          <TouchableOpacity
            style={styles.customPresetBtn}
            onPress={() => setIsCustomModalOpen(true)}
            activeOpacity={0.8}>
            <Text style={styles.customPresetBtnText}>+ Custom Timer</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}>
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.categoryChipTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Preset Cards List */}
        <View style={styles.presetsList}>
          {filteredPresets.map((t) => {
            const isSelected = selectedPreset.id === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.presetRow,
                  isSelected && { borderColor: t.color, borderWidth: 1.5, backgroundColor: FitnessColors.backgroundElement },
                ]}
                onPress={() => loadPreset(t)}
                activeOpacity={0.7}>
                <View style={[styles.presetDot, { backgroundColor: t.color }]} />
                <View style={styles.presetInfo}>
                  <View style={styles.presetTitleRow}>
                    <Text style={styles.presetName}>{t.name}</Text>
                    <View style={[styles.catBadge, { backgroundColor: t.color + '20' }]}>
                      <Text style={[styles.catBadgeText, { color: t.color }]}>{t.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.presetDetail}>
                    {t.work}s work · {t.rest}s rest · {t.rounds} rounds
                  </Text>
                  {t.description && (
                    <Text style={styles.presetDesc}>{t.description}</Text>
                  )}
                </View>

                <View style={styles.presetRight}>
                  <Text style={[styles.presetDuration, { color: t.color }]}>
                    {Math.max(1, Math.round(((t.work + t.rest) * t.rounds) / 60))}m
                  </Text>
                  {isSelected && (
                    <View style={[styles.activeMark, { backgroundColor: t.color }]}>
                      <Text style={styles.activeMarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Timer Builder Modal */}
        <Modal
          visible={isCustomModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsCustomModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Custom Timer</Text>
                <TouchableOpacity
                  onPress={() => setIsCustomModalOpen(false)}
                  style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Timer Name */}
                <Text style={styles.inputLabel}>Timer Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="e.g. Sprint Blast"
                  placeholderTextColor={FitnessColors.textMuted}
                />

                {/* Work Seconds */}
                <Text style={styles.inputLabel}>Work Interval (Seconds)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customWork}
                  onChangeText={setCustomWork}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={FitnessColors.textMuted}
                />

                {/* Rest Seconds */}
                <Text style={styles.inputLabel}>Rest Interval (Seconds)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customRest}
                  onChangeText={setCustomRest}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor={FitnessColors.textMuted}
                />

                {/* Rounds */}
                <Text style={styles.inputLabel}>Rounds</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customRounds}
                  onChangeText={setCustomRounds}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={FitnessColors.textMuted}
                />

                {/* Color Selector */}
                <Text style={styles.inputLabel}>Accent Color</Text>
                <View style={styles.colorRow}>
                  {['#CCFF00', '#FF7A2E', '#4D8EF7', '#00E5FF', '#9B59F5', '#2ECC71', '#FF4C4C'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        customColor === c && styles.colorCircleSelected,
                      ]}
                      onPress={() => setCustomColor(c)}
                    />
                  ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.savePresetBtn, { backgroundColor: customColor }]}
                  onPress={handleSaveCustomPreset}
                  activeOpacity={0.8}>
                  <Text style={styles.savePresetBtnText}>Save & Start Timer</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FitnessColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.three, gap: Spacing.two },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: FitnessColors.text },
  pageSubtitle: { fontSize: 13, color: FitnessColors.textSecondary, marginTop: 2 },
  phaseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  phaseText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },

  /* Timer Display */
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 290,
    marginVertical: Spacing.two,
  },
  timerRingOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
  },
  timerRingMid: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
  },
  timerBg: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FitnessColors.backgroundCard,
    gap: 4,
  },
  timerTime: { fontSize: 56, fontWeight: '800', letterSpacing: -2 },
  timerLabel: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  roundsRow: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 160 },
  roundDot: { width: 7, height: 7, borderRadius: 3.5 },
  roundText: { fontSize: 11, color: FitnessColors.textMuted, marginTop: 2, fontWeight: '600' },

  quickAdjustRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  adjustBtn: {
    backgroundColor: FitnessColors.backgroundElement,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
  },

  /* Controls */
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginVertical: Spacing.two,
  },
  primaryBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FitnessColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: { fontSize: 28 },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: FitnessColors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  secondaryBtnText: { fontSize: 22, color: FitnessColors.text },

  /* Breakdown Cards */
  breakdownRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    gap: 2,
  },
  breakdownNum: { fontSize: 16, fontWeight: '800' },
  breakdownLabel: { fontSize: 10, color: FitnessColors.textSecondary, textTransform: 'uppercase', fontWeight: '600' },

  /* Presets Section */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: FitnessColors.text },
  customPresetBtn: {
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.accent,
  },
  customPresetBtnText: {
    color: FitnessColors.accent,
    fontSize: 12,
    fontWeight: '700',
  },

  categoriesScroll: {
    marginVertical: Spacing.one,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: FitnessColors.backgroundCard,
    marginRight: 8,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  categoryChipActive: {
    backgroundColor: FitnessColors.accent,
    borderColor: FitnessColors.accent,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: FitnessColors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },

  presetsList: {
    gap: Spacing.two,
    marginTop: 4,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 12,
  },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetInfo: { flex: 1 },
  presetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  presetName: { fontSize: 15, fontWeight: '700', color: FitnessColors.text },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  presetDetail: { fontSize: 12, color: FitnessColors.textSecondary },
  presetDesc: { fontSize: 11, color: FitnessColors.textMuted, marginTop: 3 },
  presetRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  presetDuration: { fontSize: 14, fontWeight: '800' },
  activeMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMarkText: { color: '#000000', fontSize: 11, fontWeight: '900' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FitnessColors.backgroundCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: FitnessColors.text },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { color: FitnessColors.textSecondary, fontSize: 14, fontWeight: '700' },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: FitnessColors.text,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: FitnessColors.border,
    marginBottom: Spacing.three,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.four,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  savePresetBtn: {
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  savePresetBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
