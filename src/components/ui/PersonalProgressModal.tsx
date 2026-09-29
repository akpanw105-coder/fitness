import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, FitnessColors, Spacing } from '@/constants/theme';
import {
  BodyMeasurementEntry,
  useWorkout,
} from '@/context/WorkoutContext';

// ─── Tiny inline sparkline chart ───────────────────────────────────────────────
function MiniLineChart({
  data,
  color,
  width = 260,
  height = 70,
  showDots = true,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  showDots?: boolean;
}) {
  if (data.length < 2) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: FitnessColors.textMuted, fontSize: 11 }}>Not enough data</Text>
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 12) - 6;
    return { x, y, v };
  });

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {pts.slice(1).map((pt, i) => {
        const prev = pts[i];
        const dx = pt.x - prev.x;
        const dy = pt.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: prev.x,
              top: prev.y,
              width: len,
              height: 2,
              backgroundColor: color,
              opacity: 0.8,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
      {showDots &&
        pts.map((pt, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: pt.x - 4,
              top: pt.y - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
              borderWidth: 2,
              borderColor: FitnessColors.backgroundCard,
            }}
          />
        ))}
      <Text
        style={{
          position: 'absolute',
          left: pts[0].x,
          top: pts[0].y - 16,
          fontSize: 10,
          fontWeight: '700',
          color,
        }}>
        {data[0]}
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: pts[pts.length - 1].x - 24,
          top: pts[pts.length - 1].y - 16,
          fontSize: 10,
          fontWeight: '700',
          color,
        }}>
        {data[data.length - 1]}
      </Text>
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LogWeightSheet({ onClose }: { onClose: () => void }) {
  const { logWeight, weightEntries } = useWorkout();
  const lastWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 75;
  const [value, setValue] = useState(String(lastWeight));

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0 || parsed > 500) {
      Alert.alert('Invalid', 'Enter a valid weight between 1–500 kg');
      return;
    }
    logWeight(parsed);
    onClose();
  };

  return (
    <View style={styles.sheet}>
      <Text style={styles.sheetTitle}>📊 Log Weight</Text>
      <Text style={styles.sheetSub}>Enter your current body weight</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.bigInput}
          value={value}
          onChangeText={setValue}
          keyboardType="decimal-pad"
          selectionColor={FitnessColors.accent}
          placeholderTextColor={FitnessColors.textMuted}
        />
        <Text style={styles.bigInputUnit}>kg</Text>
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>Save Entry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
        <Text style={styles.cancelLinkText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

function LogMeasurementsSheet({ onClose }: { onClose: () => void }) {
  const { logMeasurements, measurementsHistory } = useWorkout();
  const last = measurementsHistory.length > 0 ? measurementsHistory[measurementsHistory.length - 1] : null;

  const [chest, setChest] = useState(String(last?.chest ?? ''));
  const [waist, setWaist] = useState(String(last?.waist ?? ''));
  const [hips, setHips] = useState(String(last?.hips ?? ''));
  const [bicep, setBicep] = useState(String(last?.bicep ?? ''));
  const [thigh, setThigh] = useState(String(last?.thigh ?? ''));

  const handleSave = () => {
    const c = parseFloat(chest);
    const w = parseFloat(waist);
    const h = parseFloat(hips);
    const b = parseFloat(bicep);
    const t = parseFloat(thigh);
    if ([c, w, h, b, t].some(isNaN)) {
      Alert.alert('Invalid', 'Fill in all fields');
      return;
    }
    logMeasurements({ chest: c, waist: w, hips: h, bicep: b, thigh: t });
    onClose();
  };

  const Field = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <View style={styles.measureField}>
      <Text style={styles.measureLabel}>{label}</Text>
      <View style={styles.measureInputRow}>
        <TextInput
          style={styles.measureInput}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={FitnessColors.textMuted}
          selectionColor={FitnessColors.accent}
        />
        <Text style={styles.measureUnit}>cm</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.sheet}>
      <Text style={styles.sheetTitle}>📏 Body Measurements</Text>
      <Text style={styles.sheetSub}>Enter measurements in centimetres</Text>
      <View style={styles.measureGrid}>
        <Field label="Chest" value={chest} onChange={setChest} />
        <Field label="Waist" value={waist} onChange={setWaist} />
        <Field label="Hips" value={hips} onChange={setHips} />
        <Field label="Bicep" value={bicep} onChange={setBicep} />
        <Field label="Thigh" value={thigh} onChange={setThigh} />
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>Save Measurements</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
        <Text style={styles.cancelLinkText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddPhotoSheet({ onClose }: { onClose: () => void }) {
  const { addProgressPhoto } = useWorkout();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Missing URL', 'Please enter an image URL');
      return;
    }
    addProgressPhoto(trimmed, caption || 'Progress photo');
    onClose();
  };

  return (
    <View style={styles.sheet}>
      <Text style={styles.sheetTitle}>📸 Add Progress Photo</Text>
      <Text style={styles.sheetSub}>Paste a publicly accessible image URL</Text>
      <TextInput
        style={styles.urlInput}
        value={url}
        onChangeText={setUrl}
        placeholder="https://..."
        placeholderTextColor={FitnessColors.textMuted}
        selectionColor={FitnessColors.accent}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={[styles.urlInput, { marginTop: 6 }]}
        value={caption}
        onChangeText={setCaption}
        placeholder="Caption (optional)"
        placeholderTextColor={FitnessColors.textMuted}
        selectionColor={FitnessColors.accent}
      />
      {url.trim().length > 10 && (
        <Image
          source={{ uri: url.trim() }}
          style={styles.photoPreview}
          resizeMode="cover"
        />
      )}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>Add Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
        <Text style={styles.cancelLinkText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

function WeightTab() {
  const { weightEntries } = useWorkout();
  const [showLog, setShowLog] = useState(false);

  const weights = weightEntries.map((e) => e.weight);
  const first = weightEntries[0]?.weight ?? 0;
  const last = weightEntries[weightEntries.length - 1]?.weight ?? 0;
  const delta = last - first;
  const lowest = weights.length ? Math.min(...weights) : 0;
  const highest = weights.length ? Math.max(...weights) : 0;

  if (showLog) return <LogWeightSheet onClose={() => setShowLog(false)} />;

  return (
    <View style={styles.tabContent}>
      <View style={styles.statsStrip}>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: FitnessColors.accent }]}>{last} kg</Text>
          <Text style={styles.statLbl}>Current</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text
            style={[
              styles.statNum,
              { color: delta < 0 ? FitnessColors.green : delta > 0 ? FitnessColors.orange : FitnessColors.text },
            ]}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
          </Text>
          <Text style={styles.statLbl}>Change</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: FitnessColors.blue }]}>{lowest} kg</Text>
          <Text style={styles.statLbl}>Lowest</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: FitnessColors.purple }]}>{highest} kg</Text>
          <Text style={styles.statLbl}>Highest</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weight Over Time (kg)</Text>
        <MiniLineChart data={weights} color={FitnessColors.accent} width={280} height={80} />
        <View style={styles.chartXLabels}>
          {weightEntries.map((e, i) => (
            <Text key={i} style={styles.chartXLabel}>{e.date.split(',')[0]}</Text>
          ))}
        </View>
      </View>

      <Text style={styles.listTitle}>Log History</Text>
      {[...weightEntries].reverse().map((entry, i, arr) => {
        const nextEntry = arr[i + 1];
        const diff = nextEntry ? entry.weight - nextEntry.weight : 0;
        return (
          <View key={entry.id} style={styles.historyRow}>
            <Text style={styles.historyDate}>{entry.date}</Text>
            <Text style={styles.historyVal}>{entry.weight} kg</Text>
            {diff !== 0 && (
              <Text
                style={[
                  styles.historyDiff,
                  { color: diff < 0 ? FitnessColors.green : FitnessColors.orange },
                ]}>
                {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}
              </Text>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.logBtn} onPress={() => setShowLog(true)} activeOpacity={0.8}>
        <Text style={styles.logBtnText}>+ Log Today's Weight</Text>
      </TouchableOpacity>
    </View>
  );
}

function MeasurementsTab() {
  const { measurementsHistory } = useWorkout();
  const [showLog, setShowLog] = useState(false);

  if (showLog) return <LogMeasurementsSheet onClose={() => setShowLog(false)} />;

  const latest = measurementsHistory[measurementsHistory.length - 1];
  const prev = measurementsHistory[measurementsHistory.length - 2];

  const fields: { key: keyof BodyMeasurementEntry; label: string; color: string; emoji: string }[] = [
    { key: 'chest', label: 'Chest', color: FitnessColors.accent, emoji: '💪' },
    { key: 'waist', label: 'Waist', color: FitnessColors.blue, emoji: '📏' },
    { key: 'hips', label: 'Hips', color: FitnessColors.purple, emoji: '🍑' },
    { key: 'bicep', label: 'Bicep', color: FitnessColors.orange, emoji: '🦾' },
    { key: 'thigh', label: 'Thigh', color: FitnessColors.green, emoji: '🦵' },
  ];

  return (
    <View style={styles.tabContent}>
      {latest ? (
        <>
          <Text style={styles.listTitle}>Latest: {latest.date}</Text>
          {fields.map((f) => {
            const val = latest[f.key] as number;
            const prevVal = prev ? (prev[f.key] as number) : null;
            const diff = prevVal != null ? val - prevVal : null;
            const chartData = measurementsHistory.map((m) => m[f.key] as number);

            return (
              <View key={String(f.key)} style={[styles.measureCard, { borderColor: f.color + '40' }]}>
                <View style={styles.measureCardTop}>
                  <Text style={styles.measureCardEmoji}>{f.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.measureCardLabel}>{f.label}</Text>
                    <Text style={[styles.measureCardValue, { color: f.color }]}>
                      {val} cm
                      {diff != null && (
                        <Text
                          style={{
                            fontSize: 12,
                            color:
                              diff < 0
                                ? FitnessColors.green
                                : diff > 0
                                ? FitnessColors.orange
                                : FitnessColors.textMuted,
                          }}>
                          {'  '}
                          {diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(diff).toFixed(1)} cm
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
                {chartData.length >= 2 && (
                  <MiniLineChart data={chartData} color={f.color} width={240} height={44} showDots={false} />
                )}
              </View>
            );
          })}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📏</Text>
          <Text style={styles.emptyTitle}>No Measurements Yet</Text>
          <Text style={styles.emptySub}>Log your first body measurements to track progress</Text>
        </View>
      )}
      <TouchableOpacity style={styles.logBtn} onPress={() => setShowLog(true)} activeOpacity={0.8}>
        <Text style={styles.logBtnText}>+ Log Measurements</Text>
      </TouchableOpacity>
    </View>
  );
}

function OneRMTab() {
  const { getOneRepMaxEstimates } = useWorkout();
  const estimates = getOneRepMaxEstimates();

  const getLevelLabel = (rm: number, exercise: string) => {
    const name = exercise.toLowerCase();
    if (name.includes('deadlift')) {
      if (rm > 200) return { label: 'Elite 🏆', color: FitnessColors.accent };
      if (rm > 140) return { label: 'Advanced', color: FitnessColors.purple };
      if (rm > 100) return { label: 'Intermediate', color: FitnessColors.blue };
      return { label: 'Beginner', color: FitnessColors.orange };
    }
    if (name.includes('squat')) {
      if (rm > 160) return { label: 'Elite 🏆', color: FitnessColors.accent };
      if (rm > 120) return { label: 'Advanced', color: FitnessColors.purple };
      if (rm > 80) return { label: 'Intermediate', color: FitnessColors.blue };
      return { label: 'Beginner', color: FitnessColors.orange };
    }
    if (rm > 120) return { label: 'Elite 🏆', color: FitnessColors.accent };
    if (rm > 90) return { label: 'Advanced', color: FitnessColors.purple };
    if (rm > 60) return { label: 'Intermediate', color: FitnessColors.blue };
    return { label: 'Beginner', color: FitnessColors.orange };
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          ⚡ 1RM estimates use the{' '}
          <Text style={{ color: FitnessColors.accent, fontWeight: '700' }}>Brzycki formula</Text>
          {' '}calculated from your best sets in the workout tracker. Log more heavy sets for better accuracy.
        </Text>
      </View>
      {estimates.map((est, i) => {
        const level = getLevelLabel(est.estimated1RM, est.exerciseName);
        const pct = Math.min(100, Math.max(5, (est.estimated1RM / 250) * 100));
        return (
          <View key={i} style={styles.rmCard}>
            <View style={styles.rmCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rmExName}>{est.exerciseName}</Text>
                <Text style={styles.rmBestSet}>
                  Best set: {est.bestSet.weight} kg × {est.bestSet.reps} reps · {est.formula}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.rmValue, { color: FitnessColors.accent }]}>
                  {est.estimated1RM} kg
                </Text>
                <View
                  style={[
                    styles.rmLevelBadge,
                    { backgroundColor: level.color + '22', borderColor: level.color + '50' },
                  ]}>
                  <Text style={[styles.rmLevelText, { color: level.color }]}>{level.label}</Text>
                </View>
              </View>
            </View>
            <View style={styles.rmBar}>
              <View style={[styles.rmBarFill, { width: `${pct}%`, backgroundColor: level.color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PhotosTab() {
  const { progressPhotos, deleteProgressPhoto } = useWorkout();
  const [showAdd, setShowAdd] = useState(false);

  if (showAdd) return <AddPhotoSheet onClose={() => setShowAdd(false)} />;

  return (
    <View style={styles.tabContent}>
      {progressPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📸</Text>
          <Text style={styles.emptyTitle}>No Progress Photos Yet</Text>
          <Text style={styles.emptySub}>Document your transformation journey with before & after photos</Text>
        </View>
      ) : (
        <View style={styles.photoGrid}>
          {progressPhotos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} resizeMode="cover" />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoDate}>{photo.date}</Text>
                {photo.weight != null && (
                  <Text style={[styles.photoWeight, { color: FitnessColors.accent }]}>
                    {photo.weight} kg
                  </Text>
                )}
              </View>
              <Text style={styles.photoCaption} numberOfLines={1}>
                {photo.caption}
              </Text>
              <TouchableOpacity
                style={styles.photoDeleteBtn}
                onPress={() => {
                  Alert.alert('Delete Photo', 'Remove this progress photo?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteProgressPhoto(photo.id),
                    },
                  ]);
                }}>
                <Text style={styles.photoDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.logBtn} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
        <Text style={styles.logBtnText}>+ Add Progress Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function PersonalProgressModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'weight' | 'measurements' | '1rm' | 'photos'>('weight');
  const { weightEntries, measurementsHistory, progressPhotos } = useWorkout();

  const latestWeight =
    weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;
  const latestMeasurements =
    measurementsHistory.length > 0
      ? measurementsHistory[measurementsHistory.length - 1]
      : null;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>👤 Personal Progress</Text>
              <Text style={styles.modalSub}>Track your body & strength journey</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick snapshot strip */}
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotVal}>
                {latestWeight != null ? `${latestWeight} kg` : '—'}
              </Text>
              <Text style={styles.snapshotLbl}>Weight</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotVal}>
                {latestMeasurements ? `${latestMeasurements.waist} cm` : '—'}
              </Text>
              <Text style={styles.snapshotLbl}>Waist</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotVal}>{progressPhotos.length}</Text>
              <Text style={styles.snapshotLbl}>Photos</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotVal}>{weightEntries.length}</Text>
              <Text style={styles.snapshotLbl}>Entries</Text>
            </View>
          </View>

          {/* Tab buttons */}
          <View style={styles.tabsRow}>
            <TabButton
              label="Weight"
              icon="⚖️"
              active={tab === 'weight'}
              onPress={() => setTab('weight')}
            />
            <TabButton
              label="Measures"
              icon="📏"
              active={tab === 'measurements'}
              onPress={() => setTab('measurements')}
            />
            <TabButton
              label="1RM"
              icon="⚡"
              active={tab === '1rm'}
              onPress={() => setTab('1rm')}
            />
            <TabButton
              label="Photos"
              icon="📸"
              active={tab === 'photos'}
              onPress={() => setTab('photos')}
            />
          </View>

          <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
            {tab === 'weight' && <WeightTab />}
            {tab === 'measurements' && <MeasurementsTab />}
            {tab === '1rm' && <OneRMTab />}
            {tab === 'photos' && <PhotosTab />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: FitnessColors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderColor: FitnessColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: FitnessColors.text },
  modalSub: { fontSize: 12, color: FitnessColors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FitnessColors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: FitnessColors.textSecondary, fontSize: 14, fontWeight: '700' },

  snapshotRow: {
    flexDirection: 'row',
    backgroundColor: FitnessColors.backgroundCard,
    marginHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '40',
    marginBottom: Spacing.two,
  },
  snapshotItem: { flex: 1, alignItems: 'center' },
  snapshotVal: { fontSize: 16, fontWeight: '800', color: FitnessColors.accent },
  snapshotLbl: {
    fontSize: 9,
    color: FitnessColors.textMuted,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  snapshotDivider: { width: 1, backgroundColor: FitnessColors.border },

  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.two,
    gap: 6,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: FitnessColors.backgroundElement,
    gap: 2,
  },
  tabBtnActive: {
    backgroundColor: FitnessColors.accentBg,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '60',
  },
  tabIcon: { fontSize: 16 },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: FitnessColors.textMuted,
    textTransform: 'uppercase',
  },
  tabLabelActive: { color: FitnessColors.accent },

  tabScroll: { paddingHorizontal: Spacing.three },
  tabContent: { paddingBottom: 40, gap: 12 },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 15, fontWeight: '800' },
  statLbl: {
    fontSize: 9,
    color: FitnessColors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: FitnessColors.border },

  chartCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: FitnessColors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  chartXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartXLabel: { fontSize: 9, color: FitnessColors.textMuted },

  listTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: FitnessColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  historyDate: { flex: 1, fontSize: 13, color: FitnessColors.textSecondary, fontWeight: '600' },
  historyVal: {
    fontSize: 14,
    fontWeight: '700',
    color: FitnessColors.text,
    marginRight: 10,
  },
  historyDiff: { fontSize: 12, fontWeight: '700' },

  logBtn: {
    backgroundColor: FitnessColors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  logBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },

  sheet: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: FitnessColors.text },
  sheetSub: { fontSize: 12, color: FitnessColors.textSecondary, marginTop: -8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  bigInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: FitnessColors.text,
    paddingVertical: 14,
    textAlign: 'center',
  },
  bigInputUnit: { fontSize: 18, fontWeight: '700', color: FitnessColors.textSecondary },
  saveBtn: {
    backgroundColor: FitnessColors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  cancelLink: { alignItems: 'center', paddingVertical: 4 },
  cancelLinkText: { fontSize: 13, color: FitnessColors.textMuted },

  measureGrid: { gap: 8 },
  measureField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    justifyContent: 'space-between',
  },
  measureLabel: { fontSize: 13, fontWeight: '700', color: FitnessColors.text, flex: 1 },
  measureInputRow: { flexDirection: 'row', alignItems: 'center' },
  measureInput: {
    fontSize: 18,
    fontWeight: '800',
    color: FitnessColors.text,
    width: 70,
    textAlign: 'right',
    paddingVertical: 10,
  },
  measureUnit: { fontSize: 12, color: FitnessColors.textMuted, marginLeft: 4 },

  measureCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.two,
    borderWidth: 1,
    gap: 8,
    overflow: 'hidden',
  },
  measureCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  measureCardEmoji: { fontSize: 24 },
  measureCardLabel: {
    fontSize: 12,
    color: FitnessColors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  measureCardValue: { fontSize: 18, fontWeight: '800' },

  infoBox: {
    backgroundColor: FitnessColors.accentBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: FitnessColors.accent + '30',
  },
  infoBoxText: { fontSize: 12, color: FitnessColors.textSecondary, lineHeight: 18 },

  rmCard: {
    backgroundColor: FitnessColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    gap: 8,
  },
  rmCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  rmExName: { fontSize: 15, fontWeight: '800', color: FitnessColors.text },
  rmBestSet: { fontSize: 11, color: FitnessColors.textSecondary, marginTop: 2 },
  rmValue: { fontSize: 22, fontWeight: '800', textAlign: 'right' },
  rmLevelBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  rmLevelText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  rmBar: {
    height: 4,
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: 2,
    overflow: 'hidden',
  },
  rmBarFill: { height: 4, borderRadius: 2 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCard: {
    width: '47%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: FitnessColors.backgroundCard,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  photoImage: { width: '100%', height: 160 },
  photoOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: FitnessColors.backgroundElement,
  },
  photoDate: { fontSize: 10, color: FitnessColors.textSecondary, fontWeight: '600' },
  photoWeight: { fontSize: 11, fontWeight: '800' },
  photoCaption: {
    fontSize: 11,
    color: FitnessColors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontWeight: '500',
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  urlInput: {
    backgroundColor: FitnessColors.backgroundElement,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: FitnessColors.text,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: FitnessColors.text },
  emptySub: { fontSize: 12, color: FitnessColors.textSecondary, textAlign: 'center' },
});
