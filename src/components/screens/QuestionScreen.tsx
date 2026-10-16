import React, { useState, useEffect } from 'react';
import { QuestionData, QuestionOption } from '../../types/story';
import { LennyGuide, LennyMood } from '../LennyGuide';
import { StoryIllustration } from '../illustrations/StoryIllustration';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { useSpeechRecognition } from '../speech/useSpeechRecognition';
import { Check, Mic, MicOff, Play, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  // Lenny Guide State
  const [lennyMood, setLennyMood] = useState<LennyMood>('questioning');
  const [lennyMessage, setLennyMessage] = useState<string>("Let's find the clue!");
  const [lennySubText, setLennySubText] = useState<string | undefined>("Read the question and pick an answer.");

  const [showClueHint, setShowClueHint] = useState(false);
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
    micErrorMessage,
    durationSeconds
  } = useAudioRecorder();

  // Speech Recognition Check
  const {
    startCheck,
    isListening,
    wordResults,
    matchRatio,
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
    setLennyMood('questioning');
    setLennyMessage("Let's find the clue!");
    setLennySubText("Read the question and pick an answer.");
    setShowClueHint(false);
    setIsFirstTryCorrect(false);
    setActiveExpansion(questionData.fullSentenceExpansion);
    setActiveKoreanExpansion(questionData.koreanFullSentence);
    setHasPracticedWithoutMic(false);
    resetRecording();
    resetCheck();

    const timer = window.setTimeout(() => {
      onSpeakText("Let's find the clue!");
    }, 300);
    return () => {
      window.clearTimeout(timer);
      stopSpeaking();
    };
  }, [questionData.pageId]);

  // Handle updates to Lenny after recording or listening
  useEffect(() => {
    if (!isAnswerRevealed) return;

    if (hasPlayedAudioOnce || hasPracticedWithoutMic) {
      setLennyMood('happy');
      setLennyMessage("Well done! Tap Next Clue ▶");
      setLennySubText(undefined);
    } else if (hasRecording && !isRecording) {
      setLennyMood('happy');
      setLennyMessage("Now tap Listen 🎧 to hear yourself.");
      setLennySubText(undefined);
    }
  }, [isAnswerRevealed, hasRecording, isRecording, hasPlayedAudioOnce, hasPracticedWithoutMic]);

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
      setIsAnswerRevealed(true);
      setLennyMood('happy');

      if (isOpinionQuestion) {
        setLennyMessage("Great idea, Detective! Now say this:");
      } else {
        setLennyMessage("Great job, Detective! Now say this:");
      }
      setLennySubText(targetExpansion);

      // Read target sentence aloud
      onSpeakText(targetExpansion);
    } else {
      // Never a red X!
      setShowClueHint(true);

      if (newAttempt === 1) {
        setLennyMood('thinking');
        setLennyMessage("Hmm, look again!");
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

        setLennyMood('happy');
        setLennyMessage("Here is the answer. Let's say it together:");
        setLennySubText(targetExpansion);
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

  // Instructional state for the bottom button and its small Korean help line
  const getBottomButtonState = () => {
    if (canProceed) {
      return {
        text: 'Next Clue ▶',
        korean: null
      };
    }
    if (!isAnswerRevealed) {
      return {
        text: '☝️ Pick an answer first',
        korean: '먼저 답을 골라요'
      };
    }
    if (!hasRecording && !isMicUnavailable && !hasPracticedWithoutMic) {
      return {
        text: '☝️ Tap 🎤 Say it first',
        korean: '먼저 위의 🎤 Say it을 눌러 문장을 말해요'
      };
    }
    if (hasRecording && !hasPlayedAudioOnce && !isMicUnavailable && !hasPracticedWithoutMic) {
      return {
        text: '☝️ Tap Listen 🎧 first',
        korean: '먼저 Listen 🎧으로 내 목소리를 들어요'
      };
    }
    return {
      text: '☝️ Tap 🎤 Say it first',
      korean: '먼저 위의 🎤 Say it을 눌러 문장을 말해요'
    };
  };

  const bottomButtonState = getBottomButtonState();

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

      {/* Lenny Guide with Lenny's round face image + speech bubble, placed under scene card and above question card */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#8A4B14] flex items-center gap-1.5">
            <span>🔍</span> Detective Lenny
          </span>
          <div className="px-3.5 py-1 rounded-full bg-[#FFD13B] text-[#2D241E] text-xs font-extrabold shadow-xs">
            {questionData.level === 'Find it'
              ? 'Find it · 사실 확인'
              : questionData.level === 'Why?'
              ? 'Why? · 이유 추론'
              : 'Your idea · 내 생각'}
          </div>
        </div>
        <LennyGuide
          mood={lennyMood}
          speechText={lennyMessage}
          subText={lennySubText}
          onSpeak={() => onSpeakText(lennyMessage)}
          size="md"
        />
      </div>

      {/* Question in a white card in big bold text */}
      <div className="bg-white rounded-[24px] p-4 shadow-sm space-y-2.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D241E] leading-snug">
          {questionData.questionText}
        </h2>
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

      {/* Practice Saying the Sentence Card (Merged with Clue Found feedback) */}
      {isAnswerRevealed && (
        <div className="bg-white rounded-[24px] p-4 shadow-sm space-y-3 animate-in slide-in-from-bottom-2">
          {/* Green pill badge at top */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 text-xs font-extrabold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isOpinionQuestion ? "Great detective idea!" : "Clue found!"}</span>
            </div>
          </div>

          {/* Sentence Display: small label, big bold 18px English sentence, 16px brown Korean */}
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#2D241E]/70 block">
              Say this sentence:
            </span>
            <p className="text-[18px] font-extrabold text-[#2D241E] leading-snug">
              "{activeExpansion}"
            </p>
            <p className="text-[16px] font-bold text-[#8A4B14] leading-snug">
              {activeKoreanExpansion}
            </p>
          </div>

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

      {/* Bottom Next Action: Full-width orange pill [Next ▶] or instructional locked button */}
      <div className="pt-0.5 pb-0.5 text-center">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full min-h-[48px] rounded-full font-extrabold text-base flex items-center justify-center gap-2 transition-all ${
            canProceed
              ? 'bg-[#FF9436] hover:bg-[#F58625] text-white btn-3d-orange cursor-pointer'
              : 'bg-[#E5D7CC] text-[#8C7A6D] cursor-not-allowed shadow-none'
          }`}
        >
          <span>{bottomButtonState.text}</span>
          {canProceed && <ArrowRight className="w-5 h-5" />}
        </button>

        {/* Small Korean line under locked button (14px, brown). Hidden when unlocked. */}
        {!canProceed && bottomButtonState.korean && (
          <p className="text-[14px] text-[#8A4B14] font-bold text-center mt-1.5 leading-snug">
            {bottomButtonState.korean}
          </p>
        )}
      </div>
    </div>
  );
};

