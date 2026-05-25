export type ScreenState =
  | 'loading'
  | 'intro'
  | 'quiz'
  | 'transition'
  | 'envelope'
  | 'letter'
  | 'closure';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number; // For multiple Eyads in Q3, we can handle it specially!
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  spin?: number;
  spinSpeed?: number;
}
