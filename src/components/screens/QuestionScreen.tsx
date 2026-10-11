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

  const levelBadge = getLevelBadge();

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between p-3.5 space-y-3 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm uppercase tracking-wider text-amber-950 bg-amber-200/90 px-3 py-1 rounded-xl">
            Clue Check #{pageNumber}
          </span>
          <span className="text-sm font-semibold text-slate-600">
            Page {pageNumber} / {totalPages}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-xl text-sm font-bold border ${levelBadge.bg} shadow-xs`}>
          {levelBadge.label}
        </div>
      </div>

      {/* Picture (Smaller at the top of Question Screen, close to Lenny) */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] mx-auto shrink-0 shadow-xs">
        <StoryIllustration
          sceneId={`scene-${pageNumber}`}
          highlightClue={showClueHint}
        />
      </div>

      {/* Lenny Guide with Question / Expansion Speech Bubble */}
      <div className="space-y-2">
        <LennyGuide
          mood={isAnswerRevealed ? 'happy' : showClueHint ? 'thinking' : 'questioning'}
          speechText={lennyMessage}
          subText={lennySubText}
          onSpeak={() => onSpeakText(lennyMessage)}
        />

        {/* Clue Hint Box (Shown on first miss) */}
        {showClueHint && !isAnswerRevealed && (
          <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-2xl flex items-start gap-2 shadow-xs animate-in fade-in">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-950 font-medium">
              <span className="font-bold text-amber-800 block">Lenny's Clue Hint:</span>
              {questionData.hintText}
            </div>
          </div>
        )}
      </div>

      {/* Options Selection (2-3 picture/word answer buttons) */}
      <div className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {isOpinionQuestion ? "Select your idea:" : "Choose the clue answer:"}
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isTargetCorrect = isOpinionQuestion || opt.isCorrect;

            let buttonStyle = 'bg-white border-2 border-amber-200 hover:border-amber-400 text-slate-800 shadow-xs';
            if (isAnswerRevealed) {
              if (isTargetCorrect) {
                buttonStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow-md';
              } else if (isSelected) {
                buttonStyle = 'bg-amber-50 border-2 border-amber-300 text-slate-600 opacity-80';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-amber-100 border-2 border-amber-400 text-amber-950';
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswerRevealed}
                className={`min-h-[56px] w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 cursor-pointer ${buttonStyle} ${
                  isSuccessGreenFlash && isTargetCorrect ? 'animate-pulse' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1 bg-amber-50/80 rounded-xl border border-amber-200">
                    {opt.emoji}
                  </span>
                  <div>
                    <span className="text-base font-bold text-slate-900 block leading-snug">
                      {opt.text}
                    </span>
                  </div>
                </div>

                {isAnswerRevealed && isTargetCorrect && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-in zoom-in">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* [🎤 Say it] Section (Once answer is revealed) */}
      {isAnswerRevealed && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-300 p-3.5 rounded-2xl shadow-xs space-y-2.5 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Say it aloud · 말하기 연습</span>
            </div>
            <button
              type="button"
              onClick={() => onSpeakText(activeExpansion)}
              className="text-sm font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              Hear Lenny 🔊
            </button>
          </div>

          {/* Full Sentence Display */}
          <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-inner">
            <p className="text-lg font-extrabold text-slate-900 leading-snug">
              "{activeExpansion}"
            </p>
            <p className="text-base font-semibold text-slate-700 mt-1">
              {activeKoreanExpansion}
            </p>
          </div>

          {/* Microphone Recording Controls */}
          {micErrorMessage && (isMicUnavailable || hasPracticedWithoutMic) ? (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-900">
              <p className="font-semibold">{micErrorMessage}</p>
              {hasPracticedWithoutMic ? (
                <p className="mt-2 text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> I practiced saying it aloud! 👍
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setHasPracticedWithoutMic(true)}
                  className="mt-2 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-sm font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  I practiced saying it! 👍
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Requirement 3: Microphone Help for Kids (shown before the very first recording in the app) */}
              {!hasRecordedSuccessfully && !hasRecording && (
                <div className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl text-center space-y-0.5 animate-in fade-in">
                  <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                    Your browser may ask to use the microphone. Ask a parent or teacher to tap 'Allow'.
                  </p>
                  <p className="text-xs font-semibold text-amber-800 leading-tight">
                    마이크 허용 창이 뜨면 선생님이나 부모님께 '허용'을 눌러 달라고 하세요.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 min-h-[50px] bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Mic className="w-5 h-5" />
                    <span>{hasRecording ? '🎤 Say it again' : '🎤 Say it'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 min-h-[50px] bg-red-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md animate-pulse ring-2 ring-red-400 cursor-pointer"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Recording ({durationSeconds}s) · Tap to Stop ⏹</span>
                  </button>
                )}

                {/* Play Recorded Voice */}
                {hasRecording && !isRecording && (
                  <button
                    type="button"
                    onClick={playRecording}
                    className={`min-h-[50px] px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border-2 transition active:scale-95 cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white border-amber-300 text-amber-950 hover:bg-amber-50'
                    }`}
                    aria-label="Play your recording"
                  >
                    {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>Listen 🎧</span>
                  </button>
                )}
              </div>

              {/* Requirement 4: Hint under buttons */}
              {hasRecording && !hasPlayedAudioOnce && (
                <p className="text-sm text-amber-800 font-semibold text-center animate-pulse">
                  Record, then listen to yourself 🎧
                </p>
              )}

              {/* Speech Check Button [🟢 Check my words] */}
              {hasRecording && !isRecording && (
                <div className="pt-1 border-t border-amber-200">
                  {!isListening ? (
                    <button
                      type="button"
                      onClick={() => startCheck(activeExpansion)}
                      className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🟢 Check my words</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full min-h-[46px] rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Listening... Say the sentence now!</span>
                    </button>
                  )}

                  {speechRecognitionError && (
                    <p className="text-sm text-slate-600 mt-1.5 text-center font-medium">
                      {speechRecognitionError}
                    </p>
                  )}

                  {/* Speech Recognition Results Display */}
                  {wordResults && matchRatio && (
                    <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-300 space-y-1.5 text-center">
                      <p className="text-sm font-bold text-emerald-900">
                        Lenny: "Great! {matchRatio.matched} / {matchRatio.total} words!"
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1 text-base font-bold">
                        {wordResults.map((w, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded ${
                              w.matched
                                ? 'bg-emerald-100 text-emerald-800'
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

      {/* Bottom Next Action */}
      <div className="pt-1 pb-1">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full min-h-[52px] rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
            canProceed
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25 ring-2 ring-emerald-400/50 cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
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
