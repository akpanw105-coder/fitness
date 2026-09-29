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

import {
  ExerciseDetail,
  allMuscles,
  allPrograms,
  comprehensiveExercises,
} from '@/constants/exerciseLibraryData';
import { BorderRadius, BottomTabInset, FitnessColors, Spacing } from '@/constants/theme';
import { useWorkout } from '@/context/WorkoutContext';

const difficultyColor: Record<string, string> = {
  Beginner: FitnessColors.green,
  Intermediate: FitnessColors.blue,
  Advanced: FitnessColors.red,
};

const equipmentColors: Record<string, string> = {
  Barbell: FitnessColors.orange,
  Dumbbell: FitnessColors.purple,
  Bodyweight: FitnessColors.accent,
  Cable: '#00E5FF',
  Machine: '#FF7A2E',
  Kettlebell: '#FF4C4C',
};

const programColors: Record<string, string> = {
  Strength: '#CCFF00',
  Hypertrophy: '#FF7A2E',
  'HIIT & Conditioning': '#FF4C4C',
  Calisthenics: '#4D8EF7',
  'Mobility & Rehab': '#9B59F5',
};

export default function LibraryScreen() {
  const router = useRouter();
  const { addExerciseToWorkout } = useWorkout();

  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchText, setSearchText] = useState('');
  const [activeExerciseModal, setActiveExerciseModal] = useState<ExerciseDetail | null>(null);

  // Filter logic
  const filtered = comprehensiveExercises.filter((e) => {
    const matchesProgram = selectedProgram === 'All' || e.program === selectedProgram;
    const matchesMuscle =
      selectedMuscle === 'All' ||
      e.primaryMuscle === selectedMuscle ||
      e.secondaryMuscles.includes(selectedMuscle);
    const matchesSearch =
      e.name.toLowerCase().includes(searchText.toLowerCase()) ||
      e.primaryMuscle.toLowerCase().includes(searchText.toLowerCase()) ||
      e.program.toLowerCase().includes(searchText.toLowerCase()) ||
      e.equipment.toLowerCase().includes(searchText.toLowerCase()) ||
      e.secondaryMuscles.some((m) => m.toLowerCase().includes(searchText.toLowerCase()));

    return matchesProgram && matchesMuscle && matchesSearch;
  });

  const handleAddExerciseToWorkout = (exercise: ExerciseDetail) => {
    // Map to simplified format expected by WorkoutContext
    addExerciseToWorkout({
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.primaryMuscle,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      sets: exercise.recommendedSets,
      emoji: exercise.emoji,
    });

    if (activeExerciseModal) {
      setActiveExerciseModal(null);
    }

    Alert.alert(
      'Added to Active Workout 🏋️',
      `"${exercise.name}" has been added to your session in the Workout Tracker.`,
      [
        {
          text: 'Go to Tracker',
          onPress: () => router.push('/track'),
        },
        { text: 'Keep Browsing', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Exercise Library</Text>
            <Text style={styles.exerciseCount}>
              {comprehensiveExercises.length} comprehensive training movements
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises, muscles, benefits, equipment..."
            placeholderTextColor={FitnessColors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Training Programs Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Training Program</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {allPrograms.map((p) => {
              const isSelected = selectedProgram === p;
              const pColor = programColors[p] || FitnessColors.accent;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.programChip,
                    isSelected && { backgroundColor: pColor, borderColor: pColor },
                  ]}
                  onPress={() => setSelectedProgram(p)}>
                  <Text
                    style={[
                      styles.programChipText,
                      isSelected && { color: '#000000', fontWeight: '800' },
                    ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Target Muscle Group Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Target Muscle</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {allMuscles.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.muscleChip, selectedMuscle === m && styles.muscleChipActive]}
                onPress={() => setSelectedMuscle(m)}>
                <Text style={[styles.muscleText, selectedMuscle === m && styles.muscleTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Counter & Active Filters Indicator */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsLabel}>
            {filtered.length} {filtered.length === 1 ? 'exercise found' : 'exercises found'}
          </Text>
          {(selectedProgram !== 'All' || selectedMuscle !== 'All' || searchText !== '') && (
            <TouchableOpacity
              onPress={() => {
                setSelectedProgram('All');
                setSelectedMuscle('All');
                setSearchText('');
              }}>
              <Text style={styles.resetFiltersText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Exercises Cards */}
        {filtered.map((e) => {
          const progCol = programColors[e.program] || FitnessColors.accent;
          return (
            <TouchableOpacity
              key={e.id}
              style={styles.exerciseCard}
              onPress={() => setActiveExerciseModal(e)}
              activeOpacity={0.8}>
              <View style={styles.exerciseMain}>
                <View style={styles.emojiBox}>
                  <Text style={styles.exerciseEmoji}>{e.emoji}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.exerciseName}>{e.name}</Text>
                  </View>

                  {/* Program & Muscle Badges */}
                  <View style={styles.badgesRow}>
                    <View style={[styles.badge, { backgroundColor: progCol + '20', borderColor: progCol + '50', borderWidth: 1 }]}>
                      <Text style={[styles.badgeText, { color: progCol }]}>
                        {e.program}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: (equipmentColors[e.equipment] || FitnessColors.textMuted) + '22' }]}>
                      <Text style={[styles.badgeText, { color: equipmentColors[e.equipment] || FitnessColors.textMuted }]}>
                        {e.equipment}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: difficultyColor[e.difficulty] + '22' }]}>
                      <Text style={[styles.badgeText, { color: difficultyColor[e.difficulty] }]}>
                        {e.difficulty}
                      </Text>
                    </View>
                  </View>

                  {/* Muscle Targets */}
                  <View style={styles.muscleRow}>
                    <Text style={styles.primaryMuscleTag}>🎯 {e.primaryMuscle}</Text>
                    {e.secondaryMuscles.length > 0 && (
                      <Text style={styles.secondaryMusclesText} numberOfLines={1}>
                        + {e.secondaryMuscles.join(', ')}
                      </Text>
                    )}
                  </View>

                  {/* One-line key benefit */}
                  <Text style={styles.benefitSnippet} numberOfLines={2}>
                    💡 {e.benefits[0]}
                  </Text>
                </View>
              </View>

              {/* Bottom Card Strip */}
              <View style={styles.cardFooter}>
                <Text style={styles.setsInfoText}>Rec: {e.recommendedSets}</Text>
                <TouchableOpacity
                  style={styles.quickAddBtn}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    handleAddExerciseToWorkout(e);
                  }}>
                  <Text style={styles.quickAddBtnText}>+ Add to Workout</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No matching exercises</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your program or muscle group filters.
            </Text>
          </View>
        )}

        {/* Modal: Full Exercise Detail & Anatomical Breakdown */}
        <Modal
          visible={activeExerciseModal !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActiveExerciseModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {activeExerciseModal && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                      <Text style={styles.modalEmoji}>{activeExerciseModal.emoji}</Text>
                      <View>
                        <Text style={styles.modalTitle}>{activeExerciseModal.name}</Text>
                        <Text style={styles.modalSubtitle}>
                          {activeExerciseModal.program} · {activeExerciseModal.difficulty}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setActiveExerciseModal(null)}
                      style={styles.modalCloseBtn}>
                      <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    {/* Description */}
                    <Text style={styles.modalDesc}>{activeExerciseModal.description}</Text>

                    {/* Anatomical Targets Card */}
                    <View style={styles.detailSectionCard}>
                      <Text style={styles.detailSectionTitle}>ANATOMICAL MUSCLE GROUPS</Text>
                      
                      <View style={styles.muscleDetailRow}>
                        <Text style={styles.muscleDetailLabel}>Primary Target:</Text>
                        <View style={styles.primaryTargetPill}>
                          <Text style={styles.primaryTargetPillText}>
                            {activeExerciseModal.primaryMuscle}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.muscleDetailRow}>
                        <Text style={styles.muscleDetailLabel}>Synergists & Stabilizers:</Text>
                        <View style={styles.secondaryPillsWrap}>
                          {activeExerciseModal.secondaryMuscles.map((sec, i) => (
                            <View key={i} style={styles.secondaryTargetPill}>
                              <Text style={styles.secondaryTargetPillText}>{sec}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Text style={styles.metaItemLabel}>Equipment</Text>
                          <Text style={styles.metaItemVal}>{activeExerciseModal.equipment}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Text style={styles.metaItemLabel}>Target Sets</Text>
                          <Text style={styles.metaItemVal}>{activeExerciseModal.recommendedSets}</Text>
                        </View>
                        {activeExerciseModal.tempo && (
                          <View style={styles.metaItem}>
                            <Text style={styles.metaItemLabel}>Tempo</Text>
                            <Text style={styles.metaItemVal}>{activeExerciseModal.tempo}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Scientific Benefits Card */}
                    <View style={styles.detailSectionCard}>
                      <Text style={styles.detailSectionTitle}>KEY BENEFITS & ADAPTATIONS</Text>
                      {activeExerciseModal.benefits.map((b, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bulletCheck}>✓</Text>
                          <Text style={styles.bulletText}>{b}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Execution Cues Card */}
                    <View style={styles.detailSectionCard}>
                      <Text style={styles.detailSectionTitle}>FORM CUES & EXECUTION</Text>
                      {activeExerciseModal.cues.map((c, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bulletNumber}>{idx + 1}.</Text>
                          <Text style={styles.bulletText}>{c}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Add to Workout Button */}
                    <TouchableOpacity
                      style={styles.modalAddBtn}
                      onPress={() => handleAddExerciseToWorkout(activeExerciseModal)}
                      activeOpacity={0.8}>
                      <Text style={styles.modalAddBtnText}>+ Add to Active Workout</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
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
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: FitnessColors.text },
  exerciseCount: { fontSize: 13, color: FitnessColors.textSecondary, marginTop: 2 },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: FitnessColors.text,
  },
  clearSearch: { fontSize: 14, color: FitnessColors.textSecondary },

  /* Filters */
  filterSection: {
    marginTop: 2,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: FitnessColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  programChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: FitnessColors.backgroundCard,
    marginRight: 8,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  programChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: FitnessColors.textSecondary,
  },
  muscleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: FitnessColors.backgroundElement,
    marginRight: 6,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  muscleChipActive: {
    backgroundColor: FitnessColors.accent,
    borderColor: FitnessColors.accent,
  },
  muscleText: {
    fontSize: 12,
    fontWeight: '600',
    color: FitnessColors.textSecondary,
  },
  muscleTextActive: {
    color: '#000000',
    fontWeight: '700',
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
  },
  resetFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.accent,
  },

  /* Cards */
  exerciseCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 10,
  },
  exerciseMain: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseEmoji: { fontSize: 24 },
  exerciseInfo: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: { fontSize: 16, fontWeight: '700', color: FitnessColors.text },

  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },

  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  primaryMuscleTag: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.accent,
  },
  secondaryMusclesText: {
    fontSize: 11,
    color: FitnessColors.textMuted,
    flex: 1,
  },
  benefitSnippet: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: FitnessColors.border,
  },
  setsInfoText: {
    fontSize: 11,
    fontWeight: '600',
    color: FitnessColors.textMuted,
  },
  quickAddBtn: {
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '70',
  },
  quickAddBtnText: {
    color: FitnessColors.accent,
    fontSize: 12,
    fontWeight: '700',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: 6,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: '700', color: FitnessColors.text },
  emptySubtext: { fontSize: 13, color: FitnessColors.textSecondary, textAlign: 'center' },

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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: FitnessColors.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalEmoji: { fontSize: 32 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: FitnessColors.text },
  modalSubtitle: { fontSize: 12, color: FitnessColors.textSecondary, marginTop: 2 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { color: FitnessColors.textSecondary, fontSize: 14, fontWeight: '700' },
  modalBody: {
    marginTop: Spacing.two,
  },
  modalDesc: {
    fontSize: 14,
    color: FitnessColors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.three,
  },

  detailSectionCard: {
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: FitnessColors.accent,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  muscleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muscleDetailLabel: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    fontWeight: '600',
    minWidth: 100,
  },
  primaryTargetPill: {
    backgroundColor: FitnessColors.accent + '25',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: FitnessColors.accent,
  },
  primaryTargetPillText: {
    color: FitnessColors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  secondaryTargetPill: {
    backgroundColor: FitnessColors.backgroundCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  secondaryTargetPillText: {
    color: FitnessColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: FitnessColors.border,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaItemLabel: {
    fontSize: 10,
    color: FitnessColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metaItemVal: {
    fontSize: 13,
    fontWeight: '700',
    color: FitnessColors.text,
    marginTop: 2,
  },

  bulletItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletCheck: {
    color: FitnessColors.green,
    fontWeight: '800',
    fontSize: 14,
    marginTop: 1,
  },
  bulletNumber: {
    color: FitnessColors.accent,
    fontWeight: '800',
    fontSize: 12,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: FitnessColors.textSecondary,
    lineHeight: 18,
  },

  modalAddBtn: {
    backgroundColor: FitnessColors.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  modalAddBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
