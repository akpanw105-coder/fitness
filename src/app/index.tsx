import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { builtInPresets } from '@/app/timer';
import { comprehensiveExercises } from '@/constants/exerciseLibraryData';
import { recommendedWorkouts, todayStats, workoutCategories } from '@/constants/mockData';
import { BorderRadius, BottomTabInset, FitnessColors, Spacing } from '@/constants/theme';
import { useWorkout } from '@/context/WorkoutContext';
import PersonalProgressModal from '@/components/ui/PersonalProgressModal';

function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  children,
}: {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: FitnessColors.backgroundElement,
        }}
      />
      {/* Filled arc */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: progress > 0.25 ? color : 'transparent',
          borderRightColor: progress > 0.5 ? color : 'transparent',
          borderBottomColor: progress > 0.75 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

function SectionHeader({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [showPersonal, setShowPersonal] = useState(false);
  const { activeWorkout, workoutHistory, weightEntries, measurementsHistory, progressPhotos, getOneRepMaxEstimates } = useWorkout();

  // 1. Dynamic Track Section Stats
  const activeDoneCount = activeWorkout.exercises.filter((e) => e.isCompleted).length;
  const activeTotalCount = activeWorkout.exercises.length;
  const activeTotalSets = activeWorkout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const activeVolumeKg = activeWorkout.exercises.reduce((sum, e) => {
    return (
      sum +
      e.sets.reduce((sSum, s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseFloat(s.reps) || 0;
        return sSum + w * r;
      }, 0)
    );
  }, 0);

  // 2. Dynamic History Section Stats (from logged workouts)
  const totalWorkoutsLogged = workoutHistory.length;
  const totalMinutesLogged = workoutHistory.reduce((s, w) => s + (w.duration || 0), 0);
  const totalCaloriesLogged = workoutHistory.reduce((s, w) => s + (w.calories || 0), 0);
  const totalHistoryVolumeKg = workoutHistory.reduce((s, w) => s + (w.totalVolumeKg || 0), 0);

  // 3. Combined activity progress
  const stepsProgress = todayStats.steps / todayStats.stepsGoal;
  const dynamicCalories = todayStats.calories + totalCaloriesLogged;
  const calProgress = dynamicCalories / todayStats.caloriesGoal;
  const dynamicActiveMinutes = todayStats.activeMinutes + totalMinutesLogged;
  const activeProgress = dynamicActiveMinutes / todayStats.activeMinutesGoal;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.userName}>Alex Johnson</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AJ</Text>
          </View>
        </View>

        {/* 1. Daily Activity Widget linked to Track & History */}
        <TouchableOpacity
          style={styles.statsRow}
          onPress={() => router.push('/track')}
          activeOpacity={0.85}>
          <View style={styles.statWidget}>
            <ProgressRing size={74} strokeWidth={6} progress={stepsProgress} color={FitnessColors.accent}>
              <Text style={styles.statEmoji}>👟</Text>
            </ProgressRing>
            <Text style={[styles.statValue, { color: FitnessColors.accent }]}>
              {todayStats.steps.toLocaleString()}
            </Text>
            <Text style={styles.statUnit}>Steps</Text>
          </View>

          <View style={styles.statWidget}>
            <ProgressRing size={74} strokeWidth={6} progress={calProgress} color={FitnessColors.orange}>
              <Text style={styles.statEmoji}>🔥</Text>
            </ProgressRing>
            <Text style={[styles.statValue, { color: FitnessColors.orange }]}>
              {dynamicCalories}
            </Text>
            <Text style={styles.statUnit}>Calories</Text>
          </View>

          <View style={styles.statWidget}>
            <ProgressRing size={74} strokeWidth={6} progress={activeProgress} color={FitnessColors.blue}>
              <Text style={styles.statEmoji}>⏱️</Text>
            </ProgressRing>
            <Text style={[styles.statValue, { color: FitnessColors.blue }]}>
              {dynamicActiveMinutes}m
            </Text>
            <Text style={styles.statUnit}>Active Time</Text>
          </View>

          <View style={styles.statWidget}>
            <ProgressRing
              size={74}
              strokeWidth={6}
              progress={totalWorkoutsLogged > 0 ? 1 : 0.25}
              color={FitnessColors.purple}>
              <Text style={styles.statEmoji}>💪</Text>
            </ProgressRing>
            <Text style={[styles.statValue, { color: FitnessColors.purple }]}>
              {totalWorkoutsLogged}
            </Text>
            <Text style={styles.statUnit}>Done</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Active Workout Tracker Widget (Links to Track) */}
        <SectionHeader
          title="Active Workout Tracker"
          action="Open Tracker →"
          onActionPress={() => router.push('/track')}
        />
        <TouchableOpacity
          style={styles.activeWorkoutWidget}
          onPress={() => router.push('/track')}
          activeOpacity={0.85}>
          <View style={styles.activeWorkoutTop}>
            <View style={styles.activeWorkoutBadge}>
              <Text style={styles.activeWorkoutBadgeDot}>●</Text>
              <Text style={styles.activeWorkoutBadgeText}>LIVE SESSION</Text>
            </View>
            <Text style={styles.activeWorkoutCategory}>
              {activeWorkout.category || 'Strength'}
            </Text>
          </View>

          <Text style={styles.activeWorkoutTitle}>
            {activeWorkout.name || 'Untitled Workout'}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${activeTotalCount > 0 ? (activeDoneCount / activeTotalCount) * 100 : 0}%`,
                  backgroundColor: FitnessColors.accent,
                },
              ]}
            />
          </View>

          <View style={styles.activeWorkoutStatsRow}>
            <View style={styles.activeStatCol}>
              <Text style={styles.activeStatVal}>
                {activeDoneCount}/{activeTotalCount}
              </Text>
              <Text style={styles.activeStatLbl}>Exercises Done</Text>
            </View>
            <View style={styles.activeStatCol}>
              <Text style={styles.activeStatVal}>{activeTotalSets}</Text>
              <Text style={styles.activeStatLbl}>Total Sets</Text>
            </View>
            <View style={styles.activeStatCol}>
              <Text style={[styles.activeStatVal, { color: FitnessColors.accent }]}>
                {activeVolumeKg > 999 ? `${(activeVolumeKg / 1000).toFixed(1)}k` : activeVolumeKg} kg
              </Text>
              <Text style={styles.activeStatLbl}>Volume</Text>
            </View>
            <View style={styles.activeActionBtn}>
              <Text style={styles.activeActionBtnText}>Log Sets ➔</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Workout History Section Widget (Links to History) */}
        <SectionHeader
          title="Workout History"
          action="View All History →"
          onActionPress={() => router.push('/history')}
        />
        {workoutHistory.length === 0 ? (
          <TouchableOpacity
            style={styles.historyEmptyCard}
            onPress={() => router.push('/track')}
            activeOpacity={0.8}>
            <Text style={styles.historyEmptyEmoji}>📋</Text>
            <Text style={styles.historyEmptyTitle}>No Logged Workouts Yet</Text>
            <Text style={styles.historyEmptySub}>
              Tap to log your first session in the Workout Tracker →
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.historySummaryWidget}>
            <View style={styles.historyStatsStrip}>
              <View style={styles.historyStatBox}>
                <Text style={[styles.historyStatNum, { color: FitnessColors.accent }]}>
                  {totalWorkoutsLogged}
                </Text>
                <Text style={styles.historyStatLbl}>Logged</Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyStatBox}>
                <Text style={[styles.historyStatNum, { color: FitnessColors.blue }]}>
                  {totalMinutesLogged}m
                </Text>
                <Text style={styles.historyStatLbl}>Trained</Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyStatBox}>
                <Text style={[styles.historyStatNum, { color: FitnessColors.orange }]}>
                  {totalCaloriesLogged}
                </Text>
                <Text style={styles.historyStatLbl}>Burned</Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyStatBox}>
                <Text style={[styles.historyStatNum, { color: FitnessColors.purple }]}>
                  {totalHistoryVolumeKg > 999
                    ? `${(totalHistoryVolumeKg / 1000).toFixed(1)}k`
                    : totalHistoryVolumeKg}
                </Text>
                <Text style={styles.historyStatLbl}>Volume (kg)</Text>
              </View>
            </View>

            {/* Latest Logged Workout */}
            {workoutHistory.slice(0, 2).map((w) => (
              <TouchableOpacity
                key={w.id}
                style={styles.recentWorkoutItem}
                onPress={() => router.push('/history')}
                activeOpacity={0.7}>
                <View style={[styles.recentIcon, { backgroundColor: (w.color || FitnessColors.accent) + '22' }]}>
                  <Text style={styles.recentIconText}>{w.icon || '💪'}</Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{w.name}</Text>
                  <Text style={styles.recentMeta}>
                    {w.date} · {w.exercisesCount} exercises · {w.duration} min
                  </Text>
                </View>
                <View style={styles.recentRight}>
                  <Text style={[styles.recentCals, { color: w.color || FitnessColors.accent }]}>
                    {w.calories} kcal
                  </Text>
                  <Text style={styles.recentVolume}>
                    {w.totalVolumeKg.toLocaleString()} kg
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 4. Workout Section & Programs Widget (Links to Workout) */}
        <SectionHeader
          title="Workout Programs"
          action="All Programs →"
          onActionPress={() => router.push('/workout')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryWidgetCard, { borderColor: cat.color + '40', backgroundColor: cat.bg }]}
              onPress={() => router.push('/workout')}
              activeOpacity={0.8}>
              <Text style={styles.categoryWidgetIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryWidgetName, { color: cat.color }]}>{cat.name}</Text>
              <Text style={styles.categoryWidgetSub}>Start Session →</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 5. Precision Interval Timer Widget (Links to Timer) */}
        <SectionHeader
          title="Interval Timer"
          action="Open Timer →"
          onActionPress={() => router.push('/timer')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {builtInPresets.slice(0, 5).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.timerWidgetCard, { borderColor: t.color + '50' }]}
              onPress={() => router.push('/timer')}
              activeOpacity={0.8}>
              <View style={styles.timerTopRow}>
                <View style={[styles.timerDot, { backgroundColor: t.color }]} />
                <Text style={[styles.timerCategoryBadge, { color: t.color }]}>{t.category}</Text>
              </View>
              <Text style={styles.timerWidgetName}>{t.name}</Text>
              <Text style={styles.timerWidgetInterval}>
                {t.work}s work · {t.rest}s rest
              </Text>
              <View style={styles.timerRoundsStrip}>
                <Text style={[styles.timerRoundsText, { color: t.color }]}>
                  {t.rounds} rounds · {Math.max(1, Math.round(((t.work + t.rest) * t.rounds) / 60))}m
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 6. Exercise Library Widget (Links to Library) */}
        <SectionHeader
          title="Exercise Library"
          action={`Browse All (${comprehensiveExercises.length}) →`}
          onActionPress={() => router.push('/library')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {comprehensiveExercises.slice(0, 8).map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.exerciseWidgetCard}
              onPress={() => router.push('/library')}
              activeOpacity={0.8}>
              <View style={styles.exerciseWidgetEmojiBox}>
                <Text style={styles.exerciseWidgetEmoji}>{e.emoji}</Text>
              </View>
              <Text style={styles.exerciseWidgetName} numberOfLines={1}>
                {e.name}
              </Text>
              <View style={styles.exerciseWidgetBadge}>
                <Text style={styles.exerciseWidgetBadgeText}>{e.primaryMuscle}</Text>
              </View>
              <Text style={styles.exerciseWidgetProgram} numberOfLines={1}>
                {e.program}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 7. Personal Progression Widget */}
        <SectionHeader
          title="Personal Progress"
          action="Open Dashboard →"
          onActionPress={() => setShowPersonal(true)}
        />
        <TouchableOpacity
          style={styles.personalWidget}
          onPress={() => setShowPersonal(true)}
          activeOpacity={0.85}>
          {/* Top row: avatar + summary */}
          <View style={styles.personalTop}>
            <View style={styles.personalAvatar}>
              <Text style={styles.personalAvatarText}>AJ</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.personalName}>Alex Johnson</Text>
              <Text style={styles.personalSub}>
                {weightEntries.length > 0
                  ? `Current weight: ${weightEntries[weightEntries.length - 1].weight} kg`
                  : 'Tap to log your first weight entry'}
              </Text>
            </View>
            <View style={styles.personalEditBtn}>
              <Text style={styles.personalEditText}>View →</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.personalStatsRow}>
            <View style={styles.personalStat}>
              <Text style={[styles.personalStatVal, { color: FitnessColors.accent }]}>
                {weightEntries.length > 0
                  ? `${(weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight).toFixed(1)} kg`
                  : '—'}
              </Text>
              <Text style={styles.personalStatLbl}>Weight Δ</Text>
            </View>
            <View style={styles.personalStatDivider} />
            <View style={styles.personalStat}>
              <Text style={[styles.personalStatVal, { color: FitnessColors.blue }]}>
                {measurementsHistory.length > 0
                  ? `${measurementsHistory[measurementsHistory.length - 1].waist} cm`
                  : '—'}
              </Text>
              <Text style={styles.personalStatLbl}>Waist</Text>
            </View>
            <View style={styles.personalStatDivider} />
            <View style={styles.personalStat}>
              <Text style={[styles.personalStatVal, { color: FitnessColors.purple }]}>
                {progressPhotos.length}
              </Text>
              <Text style={styles.personalStatLbl}>Photos</Text>
            </View>
            <View style={styles.personalStatDivider} />
            <View style={styles.personalStat}>
              <Text style={[styles.personalStatVal, { color: FitnessColors.orange }]}>
                {(() => {
                  const ests = getOneRepMaxEstimates();
                  const bp = ests.find((e) => e.exerciseName.toLowerCase().includes('bench'));
                  return bp ? `${bp.estimated1RM} kg` : '—';
                })()}
              </Text>
              <Text style={styles.personalStatLbl}>Bench 1RM</Text>
            </View>
          </View>

          {/* Mini weight sparkline */}
          {weightEntries.length >= 2 && (
            <View style={styles.personalChartRow}>
              <Text style={styles.personalChartLabel}>Weight Trend</Text>
              <View style={styles.personalChartBars}>
                {weightEntries.slice(-7).map((entry, i, arr) => {
                  const wts = arr.map((e) => e.weight);
                  const minW = Math.min(...wts);
                  const maxW = Math.max(...wts);
                  const range = maxW - minW || 1;
                  const h = Math.max(8, ((entry.weight - minW) / range) * 36 + 8);
                  return (
                    <View key={entry.id} style={styles.personalChartBarWrap}>
                      <View
                        style={[
                          styles.personalChartBar,
                          { height: h, backgroundColor: i === arr.length - 1 ? FitnessColors.accent : FitnessColors.accentBg },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 1RM quick list */}
          <View style={styles.personal1RMRow}>
            {getOneRepMaxEstimates()
              .slice(0, 3)
              .map((est, i) => (
                <View key={i} style={styles.personal1RMItem}>
                  <Text style={styles.personal1RMEx} numberOfLines={1}>
                    {est.exerciseName.split(' ').slice(-1)[0]}
                  </Text>
                  <Text style={[styles.personal1RMVal, { color: FitnessColors.accent }]}>
                    {est.estimated1RM} kg
                  </Text>
                </View>
              ))}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Personal Progress Modal */}
      <PersonalProgressModal visible={showPersonal} onClose={() => setShowPersonal(false)} />
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
  greeting: { fontSize: 13, color: FitnessColors.textSecondary },
  userName: { fontSize: 22, fontWeight: '800', color: FitnessColors.text, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FitnessColors.accentBg,
    borderWidth: 2,
    borderColor: FitnessColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: FitnessColors.accent, fontWeight: '800', fontSize: 15 },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: FitnessColors.text },
  sectionAction: { fontSize: 12, color: FitnessColors.accent, fontWeight: '700' },

  /* 1. Daily Stats Row */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    marginBottom: Spacing.one,
  },
  statWidget: { alignItems: 'center', gap: 3, flex: 1 },
  statEmoji: { fontSize: 16 },
  statValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  statUnit: { fontSize: 10, color: FitnessColors.textSecondary, fontWeight: '600' },

  /* 2. Active Workout Widget */
  activeWorkoutWidget: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: FitnessColors.accent + '80',
    gap: 8,
    marginBottom: Spacing.one,
  },
  activeWorkoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeWorkoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '50',
  },
  activeWorkoutBadgeDot: { color: FitnessColors.accent, fontSize: 10 },
  activeWorkoutBadgeText: { color: FitnessColors.accent, fontSize: 10, fontWeight: '800' },
  activeWorkoutCategory: { fontSize: 12, color: FitnessColors.textSecondary, fontWeight: '600' },
  activeWorkoutTitle: { fontSize: 18, fontWeight: '800', color: FitnessColors.text },
  progressBarBg: {
    height: 6,
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: 3,
    marginVertical: 2,
    overflow: 'hidden',
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  activeWorkoutStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  activeStatCol: { alignItems: 'flex-start' },
  activeStatVal: { fontSize: 14, fontWeight: '800', color: FitnessColors.text },
  activeStatLbl: { fontSize: 10, color: FitnessColors.textMuted, marginTop: 1 },
  activeActionBtn: {
    backgroundColor: FitnessColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  activeActionBtnText: { color: '#000000', fontSize: 12, fontWeight: '800' },

  /* 3. History Widget */
  historySummaryWidget: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 10,
    marginBottom: Spacing.one,
  },
  historyStatsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: FitnessColors.border,
  },
  historyStatBox: { flex: 1, alignItems: 'center' },
  historyStatNum: { fontSize: 16, fontWeight: '800' },
  historyStatLbl: { fontSize: 10, color: FitnessColors.textMuted, marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
  historyDivider: { width: 1, height: 24, backgroundColor: FitnessColors.border },
  recentWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 10,
  },
  recentIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentIconText: { fontSize: 18 },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 14, fontWeight: '700', color: FitnessColors.text },
  recentMeta: { fontSize: 11, color: FitnessColors.textSecondary, marginTop: 2 },
  recentRight: { alignItems: 'flex-end' },
  recentCals: { fontSize: 13, fontWeight: '700' },
  recentVolume: { fontSize: 10, color: FitnessColors.textMuted, marginTop: 2 },
  historyEmptyCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.one,
  },
  historyEmptyEmoji: { fontSize: 32, marginBottom: 4 },
  historyEmptyTitle: { fontSize: 14, fontWeight: '700', color: FitnessColors.text },
  historyEmptySub: { fontSize: 12, color: FitnessColors.accent, marginTop: 4, fontWeight: '600' },

  /* 4. Workout Categories Widget */
  horizontalScroll: { marginBottom: Spacing.two },
  categoryWidgetCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginRight: Spacing.two,
    width: 130,
    borderWidth: 1,
    gap: 4,
  },
  categoryWidgetIcon: { fontSize: 26 },
  categoryWidgetName: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  categoryWidgetSub: { fontSize: 11, color: FitnessColors.textSecondary, marginTop: 2 },

  /* 5. Timer Widget Cards */
  timerWidgetCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginRight: Spacing.two,
    width: 150,
    borderWidth: 1,
    gap: 4,
  },
  timerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerDot: { width: 8, height: 8, borderRadius: 4 },
  timerCategoryBadge: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  timerWidgetName: { fontSize: 14, fontWeight: '700', color: FitnessColors.text, marginTop: 2 },
  timerWidgetInterval: { fontSize: 11, color: FitnessColors.textSecondary },
  timerRoundsStrip: { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: FitnessColors.border },
  timerRoundsText: { fontSize: 11, fontWeight: '700' },

  /* 6. Exercise Library Widget Cards */
  exerciseWidgetCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginRight: Spacing.two,
    width: 130,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 5,
  },
  exerciseWidgetEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseWidgetEmoji: { fontSize: 22 },
  exerciseWidgetName: { fontSize: 13, fontWeight: '700', color: FitnessColors.text, textAlign: 'center' },
  exerciseWidgetBadge: {
    backgroundColor: FitnessColors.accentBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  exerciseWidgetBadgeText: { fontSize: 10, fontWeight: '800', color: FitnessColors.accent },
  exerciseWidgetProgram: { fontSize: 10, color: FitnessColors.textMuted },

  /* 7. Personal Progression Widget */
  personalWidget: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: FitnessColors.purple + '60',
    gap: 12,
    marginBottom: Spacing.three,
  },
  personalTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FitnessColors.purple + '22',
    borderWidth: 2,
    borderColor: FitnessColors.purple + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalAvatarText: { color: FitnessColors.purple, fontWeight: '800', fontSize: 16 },
  personalName: { fontSize: 16, fontWeight: '800', color: FitnessColors.text },
  personalSub: { fontSize: 11, color: FitnessColors.textSecondary, marginTop: 2 },
  personalEditBtn: {
    backgroundColor: FitnessColors.purple + '22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FitnessColors.purple + '50',
  },
  personalEditText: { color: FitnessColors.purple, fontSize: 12, fontWeight: '800' },
  personalStatsRow: {
    flexDirection: 'row',
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
  },
  personalStat: { flex: 1, alignItems: 'center' },
  personalStatVal: { fontSize: 14, fontWeight: '800' },
  personalStatLbl: {
    fontSize: 9,
    color: FitnessColors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  personalStatDivider: { width: 1, backgroundColor: FitnessColors.border },
  personalChartRow: { gap: 6 },
  personalChartLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
    textTransform: 'uppercase',
  },
  personalChartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 48,
    gap: 4,
  },
  personalChartBarWrap: { flex: 1, justifyContent: 'flex-end' },
  personalChartBar: { borderRadius: 3 },
  personal1RMRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: FitnessColors.border,
  },
  personal1RMItem: {
    flex: 1,
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  personal1RMEx: {
    fontSize: 10,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
    textTransform: 'uppercase',
  },
  personal1RMVal: { fontSize: 13, fontWeight: '800' },
});
