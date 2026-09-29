import React, { createContext, useContext, useState, ReactNode } from 'react';
import { exercises, recentWorkouts as initialRecentWorkouts } from '@/constants/mockData';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: string; // string for responsive text input
  reps: string;
  completed?: boolean;
}

export interface WorkoutExercise {
  id: string; // unique entry id in this workout
  exerciseId: string;
  name: string;
  muscle: string;
  equipment: string;
  emoji: string;
  sets: WorkoutSet[];
  isCompleted: boolean;
}

export interface ActiveWorkout {
  name: string;
  category: string;
  startTime: number;
  exercises: WorkoutExercise[];
}

export interface FinishedWorkout {
  id: string;
  name: string;
  date: string;
  timestamp: number;
  duration: number; // in minutes
  calories: number;
  category: string;
  icon: string;
  color: string;
  exercisesCount: number;
  totalVolumeKg: number;
  exercises?: {
    name: string;
    emoji: string;
    setsCount: number;
    bestWeight: number;
    totalReps: number;
  }[];
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface BodyMeasurementEntry {
  id: string;
  date: string;
  chest: number;
  waist: number;
  hips: number;
  bicep: number;
  thigh: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  uri: string;
  caption: string;
  weight?: number;
}

export interface OneRepMaxEstimate {
  exerciseName: string;
  estimated1RM: number;
  formula: string; // 'Brzycki' | 'Epley'
  bestSet: { weight: number; reps: number };
}

interface WorkoutContextType {
  activeWorkout: ActiveWorkout;
  workoutHistory: FinishedWorkout[];
  // Personal progression state
  weightEntries: WeightEntry[];
  measurementsHistory: BodyMeasurementEntry[];
  progressPhotos: ProgressPhoto[];
  // Tracker actions
  setWorkoutName: (name: string) => void;
  addExerciseToWorkout: (exercise: typeof exercises[0]) => void;
  removeExerciseFromWorkout: (exerciseEntryId: string) => void;
  toggleExerciseCompleted: (exerciseEntryId: string) => void;
  addSetToExercise: (exerciseEntryId: string) => void;
  removeSetFromExercise: (exerciseEntryId: string, setId: string) => void;
  updateSet: (exerciseEntryId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
  startPredefinedWorkout: (workoutName: string, category: string, suggestedExercises?: string[]) => void;
  finishWorkout: () => FinishedWorkout | null;
  resetActiveWorkout: () => void;
  deleteWorkoutFromHistory: (id: string) => void;
  clearWorkoutHistory: () => void;
  // Personal progression actions
  logWeight: (weight: number, date?: string) => void;
  logMeasurements: (measurements: Omit<BodyMeasurementEntry, 'id' | 'date'>, date?: string) => void;
  addProgressPhoto: (uri: string, caption: string, weight?: number) => void;
  deleteProgressPhoto: (id: string) => void;
  getOneRepMaxEstimates: () => OneRepMaxEstimate[];
}

// Initial active workout template (Bench Press with realistic initial sets)
const benchPressEx = exercises.find((e) => e.name === 'Bench Press') || exercises[0];
const initialWorkout: ActiveWorkout = {
  name: 'Upper Body Workout',
  category: 'Strength',
  startTime: Date.now() - 25 * 60 * 1000, // 25 mins ago for realism
  exercises: [
    {
      id: 'we-1',
      exerciseId: benchPressEx.id,
      name: benchPressEx.name,
      muscle: benchPressEx.muscle,
      equipment: benchPressEx.equipment,
      emoji: benchPressEx.emoji,
      isCompleted: false,
      sets: [
        { id: 's-1', setNumber: 1, weight: '60', reps: '10' },
        { id: 's-2', setNumber: 2, weight: '60', reps: '8' },
        { id: 's-3', setNumber: 3, weight: '65', reps: '6' },
      ],
    },
  ],
};

const initialHistoryList: FinishedWorkout[] = [];

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout>(initialWorkout);
  const [workoutHistory, setWorkoutHistory] = useState<FinishedWorkout[]>(initialHistoryList);

