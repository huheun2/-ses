export type QuestionType = 'choice' | 'classify' | 'fill_blank' | 'build_sentence' | 'slot_select';

export interface PrincipleRule {
  keyword: string;
  badgeColor?: string;
  explanation: string;
  example?: string;
}

export interface StagePrinciple {
  title: string;
  coreCatchphrase: string;
  description: string;
  rules: PrincipleRule[];
  rememberTip: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  contextSentence?: string;
  highlightWord?: string;
  principleExplanation: string; // 틀렸을 때 직관적으로 보여주는 원리 설명
  helpHint?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  options: { text: string; subtext?: string }[];
  correctIndex: number;
}

export interface ClassifyQuestion extends BaseQuestion {
  type: 'classify';
  categories: { id: string; label: string; color: string }[];
  items: { word: string; categoryId: string; meaning?: string }[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  beforeText: string;
  afterText: string;
  options: string[];
  correctAnswer: string;
  koreanMeaning: string;
}

export interface BuildSentenceQuestion extends BaseQuestion {
  type: 'build_sentence';
  koreanMeaning: string;
  availableWords: string[]; // Shuffled word chunks
  correctSentence: string[]; // Exact tokens in correct order
}

export interface SlotSelectQuestion extends BaseQuestion {
  type: 'slot_select';
  koreanMeaning: string;
  subjectText: string;
  verbOptions: string[];
  correctVerb: string;
  nounOptions: string[];
  correctNoun: string;
  endText?: string;
}

export type Question = ChoiceQuestion | ClassifyQuestion | FillBlankQuestion | BuildSentenceQuestion | SlotSelectQuestion;

export interface StageInfo {
  id: number; // 1 ~ 8
  title: string;
  categoryName: string;
  shortDesc: string;
  badge: string;
  color: {
    bg: string;
    border: string;
    text: string;
    light: string;
    accent: string;
  };
  principle: StagePrinciple;
  questionPool: Question[]; // Minimum 8-12 questions so they can't simply memorize
}

export interface StageResult {
  stageId: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  stars: number; // 1, 2, or 3
  isCleared: boolean;
}
