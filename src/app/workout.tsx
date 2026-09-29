import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { recommendedWorkouts, workoutCategories } from '@/constants/mockData';
import { BorderRadius, BottomTabInset, FitnessColors, Spacing } from '@/constants/theme';
import { useWorkout } from '@/context/WorkoutContext';

const difficultyColor: Record<string, string> = {
  Easy: FitnessColors.green,
  Medium: FitnessColors.orange,
  Hard: FitnessColors.red,
};

export default function WorkoutScreen() {
  const router = useRouter();
  const { startPredefinedWorkout } = useWorkout();

  const handleStartWorkout = (name: string, category: string) => {
    // Map categories or names to relevant exercise names
    const suggestions =
      name.includes('Upper') || category === 'Strength'
        ? ['Bench Press', 'Pull-Up', 'Shoulder Press']
        : name.includes('Core') || category === 'Core'
        ? ['Plank']
        : ['Squat', 'Lunges'];

    startPredefinedWorkout(name, category, suggestions);
    router.push('/track');
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Workout</Text>
          <TouchableOpacity
            style={styles.customBtn}
            onPress={() => handleStartWorkout('Custom Workout', 'Custom')}>
            <Text style={styles.customBtnText}>+ Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search workouts...</Text>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {workoutCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: cat.bg, borderColor: cat.color + '40' }]}
              onPress={() => handleStartWorkout(`${cat.name} Session`, cat.name)}
              activeOpacity={0.7}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended workouts */}
        <Text style={styles.sectionTitle}>Recommended</Text>
        {recommendedWorkouts.map((w) => (
          <TouchableOpacity
            key={w.id}
            style={styles.workoutCard}
            onPress={() => handleStartWorkout(w.name, w.category)}
            activeOpacity={0.8}>
            {/* Color accent bar */}
            <View style={[styles.accentBar, { backgroundColor: w.color }]} />

            <View style={[styles.workoutIconBg, { backgroundColor: w.bg }]}>
              <Text style={styles.workoutIcon}>{w.icon}</Text>
            </View>

            <View style={styles.workoutInfo}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.workoutName}>{w.name}</Text>
                <View style={[styles.diffBadge, { backgroundColor: difficultyColor[w.difficulty] + '22' }]}>
                  <Text style={[styles.diffText, { color: difficultyColor[w.difficulty] }]}>
                    {w.difficulty}
                  </Text>
                </View>
              </View>
              <Text style={styles.categoryLabel}>{w.category}</Text>
              <View style={styles.workoutStats}>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutStatIcon}>⏱️</Text>
                  <Text style={styles.workoutStatText}>{w.duration} min</Text>
                </View>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutStatIcon}>🏋️</Text>
                  <Text style={styles.workoutStatText}>{w.exercises} exercises</Text>
                </View>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutStatIcon}>🔥</Text>
                  <Text style={styles.workoutStatText}>{w.calories} kcal</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: w.color }]}
              onPress={() => handleStartWorkout(w.name, w.category)}>
              <Text style={styles.startBtnText}>▶</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Featured / Quick pick */}
        <Text style={styles.sectionTitle}>Quick Pick</Text>
        <View style={styles.quickRow}>
          {[
            { label: '20 min', sub: 'Short & Intense', color: FitnessColors.orange, icon: '⚡' },
            { label: '45 min', sub: 'Full Session', color: FitnessColors.accent, icon: '💪' },
            { label: 'Rest', sub: 'Recovery Day', color: FitnessColors.purple, icon: '🧘' },
          ].map((q, i) => (
            <TouchableOpacity key={i} style={[styles.quickCard, { borderColor: q.color + '40' }]}>
              <Text style={styles.quickIcon}>{q.icon}</Text>
              <Text style={[styles.quickLabel, { color: q.color }]}>{q.label}</Text>
              <Text style={styles.quickSub}>{q.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FitnessColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.three, gap: Spacing.two },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: FitnessColors.text },
  customBtn: {
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.accent,
  },
  customBtnText: { color: FitnessColors.accent, fontSize: 13, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  searchIcon: { fontSize: 18 },
  searchPlaceholder: { color: FitnessColors.textMuted, fontSize: 15 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: FitnessColors.text, marginTop: Spacing.one },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  categoryCard: {
    width: '30%',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  categoryIcon: { fontSize: 28 },
  categoryName: { fontSize: 13, fontWeight: '700' },

  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  workoutIconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  workoutIcon: { fontSize: 26 },
  workoutInfo: { flex: 1, gap: 4 },
  workoutTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  workoutName: { fontSize: 15, fontWeight: '700', color: FitnessColors.text },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  diffText: { fontSize: 10, fontWeight: '700' },
  categoryLabel: { fontSize: 11, color: FitnessColors.textSecondary },
  workoutStats: { flexDirection: 'row', gap: Spacing.two, marginTop: 4 },
  workoutStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  workoutStatIcon: { fontSize: 11 },
  workoutStatText: { fontSize: 11, color: FitnessColors.textSecondary },
  startBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { fontSize: 14, color: '#000' },

  quickRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.two },
  quickCard: {
    flex: 1,
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  quickIcon: { fontSize: 24 },
  quickLabel: { fontSize: 16, fontWeight: '800' },
  quickSub: { fontSize: 10, color: FitnessColors.textSecondary, textAlign: 'center' },
});