  // Personal progression state
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([
    { id: 'w-1', date: 'Sep 1', weight: 80.2 },
    { id: 'w-2', date: 'Sep 7', weight: 79.8 },
    { id: 'w-3', date: 'Sep 14', weight: 79.1 },
    { id: 'w-4', date: 'Sep 21', weight: 78.8 },
    { id: 'w-5', date: 'Sep 28', weight: 78.4 },
  ]);

  const [measurementsHistory, setMeasurementsHistory] = useState<BodyMeasurementEntry[]>([
    { id: 'm-1', date: 'Sep 1', chest: 101, waist: 84.5, hips: 98, bicep: 34, thigh: 59 },
    { id: 'm-2', date: 'Sep 15', chest: 99.5, waist: 83, hips: 97, bicep: 34.5, thigh: 58.5 },
    { id: 'm-3', date: 'Sep 28', chest: 98, waist: 82, hips: 96, bicep: 35, thigh: 58 },
  ]);

  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([
    {
      id: 'p-1',
      date: 'Sep 1',
      uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      caption: 'Day 1 Baseline - 80.2kg',
      weight: 80.2,
    },
    {
      id: 'p-2',
      date: 'Sep 28',
      uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      caption: '4-Week Check-in: Leaner waist & chest definition',
      weight: 78.4,
    },
  ]);

  const logWeight = (weight: number, date?: string) => {
    const entryDate = date || 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newEntry: WeightEntry = {
      id: `w-${Date.now()}`,
      date: entryDate,
      weight,
    };
    setWeightEntries((prev) => [...prev, newEntry]);
  };

  const logMeasurements = (
    measurements: Omit<BodyMeasurementEntry, 'id' | 'date'>,
    date?: string
  ) => {
    const entryDate = date || 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newEntry: BodyMeasurementEntry = {
      id: `m-${Date.now()}`,
      date: entryDate,
      ...measurements,
    };
    setMeasurementsHistory((prev) => [...prev, newEntry]);
  };

  const addProgressPhoto = (uri: string, caption: string, weight?: number) => {
    const entryDate = 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newPhoto: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      date: entryDate,
      uri,
      caption: caption || 'Progress photo',
      weight,
    };
    setProgressPhotos((prev) => [newPhoto, ...prev]);
  };

