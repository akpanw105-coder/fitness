import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { exercises } from '@/constants/mockData';
import { BorderRadius, BottomTabInset, FitnessColors, Spacing } from '@/constants/theme';
import { useWorkout } from '@/context/WorkoutContext';
import { workoutPresets, presetCategories, WorkoutPreset } from '@/constants/workoutPresets';

export default function TrackScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    setWorkoutName,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    toggleExerciseCompleted,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    finishWorkout,
    startPredefinedWorkout,
  } = useWorkout();

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');
  const [previewPreset, setPreviewPreset] = useState<WorkoutPreset | null>(null);

  const handleLoadPreset = (preset: WorkoutPreset) => {
    startPredefinedWorkout(preset.name, preset.category, preset.exerciseNames);
    setPreviewPreset(null);
    setIsPresetPickerOpen(false);
  };

  // Compute live workout stats
  const totalExercises = activeWorkout.exercises.length;
  const completedExercises = activeWorkout.exercises.filter((e) => e.isCompleted).length;
  const totalSets = activeWorkout.exercises.reduce((acc, curr) => acc + curr.sets.length, 0);
  const totalVolume = activeWorkout.exercises.reduce((acc, curr) => {
    return (
      acc +
      curr.sets.reduce((sAcc, s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseFloat(s.reps) || 0;
        return sAcc + w * r;
      }, 0)
    );
  }, 0);

  const handleFinish = () => {
    if (activeWorkout.exercises.length === 0) {
      Alert.alert('Empty Workout', 'Please add at least one exercise before finishing.');
      return;
    }

    const saved = finishWorkout();
    if (saved) {
      Alert.alert(
        'Workout Completed! 🎉',
        `Logged "${saved.name}" with ${saved.exercisesCount} exercises and ${totalVolume.toLocaleString()} kg total volume.`,
        [
          {
            text: 'View in History',
            onPress: () => router.push('/history'),
          },
          { text: 'Great!', style: 'cancel' },
        ]
      );
    }
  };

  const filteredExercisesForPicker = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.screenTag}>LIVE TRACKER</Text>
            {isEditingTitle ? (
              <TextInput
                style={styles.titleInput}
                value={activeWorkout.name}
                onChangeText={setWorkoutName}
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                returnKeyType="done"
              />
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingTitle(true)}
                style={styles.titleRow}
                activeOpacity={0.7}>
                <Text style={styles.workoutTitle}>{activeWorkout.name || 'Untitled Workout'}</Text>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleFinish}
            activeOpacity={0.8}>
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>

        {/* Workout Summary Bar */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalExercises}</Text>
            <Text style={styles.summaryLabel}>Exercises</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalSets}</Text>
            <Text style={styles.summaryLabel}>Sets</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: FitnessColors.accent }]}>
              {totalVolume > 999 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
            </Text>
            <Text style={styles.summaryLabel}>Volume (kg)</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: FitnessColors.green }]}>
              {completedExercises}/{totalExercises}
            </Text>
            <Text style={styles.summaryLabel}>Done</Text>
          </View>
        </View>

        {/* Empty Workout — Preset-first state */}
        {activeWorkout.exercises.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏋️‍♂️</Text>
            <Text style={styles.emptyTitle}>Start Your Workout</Text>
            <Text style={styles.emptySubtitle}>
              Load a curated preset or build your own session by adding exercises below.
            </Text>

            {/* Quick preset tiles */}
            <TouchableOpacity
              style={styles.presetLaunchBtn}
              onPress={() => setIsPresetPickerOpen(true)}
              activeOpacity={0.85}>
              <Text style={styles.presetLaunchIcon}>📋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.presetLaunchTitle}>Choose a Preset Workout</Text>
                <Text style={styles.presetLaunchSub}>{workoutPresets.length} programs · Strength, HIIT, Hypertrophy & more</Text>
              </View>
              <Text style={styles.presetLaunchArrow}>→</Text>
            </TouchableOpacity>

            {/* Featured preset quick-tiles */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
              {workoutPresets.slice(0, 5).map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.featuredTile, { borderColor: preset.color + '50', backgroundColor: preset.bg }]}
                  onPress={() => handleLoadPreset(preset)}
                  activeOpacity={0.8}>
                  <Text style={styles.featuredTileIcon}>{preset.icon}</Text>
                  <Text style={[styles.featuredTileName, { color: preset.color }]} numberOfLines={2}>
                    {preset.name}
                  </Text>
                  <Text style={styles.featuredTileDur}>{preset.estimatedDuration} min</Text>
                  <View style={[styles.featuredDiffBadge, { backgroundColor: preset.color + '22' }]}>
                    <Text style={[styles.featuredDiffText, { color: preset.color }]}>
                      {preset.difficulty}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Exercises List */}
        {activeWorkout.exercises.map((ex, exIndex) => (
          <View
            key={ex.id}
            style={[
              styles.exerciseCard,
              ex.isCompleted && styles.exerciseCardCompleted,
            ]}>
            {/* Exercise Header */}
            <View style={styles.exerciseCardHeader}>
              <View style={styles.exerciseHeaderLeft}>
                <View style={[styles.exerciseEmojiBox, ex.isCompleted && styles.emojiBoxCompleted]}>
                  <Text style={styles.exerciseEmoji}>{ex.emoji}</Text>
                </View>
                <View>
                  <Text style={[styles.exerciseName, ex.isCompleted && styles.exerciseNameCompleted]}>
                    {ex.name}
                  </Text>
                  <Text style={styles.exerciseSub}>
                    {ex.muscle} · {ex.equipment}
                  </Text>
                </View>
              </View>

              <View style={styles.exerciseHeaderActions}>
                {/* Complete Toggle Button */}
                <TouchableOpacity
                  style={[
                    styles.completeToggleBtn,
                    ex.isCompleted ? styles.completeToggleBtnActive : styles.completeToggleBtnInactive,
                  ]}
                  onPress={() => toggleExerciseCompleted(ex.id)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.completeToggleText,
                      ex.isCompleted ? styles.completeToggleTextActive : styles.completeToggleTextInactive,
                    ]}>
                    {ex.isCompleted ? '✓ Done' : 'Mark Done'}
                  </Text>
                </TouchableOpacity>

                {/* Remove Exercise */}
                <TouchableOpacity
                  style={styles.removeExerciseBtn}
                  onPress={() => removeExerciseFromWorkout(ex.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.removeExerciseText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Set Table Headers */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colHeader, styles.colSet]}>SET</Text>
              <Text style={[styles.colHeader, styles.colInput]}>KG</Text>
              <Text style={[styles.colHeader, styles.colInput]}>REPS</Text>
              <Text style={[styles.colHeader, styles.colAction]}>DEL</Text>
            </View>

            {/* Set Rows */}
            {ex.sets.map((set) => (
              <View key={set.id} style={styles.setRow}>
                {/* Set Number */}
                <View style={styles.setNumberBadge}>
                  <Text style={styles.setNumberText}>{set.setNumber}</Text>
                </View>

                {/* Weight Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.numInput}
                    value={set.weight}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={FitnessColors.textMuted}
                    onChangeText={(val) => updateSet(ex.id, set.id, 'weight', val)}
                  />
                </View>

                {/* Reps Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.numInput}
                    value={set.reps}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={FitnessColors.textMuted}
                    onChangeText={(val) => updateSet(ex.id, set.id, 'reps', val)}
                  />
                </View>

                {/* Remove Set Button */}
                <TouchableOpacity
                  style={styles.deleteSetBtn}
                  onPress={() => removeSetFromExercise(ex.id, set.id)}
                  disabled={ex.sets.length <= 1}>
                  <Text
                    style={[
                      styles.deleteSetText,
                      ex.sets.length <= 1 && styles.deleteSetDisabled,
                    ]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetBtn}
              onPress={() => addSetToExercise(ex.id)}
              activeOpacity={0.7}>
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.addExerciseBtn, { flex: 1 }]}
              onPress={() => setIsExercisePickerOpen(true)}
              activeOpacity={0.8}>
              <Text style={styles.addExerciseBtnText}>+ Add Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setIsPresetPickerOpen(true)}
              activeOpacity={0.8}>
              <Text style={styles.presetBtnText}>📋 Presets</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.finishWorkoutFullBtn}
            onPress={handleFinish}
            activeOpacity={0.8}>
            <Text style={styles.finishWorkoutFullBtnText}>Finish & Save Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Modal: Preset Picker */}
        <Modal
          visible={isPresetPickerOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => { setIsPresetPickerOpen(false); setPreviewPreset(null); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {previewPreset ? (
                /* ── Preset Detail View ── */
                <View style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => setPreviewPreset(null)}
                      style={styles.modalCloseBtn}>
                      <Text style={styles.modalCloseText}>←</Text>
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { flex: 1, marginLeft: 8 }]}>{previewPreset.name}</Text>
                    <TouchableOpacity
                      onPress={() => { setIsPresetPickerOpen(false); setPreviewPreset(null); }}
                      style={styles.modalCloseBtn}>
                      <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Hero */}
                    <View style={[styles.presetDetailHero, { backgroundColor: previewPreset.bg, borderColor: previewPreset.color + '40' }]}>
                      <Text style={styles.presetDetailIcon}>{previewPreset.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.presetDetailCategory, { color: previewPreset.color }]}>
                          {previewPreset.category.toUpperCase()}
                        </Text>
                        <Text style={styles.presetDetailName}>{previewPreset.name}</Text>
                        <View style={styles.presetDetailMeta}>
                          <Text style={styles.presetDetailMetaText}>⏱ {previewPreset.estimatedDuration} min</Text>
                          <Text style={styles.presetDetailMetaText}>🏋️ {previewPreset.exerciseNames.length} exercises</Text>
                          <View style={[styles.diffBadge, {
                            backgroundColor: previewPreset.color + '22',
                            borderColor: previewPreset.color + '50',
                          }]}>
                            <Text style={[styles.diffBadgeText, { color: previewPreset.color }]}>
                              {previewPreset.difficulty}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Description */}
                    <View style={styles.presetDetailSection}>
                      <Text style={styles.presetDetailSectionTitle}>About</Text>
                      <Text style={styles.presetDetailDesc}>{previewPreset.description}</Text>
                    </View>

                    {/* Target Muscles */}
                    <View style={styles.presetDetailSection}>
                      <Text style={styles.presetDetailSectionTitle}>Target Muscles</Text>
                      <View style={styles.muscleTags}>
                        {previewPreset.targetMuscles.map((m) => (
                          <View key={m} style={styles.muscleTag}>
                            <Text style={styles.muscleTagText}>{m}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Exercise List */}
                    <View style={styles.presetDetailSection}>
                      <Text style={styles.presetDetailSectionTitle}>Exercises ({previewPreset.exerciseNames.length})</Text>
                      {previewPreset.exerciseNames.map((exName, i) => {
                        const found = exercises.find((e) =>
                          e.name.toLowerCase().includes(exName.toLowerCase()) ||
                          exName.toLowerCase().includes(e.name.toLowerCase())
                        );
                        return (
                          <View key={i} style={styles.presetExRow}>
                            <View style={styles.presetExNumBadge}>
                              <Text style={styles.presetExNum}>{i + 1}</Text>
                            </View>
                            <Text style={styles.presetExEmoji}>{found?.emoji ?? '🏋️'}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.presetExName}>{exName}</Text>
                              {found && (
                                <Text style={styles.presetExSub}>
                                  {found.muscle} · {found.equipment} · {found.difficulty}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>

                  {/* Load button */}
                  <TouchableOpacity
                    style={[styles.loadPresetBtn, { backgroundColor: previewPreset.color }]}
                    onPress={() => handleLoadPreset(previewPreset)}
                    activeOpacity={0.85}>
                    <Text style={[styles.loadPresetBtnText, { color: previewPreset.color === '#E2FF3A' ? '#000' : '#000' }]}>
                      🚀 Load Preset — Start Training
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Preset List View ── */
                <View style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>📋 Choose a Preset</Text>
                    <TouchableOpacity
                      onPress={() => setIsPresetPickerOpen(false)}
                      style={styles.modalCloseBtn}>
                      <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Category filter tabs */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.presetCatScroll}
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
                    {presetCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.presetCatTab,
                          presetCategoryFilter === cat.id && styles.presetCatTabActive,
                        ]}
                        onPress={() => setPresetCategoryFilter(cat.id)}
                        activeOpacity={0.75}>
                        <Text style={styles.presetCatIcon}>{cat.icon}</Text>
                        <Text style={[
                          styles.presetCatLabel,
                          presetCategoryFilter === cat.id && styles.presetCatLabelActive,
                        ]}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                    {workoutPresets
                      .filter((p) => presetCategoryFilter === 'all' || p.category === presetCategoryFilter)
                      .map((preset) => (
                        <TouchableOpacity
                          key={preset.id}
                          style={[styles.presetListItem, { borderColor: preset.color + '35' }]}
                          onPress={() => setPreviewPreset(preset)}
                          activeOpacity={0.8}>
                          {/* Left accent bar */}
                          <View style={[styles.presetAccentBar, { backgroundColor: preset.color }]} />

                          <View style={[styles.presetIconBox, { backgroundColor: preset.bg }]}>
                            <Text style={styles.presetIconText}>{preset.icon}</Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={styles.presetItemTopRow}>
                              <Text style={styles.presetItemName}>{preset.name}</Text>
                              <View style={[styles.diffBadge, {
                                backgroundColor: preset.color + '22',
                                borderColor: preset.color + '40',
                              }]}>
                                <Text style={[styles.diffBadgeText, { color: preset.color }]}>
                                  {preset.difficulty}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.presetItemDesc} numberOfLines={1}>
                              {preset.description}
                            </Text>
                            <View style={styles.presetItemMeta}>
                              <Text style={styles.presetItemMetaText}>⏱ {preset.estimatedDuration}m</Text>
                              <Text style={styles.presetItemMetaText}>🏋️ {preset.exerciseNames.length} exercises</Text>
                              <Text style={[styles.presetItemMetaText, { color: preset.color }]}>
                                {preset.category}
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={[styles.presetQuickLoad, { backgroundColor: preset.color }]}
                            onPress={() => handleLoadPreset(preset)}
                            activeOpacity={0.85}>
                            <Text style={styles.presetQuickLoadText}>▶</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal: Exercise Picker */}
        <Modal
          visible={isExercisePickerOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsExercisePickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Exercise</Text>
                <TouchableOpacity
                  onPress={() => setIsExercisePickerOpen(false)}
                  style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search input in modal */}
              <View style={styles.modalSearchBox}>
                <Text style={styles.modalSearchIcon}>🔍</Text>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search exercise or muscle..."
                  placeholderTextColor={FitnessColors.textMuted}
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  autoCorrect={false}
                />
                {pickerSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setPickerSearch('')}>
                    <Text style={styles.clearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {filteredExercisesForPicker.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      addExerciseToWorkout(item);
                      setIsExercisePickerOpen(false);
                      setPickerSearch('');
                    }}
                    activeOpacity={0.7}>
                    <View style={styles.pickerItemEmoji}>
                      <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                    </View>
                    <View style={styles.pickerItemInfo}>
                      <Text style={styles.pickerItemName}>{item.name}</Text>
                      <Text style={styles.pickerItemSub}>
                        {item.muscle} · {item.equipment} · {item.difficulty}
                      </Text>
                    </View>
                    <View style={styles.pickerAddBadge}>
                      <Text style={styles.pickerAddBadgeText}>+ Add</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: FitnessColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.two,
  },
  screenTag: {
    fontSize: 11,
    fontWeight: '800',
    color: FitnessColors.accent,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  editIcon: {
    fontSize: 14,
    opacity: 0.8,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: FitnessColors.text,
    backgroundColor: FitnessColors.backgroundCard,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: FitnessColors.accent,
  },
  finishBtn: {
    backgroundColor: FitnessColors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  finishBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },

  /* Summary Card */
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    marginBottom: Spacing.one,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: FitnessColors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: FitnessColors.border,
  },

  /* Empty state */
  emptyContainer: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
    marginVertical: Spacing.two,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FitnessColors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: FitnessColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },

  /* Exercise Card */
  exerciseCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: Spacing.two,
  },
  exerciseCardCompleted: {
    borderColor: FitnessColors.green + '80',
    backgroundColor: '#051A0D',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBoxCompleted: {
    backgroundColor: FitnessColors.green + '22',
  },
  exerciseEmoji: {
    fontSize: 22,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  exerciseNameCompleted: {
    color: FitnessColors.green,
  },
  exerciseSub: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },
  exerciseHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  completeToggleBtnActive: {
    backgroundColor: FitnessColors.green + '25',
    borderColor: FitnessColors.green,
  },
  completeToggleBtnInactive: {
    backgroundColor: FitnessColors.backgroundElement,
    borderColor: FitnessColors.border,
  },
  completeToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  completeToggleTextActive: {
    color: FitnessColors.green,
  },
  completeToggleTextInactive: {
    color: FitnessColors.textSecondary,
  },
  removeExerciseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeExerciseText: {
    color: FitnessColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  /* Set Table */
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: FitnessColors.border,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: FitnessColors.textMuted,
    textAlign: 'center',
  },
  colSet: {
    width: 50,
  },
  colInput: {
    flex: 1,
  },
  colAction: {
    width: 44,
  },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  setNumberBadge: {
    width: 50,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
  },
  inputWrapper: {
    flex: 1,
  },
  numInput: {
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.sm,
    height: 38,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: FitnessColors.text,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  deleteSetBtn: {
    width: 44,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSetText: {
    color: FitnessColors.red,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteSetDisabled: {
    color: FitnessColors.textMuted + '40',
  },

  addSetBtn: {
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    borderStyle: 'dashed',
  },
  addSetText: {
    color: FitnessColors.accent,
    fontSize: 13,
    fontWeight: '700',
  },

  /* Bottom Actions */
  bottomActions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  addExerciseBtn: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.accent,
    borderStyle: 'dashed',
  },
  addExerciseBtnText: {
    color: FitnessColors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  presetBtn: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.purple + '80',
  },
  presetBtnText: {
    color: FitnessColors.purple,
    fontSize: 13,
    fontWeight: '700',
  },
  finishWorkoutFullBtn: {
    backgroundColor: FitnessColors.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishWorkoutFullBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },

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
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: FitnessColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: Spacing.two,
  },
  modalSearchIcon: {
    fontSize: 15,
  },
  modalSearchInput: {
    flex: 1,
    color: FitnessColors.text,
    fontSize: 14,
  },
  clearText: {
    color: FitnessColors.textSecondary,
    fontSize: 13,
  },
  modalList: {
    maxHeight: 400,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FitnessColors.border,
    gap: 12,
  },
  pickerItemEmoji: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  pickerItemSub: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },
  pickerAddBadge: {
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '60',
  },
  pickerAddBadgeText: {
    color: FitnessColors.accent,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ─── Empty state preset launch ─────────────────────────────────────── */
  presetLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.purple + '50',
    gap: 12,
    marginTop: Spacing.three,
  },
  presetLaunchIcon: { fontSize: 24 },
  presetLaunchTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  presetLaunchSub: {
    fontSize: 11,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },
  presetLaunchArrow: {
    fontSize: 18,
    color: FitnessColors.purple,
    fontWeight: '800',
  },

  /* ─── Featured horizontal tiles ─────────────────────────────────────── */
  featuredScroll: { marginTop: Spacing.two },
  featuredTile: {
    width: 130,
    borderRadius: BorderRadius.lg,
    padding: Spacing.two,
    marginRight: Spacing.two,
    borderWidth: 1,
    gap: 6,
  },
  featuredTileIcon: { fontSize: 28 },
  featuredTileName: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  featuredTileDur: {
    fontSize: 11,
    color: FitnessColors.textSecondary,
  },
  featuredDiffBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  featuredDiffText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  /* ─── Preset picker category tabs ────────────────────────────────────── */
  presetCatScroll: { marginBottom: Spacing.two },
  presetCatTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: FitnessColors.backgroundElement,
    gap: 5,
  },
  presetCatTabActive: {
    backgroundColor: FitnessColors.accentBg,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '50',
  },
  presetCatIcon: { fontSize: 14 },
  presetCatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: FitnessColors.textMuted,
  },
  presetCatLabelActive: { color: FitnessColors.accent },

  /* ─── Preset list items ──────────────────────────────────────────────── */
  presetListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 12,
    paddingRight: 8,
    paddingVertical: 12,
  },
  presetAccentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  presetIconBox: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIconText: { fontSize: 24 },
  presetItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: FitnessColors.text,
    flex: 1,
  },
  presetItemDesc: {
    fontSize: 11,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },
  presetItemMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  presetItemMetaText: {
    fontSize: 11,
    color: FitnessColors.textMuted,
    fontWeight: '600',
  },
  presetQuickLoad: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetQuickLoadText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },

  /* ─── Difficulty badge (shared) ──────────────────────────────────────── */
  diffBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  /* ─── Preset Detail view ─────────────────────────────────────────────── */
  presetDetailHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: 4,
  },
  presetDetailIcon: { fontSize: 48 },
  presetDetailCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  presetDetailName: {
    fontSize: 20,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  presetDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  presetDetailMetaText: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    fontWeight: '600',
  },
  presetDetailSection: {
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: FitnessColors.border,
    gap: 8,
    marginTop: 4,
  },
  presetDetailSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: FitnessColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  presetDetailDesc: {
    fontSize: 13,
    color: FitnessColors.textSecondary,
    lineHeight: 20,
  },

  /* Muscle tags */
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.text,
  },

  /* Exercise rows in detail */
  presetExRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: FitnessColors.border,
  },
  presetExNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: FitnessColors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.accent + '40',
  },
  presetExNum: {
    fontSize: 11,
    fontWeight: '800',
    color: FitnessColors.accent,
  },
  presetExEmoji: { fontSize: 20 },
  presetExName: {
    fontSize: 14,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  presetExSub: {
    fontSize: 11,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },

  /* Load preset CTA */
  loadPresetBtn: {
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  loadPresetBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});

