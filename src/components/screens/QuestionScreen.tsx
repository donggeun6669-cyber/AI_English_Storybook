import React, { useState, useEffect } from 'react';
import { QuestionData } from '../../types/story';
import { LennyGuide } from '../LennyGuide';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { Check, Mic, MicOff, Play, RotateCcw, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

interface QuestionScreenProps {
  questionData: QuestionData;
  pageNumber: number;
  totalPages: number;
  onQuestionCompleted: (wasFirstTryCorrect: boolean) => void;
  onSpeakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionData,
  pageNumber,
  totalPages,
  onQuestionCompleted,
  onSpeakText,
  stopSpeaking
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

  // Audio recording for [🎤 Say it]
  const {
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
    isRecording,
    isPlaying,
    hasRecording,
    isMicUnavailable,
    setIsMicUnavailable,
    micErrorMessage,
    durationSeconds
  } = useAudioRecorder();

  const isOpinionQuestion = questionData.level === 'Your idea';

  // Read out question when opening
  useEffect(() => {
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
    onQuestionCompleted(isFirstTryCorrect);
  };

  // Next is enabled only after one recording OR if mic is unavailable / user confirmed
  const canProceed = isAnswerRevealed && (hasRecording || isMicUnavailable);

  // Badge styling for level tags
  const getLevelBadge = () => {
    switch (questionData.level) {
      case 'Find it':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: 'Find it · 사실 확인'
        };
      case 'Why?':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Why? · 이유 추론'
        };
      case 'Your idea':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          label: 'Your idea · 내 생각'
        };
    }
  };

  const levelBadge = getLevelBadge();

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between p-3.5 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg">
            Clue Check #{pageNumber}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Page {pageNumber} / {totalPages}
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${levelBadge.bg} shadow-xs`}>
          {levelBadge.label}
        </div>
      </div>

      {/* Lenny Guide with Question / Expansion Speech Bubble */}
      <div className="space-y-3">
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
            <div className="text-xs text-amber-950 font-medium">
              <span className="font-bold text-amber-800 block">Lenny's Detective Clue:</span>
              {questionData.hintText}
            </div>
          </div>
        )}
      </div>

      {/* Options Selection (2-3 picture/word answer buttons) */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isOpinionQuestion ? "Select your idea:" : "Choose the best clue answer:"}
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {questionData.options.map((opt) => {
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
                className={`min-h-[56px] w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 ${buttonStyle} ${
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Say it aloud · 말하기 연습</span>
            </div>
            <button
              type="button"
              onClick={() => onSpeakText(activeExpansion)}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
            >
              Hear Lenny 🔊
            </button>
          </div>

          {/* Full Sentence Display */}
          <div className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-inner">
            <p className="text-base font-extrabold text-slate-900 leading-snug">
              "{activeExpansion}"
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {activeKoreanExpansion}
            </p>
          </div>

          {/* Microphone Recording Controls */}
          {micErrorMessage && isMicUnavailable ? (
            <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900">
              <p className="font-semibold">{micErrorMessage}</p>
              <button
                type="button"
                onClick={() => setIsMicUnavailable(false)}
                className="mt-1.5 px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                I practiced saying it! 👍
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 min-h-[48px] bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Mic className="w-4 h-4" />
                  <span>{hasRecording ? 'Record Again 🎤' : 'Say it now 🎤'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 min-h-[48px] bg-red-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md animate-pulse ring-2 ring-red-400"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Recording ({durationSeconds}s) · Tap to Stop ⏹</span>
                </button>
              )}

              {/* Play Recorded Voice */}
              {hasRecording && !isRecording && (
                <button
                  type="button"
                  onClick={playRecording}
                  className={`min-h-[48px] px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border-2 transition active:scale-95 ${
                    isPlaying
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-50'
                  }`}
                  aria-label="Play your recording"
                >
                  {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Hear Me</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Next Action */}
      <div className="pt-1">
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
              : !hasRecording && !isMicUnavailable
              ? 'Record your voice to continue 🎤'
              : 'Next Clue ▶'}
          </span>
          {canProceed && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
