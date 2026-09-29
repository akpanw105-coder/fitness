/** All mock data for the fitness app prototype. */

export const todayStats = {
  steps: 7842,
  stepsGoal: 10000,
  calories: 1640,
  caloriesGoal: 2200,
  water: 5,
  waterGoal: 8,
  weight: 78.4,
  weightGoal: 75.0,
  activeMinutes: 47,
  activeMinutesGoal: 60,
  heartRate: 72,
};

export const workoutCategories = [
  { id: '1', name: 'Strength', icon: '💪', color: '#E2FF3A', bg: '#1C2200' },
  { id: '2', name: 'Cardio', icon: '🏃', color: '#4D8EF7', bg: '#0A1533' },
  { id: '3', name: 'HIIT', icon: '🔥', color: '#FF7A2E', bg: '#1F0F00' },
  { id: '4', name: 'Yoga', icon: '🧘', color: '#9B59F5', bg: '#12053D' },
  { id: '5', name: 'Core', icon: '⚡', color: '#2ECC71', bg: '#021A0C' },
  { id: '6', name: 'Stretch', icon: '🌿', color: '#FF4C4C', bg: '#1F0000' },
];

export const recommendedWorkouts = [
  {
    id: 'w1',
    name: 'Upper Body Blast',
    category: 'Strength',
    duration: 45,
    difficulty: 'Hard',
    exercises: 8,
    calories: 320,
    color: '#E2FF3A',
    bg: '#1C2200',
    icon: '💪',
  },
  {
    id: 'w2',
    name: 'Morning Cardio',
    category: 'Cardio',
    duration: 30,
    difficulty: 'Medium',
    exercises: 5,
    calories: 280,
    color: '#4D8EF7',
    bg: '#0A1533',
    icon: '🏃',
  },
  {
    id: 'w3',
    name: 'HIIT Power',
    category: 'HIIT',
    duration: 20,
    difficulty: 'Hard',
    exercises: 10,
    calories: 350,
    color: '#FF7A2E',
    bg: '#1F0F00',
    icon: '🔥',
  },
  {
    id: 'w4',
    name: 'Core & Abs',
    category: 'Core',
    duration: 25,
    difficulty: 'Medium',
    exercises: 7,
    calories: 180,
    color: '#2ECC71',
    bg: '#021A0C',
    icon: '⚡',
  },
  {
    id: 'w5',
    name: 'Full Body Stretch',
    category: 'Stretch',
    duration: 20,
    difficulty: 'Easy',
    exercises: 6,
    calories: 90,
    color: '#9B59F5',
    bg: '#12053D',
    icon: '🌿',
  },
];

export const recentWorkouts = [
  {
    id: 'r1',
    name: 'Upper Body Blast',
    date: 'Today',
    duration: 45,
    calories: 320,
    category: 'Strength',
    icon: '💪',
    color: '#E2FF3A',
  },
  {
    id: 'r2',
    name: 'Morning Cardio',
    date: 'Yesterday',
    duration: 30,
    calories: 280,
    category: 'Cardio',
    icon: '🏃',
    color: '#4D8EF7',
  },
  {
    id: 'r3',
    name: 'HIIT Power',
    date: '2 days ago',
    duration: 20,
    calories: 350,
    category: 'HIIT',
    icon: '🔥',
    color: '#FF7A2E',
  },
  {
    id: 'r4',
    name: 'Yoga Flow',
    date: '3 days ago',
    duration: 40,
    calories: 120,
    category: 'Yoga',
    icon: '🧘',
    color: '#9B59F5',
  },
  {
    id: 'r5',
    name: 'Core & Abs',
    date: '4 days ago',
    duration: 25,
    calories: 180,
    category: 'Core',
    icon: '⚡',
    color: '#2ECC71',
  },
  {
    id: 'r6',
    name: 'Leg Day',
    date: '5 days ago',
    duration: 50,
    calories: 410,
    category: 'Strength',
    icon: '💪',
    color: '#E2FF3A',
  },
];

export const weeklyActivity = [
  { day: 'Mon', minutes: 45, calories: 320 },
  { day: 'Tue', minutes: 30, calories: 280 },
  { day: 'Wed', minutes: 20, calories: 350 },
  { day: 'Thu', minutes: 40, calories: 120 },
  { day: 'Fri', minutes: 25, calories: 180 },
  { day: 'Sat', minutes: 50, calories: 410 },
  { day: 'Sun', minutes: 0, calories: 0 },
];

export const timerPresets = [
  { id: 't1', name: 'Quick HIIT', work: 20, rest: 10, rounds: 8, color: '#FF7A2E' },
  { id: 't2', name: 'Tabata', work: 20, rest: 10, rounds: 8, color: '#E2FF3A' },
  { id: 't3', name: 'Strength Rest', work: 60, rest: 90, rounds: 5, color: '#4D8EF7' },
  { id: 't4', name: 'Circuit', work: 45, rest: 15, rounds: 6, color: '#2ECC71' },
  { id: 't5', name: 'EMOM 10', work: 50, rest: 10, rounds: 10, color: '#9B59F5' },
];

import { comprehensiveExercises, allMuscles } from './exerciseLibraryData';

export const exercises = comprehensiveExercises.map((e) => ({
  id: e.id,
  name: e.name,
  muscle: e.primaryMuscle,
  equipment: e.equipment,
  difficulty: e.difficulty,
  sets: e.recommendedSets,
  emoji: e.emoji,
}));

export const muscleGroups = [...allMuscles];

export const weightHistory = [
  { date: 'Sep 1', weight: 80.2 },
  { date: 'Sep 7', weight: 79.8 },
  { date: 'Sep 14', weight: 79.1 },
  { date: 'Sep 21', weight: 78.8 },
  { date: 'Sep 28', weight: 78.4 },
];

export const measurements = [
  { label: 'Chest', value: '98 cm', icon: '📏' },
  { label: 'Waist', value: '82 cm', icon: '📏' },
  { label: 'Hips', value: '96 cm', icon: '📏' },
  { label: 'Bicep (L)', value: '35 cm', icon: '💪' },
  { label: 'Thigh (L)', value: '58 cm', icon: '🦵' },
];

export const todayWorkout = {
  name: 'Upper Body Blast',
  duration: 45,
  exercises: 8,
  completed: 3,
  color: '#E2FF3A',
  icon: '💪',
};