  const deleteProgressPhoto = (id: string) => {
    setProgressPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Advanced Analytics: Calculate 1RM (Brzycki & Epley formulas) from all logged & active workout sets
  const getOneRepMaxEstimates = (): OneRepMaxEstimate[] => {
    const map = new Map<string, { maxEstimate: number; formula: string; bestWeight: number; bestReps: number }>();

    // Scan active workout
    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseFloat(s.reps) || 0;
        if (w > 0 && r > 0) {
          // Brzycki formula: 1RM = Weight × (36 / (37 - Reps))
          const brzycki = r === 1 ? w : Math.round(w * (36 / Math.max(37 - r, 1)));
          const current = map.get(ex.name);
          if (!current || brzycki > current.maxEstimate) {
            map.set(ex.name, {
              maxEstimate: brzycki,
              formula: 'Brzycki',
              bestWeight: w,
              bestReps: r,
            });
          }
        }
      });
    });

    // Scan workout history
    workoutHistory.forEach((wh) => {
      wh.exercises?.forEach((ex) => {
        if (ex.bestWeight > 0 && ex.totalReps > 0) {
          const estimatedReps = Math.max(1, Math.round(ex.totalReps / Math.max(ex.setsCount, 1)));
          const est1RM = Math.round(ex.bestWeight * (36 / Math.max(37 - estimatedReps, 1)));
          const current = map.get(ex.name);
          if (!current || est1RM > current.maxEstimate) {
            map.set(ex.name, {
              maxEstimate: est1RM,
              formula: 'Brzycki',
              bestWeight: ex.bestWeight,
              bestReps: estimatedReps,
            });
          }
        }
      });
    });

    // Baseline fallbacks if tracker is fresh
    if (!map.has('Bench Press')) {
      map.set('Bench Press', { maxEstimate: 85, formula: 'Brzycki', bestWeight: 65, bestReps: 6 });
    }
    if (!map.has('Barbell Squat') && !map.has('Squat')) {
      map.set('Barbell Squat', { maxEstimate: 110, formula: 'Brzycki', bestWeight: 90, bestReps: 6 });
    }
    if (!map.has('Deadlift')) {
      map.set('Deadlift', { maxEstimate: 140, formula: 'Brzycki', bestWeight: 120, bestReps: 5 });
    }
    if (!map.has('Overhead Press')) {
      map.set('Overhead Press', { maxEstimate: 60, formula: 'Brzycki', bestWeight: 50, bestReps: 6 });
    }

    const results: OneRepMaxEstimate[] = [];
    map.forEach((value, key) => {
      results.push({
        exerciseName: key,
        estimated1RM: value.maxEstimate,
        formula: value.formula,
        bestSet: { weight: value.bestWeight, reps: value.bestReps },
      });
    });

    return results;
  };

  const setWorkoutName = (name: string) => {
    setActiveWorkout((prev) => ({ ...prev, name }));
  };

  const addExerciseToWorkout = (exercise: typeof exercises[0]) => {
    setActiveWorkout((prev) => {
      // Check if already in workout or add as new entry
      const newEntryId = `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newExercise: WorkoutExercise = {
        id: newEntryId,
        exerciseId: exercise.id,
        name: exercise.name,
        muscle: exercise.muscle,
        equipment: exercise.equipment,
        emoji: exercise.emoji,
        isCompleted: false,
        sets: [
          { id: `s-${Date.now()}-1`, setNumber: 1, weight: '50', reps: '10' },
          { id: `s-${Date.now()}-2`, setNumber: 2, weight: '50', reps: '10' },
          { id: `s-${Date.now()}-3`, setNumber: 3, weight: '55', reps: '8' },
        ],
      };
      return {
        ...prev,
        exercises: [...prev.exercises, newExercise],
      };
    });
  };

  const removeExerciseFromWorkout = (exerciseEntryId: string) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== exerciseEntryId),
    }));
  };

  const toggleExerciseCompleted = (exerciseEntryId: string) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) =>
        e.id === exerciseEntryId ? { ...e, isCompleted: !e.isCompleted } : e
      ),
    }));
  };

  const addSetToExercise = (exerciseEntryId: string) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => {
        if (e.id !== exerciseEntryId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        const newSetNum = e.sets.length + 1;
        const newSet: WorkoutSet = {
          id: `s-${Date.now()}-${newSetNum}`,
          setNumber: newSetNum,
          weight: lastSet ? lastSet.weight : '50',
          reps: lastSet ? lastSet.reps : '10',
        };
        return {
          ...e,
          sets: [...e.sets, newSet],
        };
      }),
    }));
  };

  const removeSetFromExercise = (exerciseEntryId: string, setId: string) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => {
        if (e.id !== exerciseEntryId) return e;
        if (e.sets.length <= 1) return e; // keep at least 1 set
        const updated = e.sets
          .filter((s) => s.id !== setId)
          .map((s, index) => ({ ...s, setNumber: index + 1 }));
        return {
          ...e,
          sets: updated,
        };
      }),
    }));
  };

  const updateSet = (
    exerciseEntryId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => {
        if (e.id !== exerciseEntryId) return e;
        return {
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        };
      }),
    }));
  };

  const startPredefinedWorkout = (
    workoutName: string,
    category: string,
    suggestedExerciseNames?: string[]
  ) => {
    const matchedExercises: WorkoutExercise[] = [];

    if (suggestedExerciseNames && suggestedExerciseNames.length > 0) {
      suggestedExerciseNames.forEach((name, i) => {
        const found = exercises.find((ex) => ex.name.toLowerCase().includes(name.toLowerCase()));
        if (found) {
          matchedExercises.push({
            id: `we-${Date.now()}-${i}`,
            exerciseId: found.id,
            name: found.name,
            muscle: found.muscle,
            equipment: found.equipment,
            emoji: found.emoji,
            isCompleted: false,
            sets: [
              { id: `s-${Date.now()}-1`, setNumber: 1, weight: '50', reps: '10' },
              { id: `s-${Date.now()}-2`, setNumber: 2, weight: '50', reps: '10' },
              { id: `s-${Date.now()}-3`, setNumber: 3, weight: '55', reps: '8' },
            ],
          });
        }
      });
    }

    // Default to at least 2 relevant exercises if none found
    if (matchedExercises.length === 0) {
      const defaultList = exercises.slice(0, 2);
      defaultList.forEach((found, i) => {
        matchedExercises.push({
          id: `we-${Date.now()}-${i}`,
          exerciseId: found.id,
          name: found.name,
          muscle: found.muscle,
          equipment: found.equipment,
          emoji: found.emoji,
          isCompleted: false,
          sets: [
            { id: `s-${Date.now()}-1`, setNumber: 1, weight: '60', reps: '10' },
            { id: `s-${Date.now()}-2`, setNumber: 2, weight: '60', reps: '8' },
            { id: `s-${Date.now()}-3`, setNumber: 3, weight: '65', reps: '6' },
          ],
        });
      });
    }

    setActiveWorkout({
      name: workoutName,
      category,
      startTime: Date.now(),
      exercises: matchedExercises,
    });
  };

  const resetActiveWorkout = () => {
    setActiveWorkout({
      name: 'Freestyle Workout',
      category: 'Strength',
      startTime: Date.now(),
      exercises: [],
    });
  };

  const deleteWorkoutFromHistory = (id: string) => {
    setWorkoutHistory((prev) => prev.filter((w) => w.id !== id));
  };

  const clearWorkoutHistory = () => {
    setWorkoutHistory([]);
  };

  const finishWorkout = (): FinishedWorkout | null => {
    if (activeWorkout.exercises.length === 0) {
      return null;
    }

    // Calculate total duration in mins (at least 1 min)
    const elapsedMinutes = Math.max(
      1,
      Math.round((Date.now() - activeWorkout.startTime) / (1000 * 60))
    );

    // Calculate volume & exercise details
    let totalVolume = 0;
    let totalSetsCount = 0;
    const exerciseDetails = activeWorkout.exercises.map((ex) => {
      let maxWeight = 0;
      let repsSum = 0;
      ex.sets.forEach((s) => {
        totalSetsCount += 1;
        const w = parseFloat(s.weight) || 0;
        const r = parseFloat(s.reps) || 0;
        if (w > maxWeight) maxWeight = w;
        repsSum += r;
        totalVolume += w * r;
      });
      return {
        name: ex.name,
        emoji: ex.emoji,
        setsCount: ex.sets.length,
        bestWeight: maxWeight,
        totalReps: repsSum,
      };
    });

    const caloriesBurned = Math.round(elapsedMinutes * 7.5 + totalSetsCount * 4);

    const now = new Date();
    const formattedDate = 'Today, ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: FinishedWorkout = {
      id: `w-finished-${Date.now()}`,
      name: activeWorkout.name || 'Workout',
      date: formattedDate,
      timestamp: Date.now(),
      duration: elapsedMinutes,
      calories: caloriesBurned,
      category: activeWorkout.category || 'Strength',
      icon: '💪',
      color: '#CCFF00',
      exercisesCount: activeWorkout.exercises.length,
      totalVolumeKg: totalVolume,
      exercises: exerciseDetails,
    };

    setWorkoutHistory((prev) => [newRecord, ...prev]);

    // Prepare fresh workout session
    resetActiveWorkout();

    return newRecord;
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        workoutHistory,
        weightEntries,
        measurementsHistory,
        progressPhotos,
        setWorkoutName,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        toggleExerciseCompleted,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
        startPredefinedWorkout,
        finishWorkout,
        resetActiveWorkout,
        deleteWorkoutFromHistory,
        clearWorkoutHistory,
        logWeight,
        logMeasurements,
        addProgressPhoto,
        deleteProgressPhoto,
        getOneRepMaxEstimates,
      }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
