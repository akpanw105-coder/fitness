/**
 * Curated workout presets for the Tracker.
 * Exercise names must match names in exerciseLibraryData.ts so that
 * startPredefinedWorkout() can look them up and hydrate full exercise data.
 */

export interface WorkoutPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  bg: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: number; // minutes
  description: string;
  targetMuscles: string[];
  exerciseNames: string[]; // exact match or partial match against exerciseLibraryData names
}

export const workoutPresets: WorkoutPreset[] = [
  // ─── STRENGTH ─────────────────────────────────────────────────────────────
  {
    id: 'preset-powerlifting',
    name: 'Powerlifting Big 3',
    category: 'Strength',
    icon: '⚡',
    color: '#E2FF3A',
    bg: '#1C2200',
    difficulty: 'Advanced',
    estimatedDuration: 75,
    description: 'The holy trinity of strength. Squat, Bench, and Deadlift done heavy for low reps to build raw maximal force.',
    targetMuscles: ['Chest', 'Back', 'Legs', 'Core'],
    exerciseNames: [
      'Barbell Back Squat',
      'Barbell Bench Press',
      'Conventional Barbell Deadlift',
    ],
  },
  {
    id: 'preset-upper-strength',
    name: 'Upper Body Strength',
    category: 'Strength',
    icon: '🏋️',
    color: '#E2FF3A',
    bg: '#1C2200',
    difficulty: 'Intermediate',
    estimatedDuration: 55,
    description: 'Heavy horizontal and vertical pressing paired with serious back work. Builds a powerful upper body foundation.',
    targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
    exerciseNames: [
      'Barbell Bench Press',
      'Bent-Over Barbell Row',
      'Standing Overhead Barbell Press',
      'Strict Dead-Hang Pull-Up',
    ],
  },
  {
    id: 'preset-leg-strength',
    name: 'Heavy Leg Day',
    category: 'Strength',
    icon: '🦵',
    color: '#E2FF3A',
    bg: '#1C2200',
    difficulty: 'Intermediate',
    estimatedDuration: 65,
    description: 'A brutal lower body session built around the squat and posterior chain. Legs, glutes, hamstrings — all of it.',
    targetMuscles: ['Legs', 'Glutes', 'Hamstrings'],
    exerciseNames: [
      'Barbell Back Squat',
      'Conventional Barbell Deadlift',
      'Romanian Deadlift (RDL)',
      'Walking Dumbbell Lunges',
    ],
  },

  // ─── HYPERTROPHY ──────────────────────────────────────────────────────────
  {
    id: 'preset-push-hypertrophy',
    name: 'Push Day (Hypertrophy)',
    category: 'Hypertrophy',
    icon: '💪',
    color: '#FF7A2E',
    bg: '#1F0F00',
    difficulty: 'Intermediate',
    estimatedDuration: 60,
    description: 'PPL-style push session targeting chest, shoulders, and triceps through peak contraction and time under tension.',
    targetMuscles: ['Chest', 'Shoulders', 'Arms'],
    exerciseNames: [
      'Incline Dumbbell Press',
      'Barbell Bench Press',
      'Standing Overhead Barbell Press',
      'Dumbbell Lateral Raise',
      'Barbell Skull Crusher',
    ],
  },
  {
    id: 'preset-pull-hypertrophy',
    name: 'Pull Day (Hypertrophy)',
    category: 'Hypertrophy',
    icon: '🧗',
    color: '#FF7A2E',
    bg: '#1F0F00',
    difficulty: 'Intermediate',
    estimatedDuration: 60,
    description: 'Full back width and thickness session. Vertical + horizontal pulling compounds paired with bicep isolation.',
    targetMuscles: ['Back', 'Arms'],
    exerciseNames: [
      'Strict Dead-Hang Pull-Up',
      'Bent-Over Barbell Row',
      'Romanian Deadlift (RDL)',
      'Incline Dumbbell Bicep Curl',
    ],
  },
  {
    id: 'preset-arms-hypertrophy',
    name: 'Arm Annihilator',
    category: 'Hypertrophy',
    icon: '🦾',
    color: '#FF7A2E',
    bg: '#1F0F00',
    difficulty: 'Beginner',
    estimatedDuration: 45,
    description: 'Dedicated arm day alternating between bicep and tricep work. Maximum pump, full range of motion.',
    targetMuscles: ['Arms'],
    exerciseNames: [
      'Incline Dumbbell Bicep Curl',
      'Barbell Skull Crusher',
      'Parallel Bar Dips',
    ],
  },
  {
    id: 'preset-shoulders-hypertrophy',
    name: 'Boulder Shoulders',
    category: 'Hypertrophy',
    icon: '🦅',
    color: '#FF7A2E',
    bg: '#1F0F00',
    difficulty: 'Beginner',
    estimatedDuration: 40,
    description: 'Three-dimensional shoulder development hitting all heads — overhead press for mass, laterals for width.',
    targetMuscles: ['Shoulders'],
    exerciseNames: [
      'Standing Overhead Barbell Press',
      'Dumbbell Lateral Raise',
      'Bent-Over Barbell Row',
    ],
  },

  // ─── HIIT & CONDITIONING ──────────────────────────────────────────────────
  {
    id: 'preset-hiit-conditioning',
    name: 'HIIT Conditioning',
    category: 'HIIT',
    icon: '🔥',
    color: '#4D8EF7',
    bg: '#0A1533',
    difficulty: 'Advanced',
    estimatedDuration: 30,
    description: 'High-intensity full-body conditioning circuit. Maximum output, minimal rest. Not for the faint-hearted.',
    targetMuscles: ['Legs', 'Core', 'Chest'],
    exerciseNames: [
      'Burpee Broad Jump',
      'Hardstyle Kettlebell Swing',
      'Hanging Leg Raise',
    ],
  },
  {
    id: 'preset-kettlebell',
    name: 'Kettlebell Power',
    category: 'HIIT',
    icon: '💣',
    color: '#4D8EF7',
    bg: '#0A1533',
    difficulty: 'Intermediate',
    estimatedDuration: 35,
    description: 'Kettlebell-focused power endurance. Hip explosiveness, grip strength, and conditioning in a single session.',
    targetMuscles: ['Glutes', 'Core', 'Back'],
    exerciseNames: [
      'Hardstyle Kettlebell Swing',
      'Romanian Deadlift (RDL)',
      'Hanging Leg Raise',
    ],
  },

  // ─── CALISTHENICS ─────────────────────────────────────────────────────────
  {
    id: 'preset-calisthenics',
    name: 'Calisthenics Fundamentals',
    category: 'Calisthenics',
    icon: '🧗‍♂️',
    color: '#9B59F5',
    bg: '#12053D',
    difficulty: 'Intermediate',
    estimatedDuration: 50,
    description: 'Master your own bodyweight. Pull-ups, dips, and hanging core work — the foundation of real strength.',
    targetMuscles: ['Back', 'Chest', 'Arms', 'Core'],
    exerciseNames: [
      'Strict Dead-Hang Pull-Up',
      'Parallel Bar Dips',
      'Hanging Leg Raise',
      'Burpee Broad Jump',
    ],
  },

  // ─── CORE & MOBILITY ──────────────────────────────────────────────────────
  {
    id: 'preset-core',
    name: 'Core Destroyer',
    category: 'Core',
    icon: '🎯',
    color: '#2ECC71',
    bg: '#021A0C',
    difficulty: 'Beginner',
    estimatedDuration: 25,
    description: 'Targeted core session hitting lower abs, anti-rotation, and hip flexors. Leave with a rock-solid midsection.',
    targetMuscles: ['Core', 'Glutes'],
    exerciseNames: [
      'Hanging Leg Raise',
      'Burpee Broad Jump',
      "World's Greatest Stretch",
    ],
  },
  {
    id: 'preset-mobility',
    name: 'Mobility & Recovery',
    category: 'Mobility',
    icon: '🧘‍♂️',
    color: '#9B59F5',
    bg: '#12053D',
    difficulty: 'Beginner',
    estimatedDuration: 30,
    description: 'Active recovery and joint health session. Open tight hips, unlock thoracic mobility, and flush out soreness.',
    targetMuscles: ['Glutes', 'Legs', 'Back'],
    exerciseNames: [
      "World's Greatest Stretch",
      'Walking Dumbbell Lunges',
      'Romanian Deadlift (RDL)',
    ],
  },
];

export const presetCategories = [
  { id: 'all', name: 'All', icon: '⚡' },
  { id: 'Strength', name: 'Strength', icon: '🏋️' },
  { id: 'Hypertrophy', name: 'Hypertrophy', icon: '💪' },
  { id: 'HIIT', name: 'HIIT', icon: '🔥' },
  { id: 'Calisthenics', name: 'Calisthenics', icon: '🧗‍♂️' },
  { id: 'Core', name: 'Core', icon: '🎯' },
  { id: 'Mobility', name: 'Mobility', icon: '🧘‍♂️' },
] as const;
