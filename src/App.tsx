/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { CoverGuess, ChapterNumber } from './types/story';
import { STORY_PAGES, QUESTIONS_DATA } from './data/storyData';
import { CoverScreen } from './components/screens/CoverScreen';
import { StoryPageScreen } from './components/screens/StoryPageScreen';
import { QuestionScreen } from './components/screens/QuestionScreen';
import { CaseClosedScreen } from './components/screens/CaseClosedScreen';
import { useSpeechSynthesis } from './components/speech/useSpeechSynthesis';

type ScreenState = 'cover' | 'story' | 'question' | 'case_closed';

export default function App() {
  const [screenState, setScreenState] = useState<ScreenState>('cover');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [coverGuess, setCoverGuess] = useState<CoverGuess | null>(null);

  // Chapter 2 Korean translation uses: max 3 uses total across Chapter 2
  const [chapter2KoUsesRemaining, setChapter2KoUsesRemaining] = useState<number>(3);

  // Word taps count per chapter
  const [wordTapsByChapter, setWordTapsByChapter] = useState<{ 1: number; 2: number; 3: number }>({
    1: 0,
    2: 0,
    3: 0
  });

  // Clues found score: count questions answered correctly on first try (out of 10)
  const [cluesFoundScore, setCluesFoundScore] = useState<number>(0);

  // Global Speech hook
  const {
    speak,
    stop,
    isSpeaking,
    currentWordIndex,
    isSlowSpeed,
    toggleSlowSpeed
  } = useSpeechSynthesis();

  // Track if learner has ever recorded successfully in the app session
  const [hasEverRecordedSuccessfully, setHasEverRecordedSuccessfully] = useState<boolean>(false);

  const handleRecordSuccess = useCallback(() => {
    setHasEverRecordedSuccessfully(true);
  }, []);

  // 1. Cover Screen Actions
  const handleStartCase = (guess: CoverGuess) => {
    stop();
    setCoverGuess(guess);
    setCurrentPage(1);
    setScreenState('story');
  };

  // 2. Story Page Actions
  const handleGoBack = () => {
    stop();
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleUseKo = () => {
    const currentChapter = STORY_PAGES[currentPage - 1].chapter;
    if (currentChapter === 2) {
      setChapter2KoUsesRemaining((prev) => Math.max(0, prev - 1));
    }
  };

  const handleRecordWordTap = (chapter: ChapterNumber) => {
    setWordTapsByChapter((prev) => ({
      ...prev,
      [chapter]: prev[chapter] + 1
    }));
  };

  const handleGoToQuestion = () => {
    stop();
    setScreenState('question');
  };

  // 3. Question Screen Actions
  const handleQuestionCompleted = (wasFirstTryCorrect: boolean) => {
    stop();
    if (wasFirstTryCorrect) {
      setCluesFoundScore((prev) => prev + 1);
    }

    if (currentPage < 12) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setScreenState('story');
    } else {
      setScreenState('case_closed');
    }
  };

  // 4. Case Closed Actions
  const handleReplayCase = () => {
    stop();
    setCurrentPage(1);
    setChapter2KoUsesRemaining(3);
    setWordTapsByChapter({ 1: 0, 2: 0, 3: 0 });
    setCluesFoundScore(0);
    setScreenState('story');
  };

  const handleGoHome = () => {
    stop();
    setCurrentPage(1);
    setCoverGuess(null);
    setChapter2KoUsesRemaining(3);
    setWordTapsByChapter({ 1: 0, 2: 0, 3: 0 });
    setCluesFoundScore(0);
    setScreenState('cover');
  };

  const currentPageData = STORY_PAGES[currentPage - 1] || STORY_PAGES[0];
  const currentQuestionData = QUESTIONS_DATA[currentPage] || QUESTIONS_DATA[1];

  return (
    <div className="min-h-screen bg-[#2D241E] flex items-center justify-center p-0 sm:p-4 selection:bg-[#FFD13B]">
      {/* Centered Portrait Phone Mockup Layout (max-width 480px) */}
      <main className="w-full max-w-[480px] h-[100dvh] sm:h-[844px] bg-[#FDF3EA] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden border-0 sm:border-8 sm:border-[#3E322A] relative text-[#2D241E]">
        
        {/* Subtle decorative phone notch bar for mobile aesthetic */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 bg-transparent">
          <div className="w-28 h-3.5 bg-[#3E322A] rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#2D241E] rounded-full mr-2" />
            <div className="w-1.5 h-1.5 bg-[#FF9436]/40 rounded-full" />
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col justify-between">
          {screenState === 'cover' && (
            <CoverScreen
              onStartCase={handleStartCase}
              onLennySpeak={(text) => speak(text)}
            />
          )}

          {screenState === 'story' && (
            <StoryPageScreen
              key={`story-${currentPage}`}
              pageData={currentPageData}
              totalPages={STORY_PAGES.length}
              chapterKoUsesRemaining={chapter2KoUsesRemaining}
              onUseKo={handleUseKo}
              onRecordWordTap={handleRecordWordTap}
              onGoToQuestion={handleGoToQuestion}
              onGoBack={handleGoBack}
              speakText={speak}
              stopSpeaking={stop}
              isSpeaking={isSpeaking}
              highlightedWordIndex={currentWordIndex}
              isSlowSpeed={isSlowSpeed}
              toggleSlowSpeed={toggleSlowSpeed}
            />
          )}

          {screenState === 'question' && (
            <QuestionScreen
              key={`question-${currentPage}`}
              questionData={currentQuestionData}
              pageNumber={currentPage}
              totalPages={STORY_PAGES.length}
              onQuestionCompleted={handleQuestionCompleted}
              onSpeakText={(text, onEnd) =>
                speak(text, { onEndCallback: onEnd })
              }
              stopSpeaking={stop}
              hasRecordedSuccessfully={hasEverRecordedSuccessfully}
              onRecordSuccess={handleRecordSuccess}
            />
          )}

          {screenState === 'case_closed' && (
            <CaseClosedScreen
              coverGuess={coverGuess}
              cluesFoundScore={cluesFoundScore}
              wordTapsByChapter={wordTapsByChapter}
              onReplayCase={handleReplayCase}
              onGoHome={handleGoHome}
              onSpeakText={(text) => speak(text)}
              hasRecordedSuccessfully={hasEverRecordedSuccessfully}
              onRecordSuccess={handleRecordSuccess}
            />
          )}
        </div>

        {/* Small Home Indicator Bar for Mobile Feel */}
        <div className="py-1.5 flex justify-center bg-transparent pointer-events-none">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </main>
    </div>
  );
}
