import React, { useState, useEffect } from 'react';
import { QuestionData, QuestionOption } from '../../types/story';
import { LennyGuide } from '../LennyGuide';
import { StoryIllustration } from '../illustrations/StoryIllustration';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { useSpeechRecognition } from '../speech/useSpeechRecognition';
import { Check, Mic, MicOff, Play, RotateCcw, ArrowRight, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';

interface QuestionScreenProps {
  questionData: QuestionData;
  pageNumber: number;
  totalPages: number;
  onQuestionCompleted: (wasFirstTryCorrect: boolean) => void;
  onSpeakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  hasRecordedSuccessfully?: boolean;
  onRecordSuccess?: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionData,
  pageNumber,
  totalPages,
  onQuestionCompleted,
  onSpeakText,
  stopSpeaking,
  hasRecordedSuccessfully = false,
  onRecordSuccess
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lennyMessage, setLennyMessage] = useState<string>(questionData.questionText);
  const [lennySubText, setLennySubText] = useState<string | undefined>();
  const [showClueHint, setShowClueHint] = useState(false);
  const [isSuccessGreenFlash, setIsSuccessGreenFlash] = useState(false);
  const [isFirstTryCorrect, setIsFirstTryCorrect] = useState(false);
  const [activeExpansion, setActiveExpansion] = useState<string>(questionData.fullSentenceExpansion);
  const [activeKoreanExpansion, setActiveKoreanExpansion] = useState<string>(questionData.koreanFullSentence);
  const [hasPracticedWithoutMic, setHasPracticedWithoutMic] = useState<boolean>(false);

  // Randomly shuffle answer options each time question opens
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>(() =>
    [...questionData.options].sort(() => Math.random() - 0.5)
  );

  // Audio recording for [🎤 Say it]
  const {
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
    isRecording,
    isPlaying,
    hasRecording,
    hasPlayedAudioOnce,
    isMicUnavailable,
    setIsMicUnavailable,
    micErrorMessage,
    durationSeconds
  } = useAudioRecorder();

  // Speech Recognition Check
  const {
    startCheck,
    isListening,
    wordResults,
    matchRatio,
    isSupported: isSpeechRecognitionSupported,
    errorMessage: speechRecognitionError,
    resetCheck
  } = useSpeechRecognition();

  const isOpinionQuestion = questionData.level === 'Your idea';

  // Mark successful recording in global state
  useEffect(() => {
    if (hasRecording) {
      onRecordSuccess?.();
    }
  }, [hasRecording, onRecordSuccess]);

  // Read out question when opening and re-shuffle options
  useEffect(() => {
    setShuffledOptions([...questionData.options].sort(() => Math.random() - 0.5));
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setAttemptCount(0);
    setLennyMessage(questionData.questionText);
    setLennySubText(undefined);
    setShowClueHint(false);
    setIsSuccessGreenFlash(false);
    setIsFirstTryCorrect(false);
    setActiveExpansion(questionData.fullSentenceExpansion);
    setActiveKoreanExpansion(questionData.koreanFullSentence);
    setHasPracticedWithoutMic(false);
    resetRecording();
    resetCheck();

    const timer = window.setTimeout(() => {
      onSpeakText(questionData.questionText);
    }, 300);
    return () => {
      window.clearTimeout(timer);
      stopSpeaking();
    };
  }, [questionData.pageId]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswerRevealed) return; // already solved

    setSelectedOptionId(optionId);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    const chosenOption = questionData.options.find((o) => o.id === optionId);
    const isCorrect = isOpinionQuestion || chosenOption?.isCorrect === true;

    if (isCorrect) {
      // First try tracking
      if (newAttempt === 1 && !isOpinionQuestion) {
        setIsFirstTryCorrect(true);
      }

      const targetExpansion = chosenOption?.expansionText || questionData.fullSentenceExpansion;
      const targetKorean = chosenOption?.koreanExpansionText || questionData.koreanFullSentence;

      setActiveExpansion(targetExpansion);
      setActiveKoreanExpansion(targetKorean);

      setIsSuccessGreenFlash(true);
      setIsAnswerRevealed(true);
      setLennyMessage(targetExpansion);
      setLennySubText("Now practice speaking the sentence!");

      // Lenny expands it into full sentence and reads aloud
      onSpeakText(targetExpansion);
    } else {
      // Never a red X!
      setIsSuccessGreenFlash(false);
      setShowClueHint(true);

      if (newAttempt === 1) {
        setLennyMessage("Hmm, look again! A clue is waiting for you.");
        setLennySubText(`Hint: ${questionData.hintText}`);
        onSpeakText("Hmm, look again!");
      } else {
        // Second miss: gently reveal the answer
        setIsAnswerRevealed(true);
        const correctOpt = questionData.options.find((o) => o.isCorrect);
        if (correctOpt) {
          setSelectedOptionId(correctOpt.id);
        }
        const targetExpansion = correctOpt?.expansionText || questionData.fullSentenceExpansion;
        const targetKorean = correctOpt?.koreanExpansionText || questionData.koreanFullSentence;

        setActiveExpansion(targetExpansion);
        setActiveKoreanExpansion(targetKorean);

        setLennyMessage(targetExpansion);
        setLennySubText("Here is the answer! Let's practice saying it together.");
        onSpeakText(targetExpansion);
      }
    }
  };

  const handleNext = () => {
    stopSpeaking();
    resetRecording();
    resetCheck();
    onQuestionCompleted(isFirstTryCorrect);
  };

  // Next is enabled only after learner has recorded once AND played it back once (or mic is unavailable / practiced without mic)
  const canProceed =
    isAnswerRevealed &&
    ((hasRecording && hasPlayedAudioOnce) || isMicUnavailable || hasPracticedWithoutMic);

  // Badge styling for level tags
  const getLevelBadge = () => {
    switch (questionData.level) {
      case 'Find it':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'Find it · 사실 확인'
        };
      case 'Why?':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'Why? · 이유 추론'
        };
      case 'Your idea':
        return {
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          label: 'Your idea · 내 생각'
        };
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between p-3.5 space-y-3 overflow-y-auto text-[#2D241E]">
      {/* Small scene card at top (rounded thumbnail of the page illustration + one line) */}
      <div className="bg-white rounded-[20px] p-2 shadow-xs flex items-center gap-3 overflow-hidden">
        <div className="w-20 h-16 shrink-0 rounded-[14px] overflow-hidden bg-[#FDF3EA] border border-[#FCE9DA]">
          <StoryIllustration
            sceneId={`scene-${pageNumber}`}
            highlightClue={showClueHint}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#8A4B14] block">
            Page {pageNumber} · Clue Scene
          </span>
          <span className="text-xs font-semibold text-[#2D241E]/70 line-clamp-1">
            Ch.{questionData.chapter} · Clue Check #{pageNumber} / {totalPages}
          </span>
        </div>
      </div>

      {/* Lenny avatar with a yellow "Find it" / "Why?" / "Your idea" pill */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#FCE9DA] flex items-center justify-center text-xl shadow-xs">
            🔍
          </div>
          <span className="font-extrabold text-sm text-[#2D241E]">Lenny's Question</span>
        </div>
        <div className="px-3.5 py-1 rounded-full bg-[#FFD13B] text-[#2D241E] text-xs font-extrabold shadow-xs">
          {questionData.level === 'Find it'
            ? 'Find it · 사실 확인'
            : questionData.level === 'Why?'
            ? 'Why? · 이유 추론'
            : 'Your idea · 내 생각'}
        </div>
      </div>

      {/* Question in a white card in big bold text */}
      <div className="bg-white rounded-[24px] p-4 shadow-sm space-y-2.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D241E] leading-snug">
          {questionData.questionText}
        </h2>

        {/* Clue Hint Box (Shown on wrong try - no red!) */}
        {showClueHint && !isAnswerRevealed && (
          <div className="bg-[#FCE9DA] p-3 rounded-[18px] flex items-start gap-2 shadow-xs animate-in fade-in">
            <Lightbulb className="w-5 h-5 text-[#8A4B14] shrink-0 mt-0.5" />
            <div className="text-sm text-[#2D241E] font-medium">
              <span className="font-extrabold text-[#8A4B14] block">Lenny's Clue Hint:</span>
              {questionData.hintText}
            </div>
          </div>
        )}
      </div>

      {/* Answer options as big rounded white cards side by side */}
      <div className="space-y-2">
        <div className={`grid gap-2.5 ${shuffledOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isTargetCorrect = isOpinionQuestion || opt.isCorrect;

            let cardStyle = 'bg-white text-[#2D241E] shadow-xs hover:bg-[#FDF3EA]/60';
            if (isAnswerRevealed) {
              if (isTargetCorrect) {
                cardStyle = 'bg-green-50/90 border-2 border-[#4CAF50] ring-2 ring-[#4CAF50]/20 shadow-sm';
              } else if (isSelected) {
                cardStyle = 'bg-[#FCE9DA]/60 text-[#2D241E]/60';
              }
            } else if (isSelected) {
              cardStyle = 'bg-[#FFD13B]/40 ring-2 ring-[#FFD13B]';
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswerRevealed}
                className={`min-h-[72px] p-3 rounded-[24px] flex flex-col items-center justify-center text-center transition-all active:scale-95 cursor-pointer relative ${cardStyle} ${
                  showClueHint && !isAnswerRevealed && isSelected ? 'animate-shake' : ''
                }`}
              >
                {isAnswerRevealed && isTargetCorrect && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shadow-xs animate-in zoom-in">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className="text-sm font-extrabold text-[#2D241E] leading-snug">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success feedback in a peach card with a green round smile icon and the expanded sentence */}
      {isAnswerRevealed && (
        <div className="bg-[#FCE9DA] rounded-[24px] p-3.5 shadow-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-sm font-bold shadow-xs">
              😊
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8A4B14]">
              {isOpinionQuestion ? "Great detective idea!" : "Clue found!"}
            </span>
          </div>

          <div className="p-3 bg-white/95 rounded-[18px] shadow-2xs">
            <p className="text-base sm:text-lg font-extrabold text-[#2D241E] leading-snug">
              "{activeExpansion}"
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#8A4B14] mt-1">
              {activeKoreanExpansion}
            </p>
          </div>
        </div>
      )}

      {/* "Practice saying the sentence:" card with yellow pill [🎤 Say it] and beige pill [▶ Hear me] side by side */}
      {isAnswerRevealed && (
        <div className="bg-white rounded-[24px] p-3.5 shadow-sm space-y-3 animate-in slide-in-from-bottom-2">
          <span className="text-xs sm:text-sm font-extrabold text-[#2D241E] uppercase tracking-wide block">
            Practice saying the sentence:
          </span>

          {/* Microphone Help for Kids (shown before the very first recording in the app) */}
          {!hasRecordedSuccessfully && !hasRecording && (
            <div className="p-2.5 bg-[#FCE9DA] rounded-[16px] text-center space-y-0.5 animate-in fade-in">
              <p className="text-xs font-extrabold text-[#2D241E] leading-snug">
                Your browser may ask to use the microphone. Ask a parent or teacher to tap 'Allow'.
              </p>
              <p className="text-[11px] font-bold text-[#8A4B14] leading-tight">
                마이크 허용 창이 뜨면 선생님이나 부모님께 '허용'을 눌러 달라고 하세요.
              </p>
            </div>
          )}

          {/* Recording Controls */}
          {micErrorMessage && (isMicUnavailable || hasPracticedWithoutMic) ? (
            <div className="p-3 bg-[#FCE9DA]/70 rounded-[18px] text-xs font-bold text-[#2D241E]">
              <p>{micErrorMessage}</p>
              {hasPracticedWithoutMic ? (
                <p className="mt-2 text-xs font-extrabold text-[#4CAF50] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" /> Practiced saying it aloud! 👍
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setHasPracticedWithoutMic(true)}
                  className="mt-2 px-4 py-2 bg-[#FF9436] hover:bg-[#F58625] text-white text-xs font-extrabold rounded-full btn-3d-orange cursor-pointer"
                >
                  I practiced saying it! 👍
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Yellow pill [🎤 Say it] and Beige pill [▶ Hear me] side by side */}
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 min-h-[48px] bg-[#FFD13B] hover:bg-[#f6c62c] text-[#2D241E] font-extrabold text-sm rounded-full flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#8A4B14]" />
                    <span>{hasRecording ? '🎤 Say again' : '🎤 Say it'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 min-h-[48px] bg-rose-500 text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-1.5 shadow-md animate-pulse ring-2 ring-rose-400 cursor-pointer"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>Stop ({durationSeconds}s) ⏹</span>
                  </button>
                )}

                {/* Beige pill [▶ Hear me] */}
                <button
                  type="button"
                  onClick={() => onSpeakText(activeExpansion)}
                  className="flex-1 min-h-[48px] bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#2D241E] font-extrabold text-sm rounded-full flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-[#8A4B14]" />
                  <span>▶ Hear me</span>
                </button>

                {/* Play Recorded Voice (Listen to self) */}
                {hasRecording && !isRecording && (
                  <button
                    type="button"
                    onClick={playRecording}
                    className={`min-h-[48px] px-3.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
                      isPlaying
                        ? 'bg-[#8A4B14] text-white'
                        : 'bg-white border border-[#FCE9DA] text-[#2D241E] hover:bg-[#FDF3EA]'
                    }`}
                    aria-label="Play your recording"
                  >
                    {isPlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Listen 🎧</span>
                  </button>
                )}
              </div>

              {/* Hint under buttons */}
              {hasRecording && !hasPlayedAudioOnce && (
                <p className="text-xs text-[#8A4B14] font-bold text-center animate-pulse">
                  Record, then listen to yourself 🎧
                </p>
              )}

              {/* Speech Check Button [🟢 Check my words] */}
              {hasRecording && !isRecording && (
                <div className="pt-1 border-t border-[#FCE9DA]">
                  {!isListening ? (
                    <button
                      type="button"
                      onClick={() => startCheck(activeExpansion)}
                      className="w-full min-h-[48px] rounded-full bg-[#4CAF50] hover:bg-[#43a047] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🟢 Check my words</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full min-h-[48px] rounded-full bg-[#4CAF50]/80 text-white font-extrabold text-sm flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Listening... Say the sentence now!</span>
                    </button>
                  )}

                  {speechRecognitionError && (
                    <p className="text-xs text-[#8A4B14] mt-1.5 text-center font-bold">
                      {speechRecognitionError}
                    </p>
                  )}

                  {/* Speech Recognition Results Display */}
                  {wordResults && matchRatio && (
                    <div className="mt-2 p-2.5 bg-[#FDF3EA] rounded-[18px] space-y-1 text-center">
                      <p className="text-xs font-extrabold text-[#4CAF50]">
                        Lenny: "Great! {matchRatio.matched} / {matchRatio.total} words!"
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1 text-sm font-extrabold">
                        {wordResults.map((w, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-full ${
                              w.matched
                                ? 'bg-green-100 text-[#4CAF50]'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {w.raw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Next Action: Full-width orange pill [Next ▶] */}
      <div className="pt-0.5 pb-0.5">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full min-h-[48px] rounded-full font-extrabold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
            canProceed
              ? 'bg-[#FF9436] hover:bg-[#F58625] text-white btn-3d-orange'
              : 'bg-[#E5D7CC] text-[#8C7A6D] cursor-not-allowed'
          }`}
        >
          <span>
            {!isAnswerRevealed
              ? 'Answer the question'
              : !hasRecording && !isMicUnavailable && !hasPracticedWithoutMic
              ? 'Record your voice 🎤'
              : hasRecording && !hasPlayedAudioOnce && !isMicUnavailable && !hasPracticedWithoutMic
              ? 'Listen to your voice 🎧'
              : 'Next Clue ▶'}
          </span>
          {canProceed && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
