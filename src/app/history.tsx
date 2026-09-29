import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BorderRadius, BottomTabInset, FitnessColors, Spacing } from '@/constants/theme';
import { useWorkout } from '@/context/WorkoutContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { workoutHistory, deleteWorkoutFromHistory } = useWorkout();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Compute actual dynamic statistics directly from real logged workouts
  const totalWorkouts = workoutHistory.length;
  const totalMinutes = workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = workoutHistory.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalVolumeKg = workoutHistory.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);

  // Compute dynamic daily activity for the last 7 days from real workouts
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dayLabel = dayNames[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    // Find all workouts logged on this day
    const dayWorkouts = workoutHistory.filter((w) => {
      if (w.timestamp) {
        const wDate = new Date(w.timestamp).toISOString().split('T')[0];
        return wDate === dateStr;
      }
      return false;
    });

    const dayMinutes = dayWorkouts.reduce((s, w) => s + w.duration, 0);
    const dayCals = dayWorkouts.reduce((s, w) => s + w.calories, 0);
    const isToday = i === 6;

    return {
      day: dayLabel,
      minutes: dayMinutes,
      calories: dayCals,
      isToday,
      count: dayWorkouts.length,
    };
  });

  const maxMinutes = Math.max(...last7Days.map((d) => d.minutes), 30);
  const activeDaysCount = last7Days.filter((d) => d.minutes > 0).length;

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Workout', `Are you sure you want to remove "${name}" from your history?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteWorkoutFromHistory(id),
      },
    ]);
  };

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId((prev) => (prev === id ? null : id));
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
            <Text style={styles.pageTitle}>Workout History</Text>
            <Text style={styles.pageSubtitle}>
              {totalWorkouts} {totalWorkouts === 1 ? 'session logged' : 'sessions logged'}
            </Text>
          </View>

          {totalWorkouts > 0 && (
            <TouchableOpacity
              style={styles.logMoreBtn}
              onPress={() => router.push('/track')}
              activeOpacity={0.8}>
              <Text style={styles.logMoreBtnText}>+ New Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Real Summary Metrics Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: FitnessColors.accent }]}>{totalWorkouts}</Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: FitnessColors.blue }]}>{totalMinutes}</Text>
            <Text style={styles.summaryLabel}>Minutes</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: FitnessColors.orange }]}>{totalCalories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: FitnessColors.purple }]}>
              {totalVolumeKg > 999 ? `${(totalVolumeKg / 1000).toFixed(1)}k` : totalVolumeKg}
            </Text>
            <Text style={styles.summaryLabel}>Volume (kg)</Text>
          </View>
        </View>

        {/* Dynamic Activity Chart based on logged sessions */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartHeaderTitle}>Activity (Last 7 Days)</Text>
            <Text style={styles.chartHeaderSub}>
              {activeDaysCount} active {activeDaysCount === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View style={styles.barsContainer}>
            {last7Days.map((d, i) => {
              const fillPercent = d.minutes > 0 ? Math.max((d.minutes / maxMinutes) * 100, 15) : 0;
              return (
                <View key={i} style={styles.dayColumn}>
                  <Text style={styles.barMinutes}>{d.minutes > 0 ? `${d.minutes}m` : ''}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${fillPercent}%`,
                          backgroundColor: d.isToday
                            ? FitnessColors.accent
                            : d.minutes > 0
                            ? FitnessColors.blue
                            : FitnessColors.backgroundElement,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, d.isToday && { color: FitnessColors.accent, fontWeight: '700' }]}>
                    {d.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Logged Workouts</Text>
          <Text style={styles.sectionCountText}>{workoutHistory.length}</Text>
        </View>

        {/* Empty State when no workouts have been logged */}
        {workoutHistory.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No Workouts Logged Yet</Text>
            <Text style={styles.emptySubtitle}>
              Workouts you finish and save in the Workout Tracker will automatically appear here with full stats, sets, and exercises.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/track')}
              activeOpacity={0.8}>
              <Text style={styles.emptyActionBtnText}>Go to Workout Tracker</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Real Workouts List */}
        {workoutHistory.map((w) => {
          const isExpanded = expandedWorkoutId === w.id;
          return (
            <View key={w.id} style={styles.workoutCard}>
              <TouchableOpacity
                style={styles.workoutHeaderRow}
                onPress={() => toggleExpand(w.id)}
                activeOpacity={0.8}>
                <View style={[styles.workoutIconBg, { backgroundColor: (w.color || FitnessColors.accent) + '22' }]}>
                  <Text style={styles.workoutIconText}>{w.icon || '💪'}</Text>
                </View>

                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{w.name}</Text>
                  <Text style={styles.workoutDate}>{w.date}</Text>
                </View>

                <View style={styles.workoutMeta}>
                  <Text style={styles.workoutMetaVal}>{w.duration} min</Text>
                  <Text style={[styles.workoutMetaCal, { color: w.color || FitnessColors.accent }]}>
                    {w.calories} kcal
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(w.id, w.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Quick stats pill strip */}
              <View style={styles.statPillsRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statPillLabel}>Exercises:</Text>
                  <Text style={styles.statPillValue}>{w.exercisesCount}</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statPillLabel}>Volume:</Text>
                  <Text style={styles.statPillValue}>
                    {w.totalVolumeKg.toLocaleString()} kg
                  </Text>
                </View>
                <View style={[styles.statPill, styles.catPill]}>
                  <Text style={[styles.catPillText, { color: w.color || FitnessColors.accent }]}>
                    {w.category}
                  </Text>
                </View>
              </View>

              {/* Expandable Exercise Details Breakdown */}
              {isExpanded && w.exercises && w.exercises.length > 0 && (
                <View style={styles.exerciseBreakdownContainer}>
                  <Text style={styles.breakdownHeader}>Exercise Breakdown</Text>
                  {w.exercises.map((ex, exIdx) => (
                    <View key={exIdx} style={styles.breakdownItem}>
                      <View style={styles.breakdownItemLeft}>
                        <Text style={styles.breakdownEmoji}>{ex.emoji}</Text>
                        <Text style={styles.breakdownName}>{ex.name}</Text>
                      </View>
                      <View style={styles.breakdownItemRight}>
                        <Text style={styles.breakdownSets}>
                          {ex.setsCount} {ex.setsCount === 1 ? 'set' : 'sets'} · {ex.totalReps} reps
                        </Text>
                        {ex.bestWeight > 0 && (
                          <Text style={styles.breakdownWeight}>
                            Top: {ex.bestWeight} kg
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Toggle Hint */}
              {w.exercises && w.exercises.length > 0 && (
                <TouchableOpacity
                  onPress={() => toggleExpand(w.id)}
                  style={styles.expandToggleBtn}>
                  <Text style={styles.expandToggleText}>
                    {isExpanded ? '▲ Hide Details' : '▼ Show Exercise Details'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  pageSubtitle: {
    fontSize: 13,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },
  logMoreBtn: {
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.accent,
  },
  logMoreBtnText: {
    color: FitnessColors.accent,
    fontSize: 13,
    fontWeight: '700',
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
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 18,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  summaryLabel: {
    fontSize: 10,
    color: FitnessColors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: FitnessColors.border,
  },

  /* Chart Card */
  chartCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  chartHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  chartHeaderSub: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 16,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barMinutes: {
    fontSize: 10,
    color: FitnessColors.textSecondary,
    fontWeight: '600',
    minHeight: 14,
  },
  barBg: {
    width: 24,
    flex: 1,
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    color: FitnessColors.textMuted,
    fontWeight: '500',
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: FitnessColors.text,
  },
  sectionCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: FitnessColors.accent,
  },

  /* Empty State */
  emptyContainer: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
    marginVertical: Spacing.one,
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
    marginBottom: Spacing.three,
  },
  emptyActionBtn: {
    backgroundColor: FitnessColors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  emptyActionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },

  /* Workout Card */
  workoutCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 10,
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIconBg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutIconText: {
    fontSize: 22,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  workoutDate: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    marginTop: 2,
  },
  workoutMeta: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  workoutMetaVal: {
    fontSize: 14,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  workoutMetaCal: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    color: FitnessColors.textMuted,
    fontWeight: '700',
  },

  /* Stat Pills */
  statPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundElement,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statPillLabel: {
    fontSize: 11,
    color: FitnessColors.textMuted,
  },
  statPillValue: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.text,
  },
  catPill: {
    backgroundColor: FitnessColors.accentBg,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Breakdown */
  exerciseBreakdownContainer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: FitnessColors.border,
    gap: 8,
  },
  breakdownHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownEmoji: {
    fontSize: 16,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: FitnessColors.text,
  },
  breakdownItemRight: {
    alignItems: 'flex-end',
  },
  breakdownSets: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
  },
  breakdownWeight: {
    fontSize: 11,
    color: FitnessColors.accent,
    fontWeight: '600',
  },

  expandToggleBtn: {
    alignItems: 'center',
    paddingTop: 4,
  },
  expandToggleText: {
    fontSize: 11,
    color: FitnessColors.textMuted,
    fontWeight: '600',
  },
});
