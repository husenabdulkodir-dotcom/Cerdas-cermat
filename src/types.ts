export type Group = {
  id: string;
  name: string;
  score: number;
  streak?: number;
  reaction?: { emoji: string; text?: string; timestamp: number } | null;
};

export type QuestionType = 
  | 'wajib' 
  | 'lempar' 
  | 'rebutan' 
  | 'gambar' 
  | 'audio' 
  | 'clue' 
  | 'pilihan_ganda';

export type Question = {
  id: string;
  text: string;
  answer: string;
  type: QuestionType;
  category?: string;
  points: number;
  questionImage?: string;
  answerImage?: string;
  audioUrl?: string;
  packet?: string; // e.g. 'Amplop A', 'Amplop B', 'Paket 1'
  options?: string[]; // e.g. ['A. Mekkah', 'B. Madinah', 'C. Thaif', 'D. Kuffah']
  correctOption?: string; // e.g. 'B'
  clues?: string[]; // e.g. ['Clue 1: Sahabat Nabi', 'Clue 2: Berjuluk Pedang Allah', ...]
};

export type GameState = {
  groups: Group[];
  questions: Question[];
  activeQuestion: Question | null;
  timer: number;
  isTimerRunning: boolean;
  buzzerEnabled: boolean;
  buzzedGroupId: string | null;
  spinWheelResult: string | null;
  revealAnswer?: boolean;
  customCategories?: string[];
  gamePhase?: string;
  activeTurnGroupId?: string | null;
  passedGroupIds?: string[];
  openedEnvelope?: string | null;
  activeClueIndex?: number;
  groupBets?: Record<string, number>;
  soundTrigger?: { sound: 'correct' | 'wrong' | 'buzzer' | 'fanfare' | 'envelope' | 'clue' | 'applause' | 'drumroll'; timestamp: number } | null;
  usedQuestionIds?: string[];
  lastJudgment?: {
    groupId: string;
    isCorrect: boolean;
    points: number;
    timestamp: number;
    streak?: number;
  } | null;
};

