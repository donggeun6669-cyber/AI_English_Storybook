import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CoverGuess } from '../../types/story';
import { CASE_CLOSED_CARDS, SENTENCE_BUILDER_DATA, StoryOrderCard } from '../../data/storyData';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { LennyGuide } from '../LennyGuide';
import {
  Award,
  CheckCircle2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Home,
  RefreshCw,
  Trophy
} from 'lucide-react';

interface CaseClosedScreenProps {
  coverGuess: CoverGuess | null;
  cluesFoundScore: number; // out of 10
  wordTapsByChapter: { 1: number; 2: number; 3: number };
  onReplayCase: () => void;
  onGoHome: () => void;
  onSpeakText: (text: string) => void;
}

// Randomly shuffle cards ensuring they are never initially in the correct order [1, 2, 3, 4]
const getShuffledCards = (): StoryOrderCard[] => {
  const cards = [...CASE_CLOSED_CARDS];
  let shuffled: StoryOrderCard[] = [];
  do {
    shuffled = [...cards].sort(() => Math.random() - 0.5);
  } while (shuffled.every((c, idx) => c.stepNumber === idx + 1));
  return shuffled;
};

export const CaseClosedScreen: React.FC<CaseClosedScreenProps> = ({
  coverGuess,
  cluesFoundScore,
  wordTapsByChapter,
  onReplayCase,
  onGoHome,
  onSpeakText
}) => {
  // Top Half: 4 cards sequencing state
  const [shuffledCards, setShuffledCards] = useState<StoryOrderCard[]>(() => getShuffledCards());
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [isSequenceCorrect, setIsSequenceCorrect] = useState(false);
  const [shakingCardId, setShakingCardId] = useState<number | null>(null);
  const [lennyCardAdvice, setLennyCardAdvice] = useState<string | null>(null);

  // Bottom Half: Sentence Chips Builder
  const [selectedSlot1, setSelectedSlot1] = useState<string | null>(null);
  const [selectedSlot2, setSelectedSlot2] = useState<string | null>(null);

  // Recording state
  const {
    startRecording,
    stopRecording,
    playRecording,
    hasRecording,
    isRecording,
    isPlaying,
    isMicUnavailable,
    setIsMicUnavailable,
    durationSeconds
  } = useAudioRecorder();

  // Full conclusion unlock check
  const isSentenceBuilt = selectedSlot1 !== null && selectedSlot2 !== null;
  const isSpeechFinished = hasRecording || isMicUnavailable;
  const isAllCompleted = isSequenceCorrect && isSentenceBuilt && isSpeechFinished;

  // Trigger confetti when completed
  useEffect(() => {
    if (isAllCompleted) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
      onSpeakText("Case closed! Wonderful job, Detective! You solved the missing mascot mystery!");
    }
  }, [isAllCompleted]);

  // Handle card tap for sequencing
  const handleCardTap = (card: StoryOrderCard) => {
    if (isSequenceCorrect) return;

    // Already tapped and accepted
    if (selectedCardIds.includes(card.id)) return;

    const nextExpectedStep = selectedCardIds.length + 1;

    if (card.stepNumber === nextExpectedStep) {
      // Correct next step!
      const nextSequence = [...selectedCardIds, card.id];
      setSelectedCardIds(nextSequence);
      setLennyCardAdvice(null);

      if (nextSequence.length === 4) {
        setIsSequenceCorrect(true);
        onSpeakText("Great job! The story is in the right order!");
      }
    } else {
      // Not the next correct event: Lenny guides, card shakes gently, no red X, tap not accepted
      setLennyCardAdvice("Hmm, what happened before that?");
      onSpeakText("Hmm, what happened before that?");
      setShakingCardId(card.id);
      setTimeout(() => {
        setShakingCardId(null);
      }, 500);
    }
  };

  const handleResetCards = () => {
    setSelectedCardIds([]);
    setIsSequenceCorrect(false);
    setShakingCardId(null);
    setLennyCardAdvice(null);
    setShuffledCards(getShuffledCards());
  };

  // Full built sentence
  const slot1Text = SENTENCE_BUILDER_DATA.slot1.find((s) => s.id === selectedSlot1)?.text || '___';
  const slot2Text = SENTENCE_BUILDER_DATA.slot2.find((s) => s.id === selectedSlot2)?.text || '___';
  const finalSentence = `I think the ${slot1Text} took the mascot because ${slot2Text}.`;

  // Cover guess display name
  const guessMap: Record<CoverGuess, { label: string; emoji: string }> = {
    boy: { label: 'A Boy', emoji: '👦' },
    dog: { label: 'A Dog', emoji: '🐶' },
    bird: { label: 'A Bird', emoji: '🐦' }
  };

  return (
    <div className="flex flex-col h-full min-h-[620px] justify-between p-3.5 space-y-4 pb-6 overflow-y-auto">
      {/* Top Title Banner */}
      <div className="text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase shadow-xs mb-1">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Case Conclusion · 최종 수사</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Case Closed! 🔍
        </h2>
        <p className="text-xs font-semibold text-slate-500">
          Put the story in order and build your detective report.
        </p>
      </div>

      {/* SECTION 1: 4 Story Cards Sequencing */}
      <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase">
            <span>1. Story Timeline (Tap in order 1 → 4)</span>
          </div>
          {isSequenceCorrect ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ordered!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResetCards}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Lenny gentle guidance on wrong card tap */}
        {lennyCardAdvice && !isSequenceCorrect && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold animate-in fade-in">
            <span className="text-base">🔍</span>
            <span>Lenny: "{lennyCardAdvice}"</span>
          </div>
        )}

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 gap-2">
          {shuffledCards.map((card) => {
            const orderIndex = selectedCardIds.indexOf(card.id);
            const isSelected = orderIndex !== -1;
            const isShaking = shakingCardId === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardTap(card)}
                className={`min-h-[80px] p-2.5 rounded-xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between ${
                  isShaking ? 'animate-shake' : ''
                } ${
                  isSequenceCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : isSelected
                    ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl">{card.emoji}</span>
                  {/* Order badge is only shown AFTER card is tapped and accepted */}
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {orderIndex + 1}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-xs font-bold leading-tight line-clamp-1">{card.title}</p>
                  <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 mt-0.5">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCardIds.length > 0 && !isSequenceCorrect && (
          <p className="text-[11px] font-medium text-amber-800 text-center">
            {`Ordered: ${selectedCardIds.length} / 4 cards`}
          </p>
        )}
      </div>

      {/* SECTION 2: Sentence Builder & Speech */}
      <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-amber-900 uppercase">
            2. Detective Conclusion Sentence
          </span>
          {isSentenceBuilt && (
            <button
              type="button"
              onClick={() => onSpeakText(finalSentence)}
              className="text-[11px] font-bold text-amber-700 underline"
            >
              Listen 🔊
            </button>
          )}
        </div>

        {/* Sentence Display Area */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm font-extrabold text-slate-900 leading-relaxed shadow-inner">
          "I think the{' '}
          <span className="underline decoration-amber-500 decoration-2 font-black text-amber-900">
            {slot1Text}
          </span>{' '}
          took the mascot because{' '}
          <span className="underline decoration-amber-500 decoration-2 font-black text-amber-900">
            {slot2Text}
          </span>
          ."
        </div>

        {/* Slot 1 Chips: Who */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Who took it?</span>
          <div className="flex flex-wrap gap-1.5">
            {SENTENCE_BUILDER_DATA.slot1.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSlot1(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 flex items-center gap-1 ${
                  selectedSlot1 === item.id
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slot 2 Chips: Why */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Why did it take it?</span>
          <div className="flex flex-wrap gap-1.5">
            {SENTENCE_BUILDER_DATA.slot2.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSlot2(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 flex items-center gap-1 ${
                  selectedSlot2 === item.id
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* [🎤 Say it] Practice */}
        {isSentenceBuilt && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Say your final report out loud:
            </span>
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 min-h-[44px] bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>{hasRecording ? 'Say it Again 🎤' : 'Say it now 🎤'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 min-h-[44px] bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Recording ({durationSeconds}s) · Tap to Stop</span>
                </button>
              )}

              {hasRecording && !isRecording && (
                <button
                  type="button"
                  onClick={playRecording}
                  className="min-h-[44px] px-3.5 bg-white border-2 border-amber-300 text-amber-900 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-amber-50 transition active:scale-95"
                >
                  {isPlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>Hear Me</span>
                </button>
              )}
            </div>

            {isMicUnavailable && (
              <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-900 flex items-center justify-between">
                <span>Mic not available on device.</span>
                <button
                  type="button"
                  onClick={() => setIsMicUnavailable(false)}
                  className="px-2 py-0.5 bg-sky-600 text-white font-bold rounded text-[10px]"
                >
                  I said it! 👍
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FINAL BADGE & REPORT (Revealed when both parts are completed) */}
      {isAllCompleted && (
        <div className="bg-gradient-to-b from-amber-100 to-amber-200/90 rounded-3xl p-4 border-3 border-amber-400 shadow-lg text-center space-y-3 animate-in zoom-in-95">
          {/* Badge Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white shadow-md flex items-center justify-center text-3xl animate-bounce-slow">
            🏅
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-amber-950 font-display">
              Junior Detective Badge Earned!
            </h3>
            <p className="text-xs font-semibold text-amber-800">
              Grade 5–6 Mystery Solver Certificate
            </p>
          </div>

          {/* Comparison: Cover Guess vs Real Culprit */}
          <div className="bg-white/90 rounded-2xl p-3 border border-amber-300 text-left space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Your Cover Guess:</span>
              <span className="font-extrabold text-slate-800">
                {coverGuess ? `${guessMap[coverGuess].emoji} ${guessMap[coverGuess].label}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-amber-100 pt-1">
              <span className="font-semibold text-slate-500">Real Culprit:</span>
              <span className="font-extrabold text-amber-900">🐦 The Magpie (loves shiny buttons!)</span>
            </div>
            {coverGuess === 'bird' ? (
              <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg text-center mt-1">
                🎯 Wow! Your detective instinct was spot on from the start!
              </p>
            ) : (
              <p className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg text-center mt-1">
                🔍 Great detective work following the clues to the real answer!
              </p>
            )}
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="bg-white/90 rounded-xl p-2.5 border border-amber-300">
              <span className="text-[10px] font-bold text-slate-500 block">CLUES FOUND</span>
              <p className="text-base font-extrabold text-amber-900">
                {cluesFoundScore} / 10
              </p>
              <span className="text-[10px] text-slate-500 font-medium">First-try accuracy</span>
            </div>

            <div className="bg-white/90 rounded-xl p-2.5 border border-amber-300">
              <span className="text-[10px] font-bold text-slate-500 block">HELP FADING</span>
              <p className="text-xs font-extrabold text-amber-900 mt-1">
                Ch.1: {wordTapsByChapter[1]} → Ch.2: {wordTapsByChapter[2]} → Ch.3: {wordTapsByChapter[3]}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">Word taps per chapter</span>
            </div>
          </div>

          {/* Action Buttons: [Replay Case] and [Home] */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onReplayCase}
              className="min-h-[48px] rounded-2xl bg-white border-2 border-amber-400 text-amber-900 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-amber-50 shadow-xs transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Replay Case</span>
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="min-h-[48px] rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
