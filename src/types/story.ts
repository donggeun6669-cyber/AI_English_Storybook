export type ChapterNumber = 1 | 2 | 3;

export interface NewWordInfo {
  word: string;
  koreanMeaning: string;
  emoji: string;
  simpleDefinition: string;
}

export interface StoryPageData {
  id: number;
  chapter: ChapterNumber;
  pageNumber: number; // 1 to 12
  title: string;
  sentences: string[];
  koreanSentences: string[];
  newWord?: NewWordInfo;
  clueSummary?: string;
  sceneId: string;
}

export type QuestionLevel = 'Find it' | 'Why?' | 'Your idea';

export interface QuestionOption {
  id: string;
  text: string;
  emoji: string;
  isCorrect?: boolean; // For 'Your idea', any choice can be accepted
  expansionText?: string;
  koreanExpansionText?: string;
}

export interface QuestionData {
  pageId: number;
  chapter: ChapterNumber;
  level: QuestionLevel;
  questionText: string;
  hintText: string;
  options: QuestionOption[];
  fullSentenceExpansion: string;
  koreanFullSentence: string;
}

export type CoverGuess = 'boy' | 'dog' | 'bird';

export interface GameProgress {
  coverGuess: CoverGuess | null;
  currentPage: number; // 0 = Cover, 1..12 = Story Pages, 13 = Case Closed
  showQuestionForPage: number | null; // null if on story page, number if answering question
  chapterKoUses: {
    1: number;
    2: number;
    3: number;
  };
  wordTapsByChapter: {
    1: number;
    2: number;
    3: number;
  };
  cluesFoundScore: number; // Max 10 (first attempt correct on literal & why questions)
  questionAttempts: Record<number, number>; // attempts per page
  answeredQuestions: Record<number, boolean>;
  recordedAudioUrls: Record<number, string>;
}
