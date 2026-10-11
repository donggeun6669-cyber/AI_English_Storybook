import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CoverGuess } from '../../types/story';
import { CASE_CLOSED_CARDS, SENTENCE_BUILDER_DATA, StoryOrderCard } from '../../data/storyData';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { useSpeechRecognition } from '../speech/useSpeechRecognition';
import {
  CheckCircle2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
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
  hasRecordedSuccessfully?: boolean;
  onRecordSuccess?: () => void;
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
  onSpeakText,
  hasRecordedSuccessfully = false,
  onRecordSuccess
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
  const [slot1WrongCount, setSlot1WrongCount] = useState<number>(0);
  const [slot2WrongCount, setSlot2WrongCount] = useState<number>(0);
  const [wobblingChipId, setWobblingChipId] = useState<string | null>(null);
  const [lennySentenceAdvice, setLennySentenceAdvice] = useState<string | null>(null);
  const [hasPracticedWithoutMic, setHasPracticedWithoutMic] = useState<boolean>(false);

  // Recording state
  const {
    startRecording,
    stopRecording,
    playRecording,
    hasRecording,
    hasPlayedAudioOnce,
    isRecording,
    isPlaying,
    isMicUnavailable,
    setIsMicUnavailable,
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

  // Track successful recording
  useEffect(() => {
    if (hasRecording) {
      onRecordSuccess?.();
    }
  }, [hasRecording, onRecordSuccess]);

  // Validation rules
  const isSentenceCorrect = selectedSlot1 === 'magpie' && selectedSlot2 === 'shiny';
  const isSpeechFinished =
    (hasRecording && hasPlayedAudioOnce) || isMicUnavailable || hasPracticedWithoutMic;
  const isAllCompleted = isSequenceCorrect && isSentenceCorrect && isSpeechFinished;

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
    if (selectedCardIds.includes(card.id)) return;

    const nextExpectedStep = selectedCardIds.length + 1;

    if (card.stepNumber === nextExpectedStep) {
      const nextSequence = [...selectedCardIds, card.id];
      setSelectedCardIds(nextSequence);
      setLennyCardAdvice(null);

      if (nextSequence.length === 4) {
        setIsSequenceCorrect(true);
        onSpeakText("Great job! The story is in the right order!");
      }
    } else {
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

  // Handle Slot 1 Chip Click
  const handleSlot1Click = (chipId: string) => {
    if (chipId === 'magpie') {
      setSelectedSlot1('magpie');
      setLennySentenceAdvice(null);
    } else {
      setWobblingChipId(chipId);
      setSlot1WrongCount((c) => c + 1);
      const advice = "Hmm, who left black-and-white feathers?";
      setLennySentenceAdvice(advice);
      onSpeakText(advice);
      setTimeout(() => setWobblingChipId(null), 500);
    }
  };

  // Handle Slot 2 Chip Click
  const handleSlot2Click = (chipId: string) => {
    if (chipId === 'shiny') {
      setSelectedSlot2('shiny');
      setLennySentenceAdvice(null);
    } else {
      setWobblingChipId(chipId);
      setSlot2WrongCount((c) => c + 1);
      const advice = "Hmm, what do magpies love?";
      setLennySentenceAdvice(advice);
      onSpeakText(advice);
      setTimeout(() => setWobblingChipId(null), 500);
    }
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
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-bold uppercase shadow-xs mb-1">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>Case Conclusion · 최종 수사</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Case Closed! 🔍
        </h2>
        <p className="text-sm font-semibold text-slate-600">
          Put the story in order and build your detective report.
        </p>
      </div>

      {/* SECTION 1: 4 Story Cards Sequencing */}
      <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-amber-950 uppercase">
            <span>1. Story Timeline (Tap in order 1 → 4)</span>
          </div>
          {isSequenceCorrect ? (
            <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ordered!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResetCards}
              className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {/* Lenny guidance on card sequencing */}
        {lennyCardAdvice && !isSequenceCorrect && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900 font-semibold animate-in fade-in">
            <span className="text-lg">🔍</span>
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
                className={`min-h-[85px] p-2.5 rounded-xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between cursor-pointer ${
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
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {orderIndex + 1}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-sm font-bold leading-tight line-clamp-1">{card.title}</p>
                  <p className="text-sm text-slate-600 leading-tight line-clamp-2 mt-0.5">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCardIds.length > 0 && !isSequenceCorrect && (
          <p className="text-sm font-medium text-amber-900 text-center">
            {`Ordered: ${selectedCardIds.length} / 4 cards`}
          </p>
        )}
      </div>

      {/* SECTION 2: Sentence Builder & Speech */}
      <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-amber-950 uppercase">
            2. Detective Conclusion Sentence
          </span>
          {isSentenceCorrect && (
            <button
              type="button"
              onClick={() => onSpeakText(finalSentence)}
              className="text-sm font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              Listen 🔊
            </button>
          )}
        </div>

        {/* Lenny guidance for sentence builder */}
        {lennySentenceAdvice && !isSentenceCorrect && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900 font-semibold animate-in fade-in">
            <span className="text-lg">🔍</span>
            <span>Lenny: "{lennySentenceAdvice}"</span>
          </div>
        )}

        {/* Sentence Display Area */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-base font-extrabold text-slate-900 leading-relaxed shadow-inner">
          "I think the{' '}
          <span className="underline decoration-amber-500 decoration-3 font-black text-amber-950">
            {slot1Text}
          </span>{' '}
          took the mascot because{' '}
          <span className="underline decoration-amber-500 decoration-3 font-black text-amber-950">
            {slot2Text}
          </span>
          ."
        </div>

        {/* Slot 1 Chips: Who */}
        <div className="space-y-1.5">
          <span className="text-sm font-bold text-slate-600 uppercase">Who took it?</span>
          <div className="flex flex-wrap gap-2">
            {SENTENCE_BUILDER_DATA.slot1.map((item) => {
              const isSelected = selectedSlot1 === item.id;
              const isWobbling = wobblingChipId === item.id;
              const shouldGlow = item.id === 'magpie' && slot1WrongCount >= 2 && !selectedSlot1;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSlot1Click(item.id)}
                  className={`min-h-[46px] px-3.5 py-2 rounded-xl text-sm font-bold border transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                    isWobbling ? 'animate-shake' : ''
                  } ${
                    shouldGlow ? 'ring-4 ring-amber-400 bg-amber-100 border-amber-500 animate-pulse' : ''
                  } ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot 2 Chips: Why */}
        <div className="space-y-1.5">
          <span className="text-sm font-bold text-slate-600 uppercase">Why did it take it?</span>
          <div className="flex flex-wrap gap-2">
            {SENTENCE_BUILDER_DATA.slot2.map((item) => {
              const isSelected = selectedSlot2 === item.id;
              const isWobbling = wobblingChipId === item.id;
              const shouldGlow = item.id === 'shiny' && slot2WrongCount >= 2 && !selectedSlot2;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSlot2Click(item.id)}
                  className={`min-h-[46px] px-3.5 py-2 rounded-xl text-sm font-bold border transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                    isWobbling ? 'animate-shake' : ''
                  } ${
                    shouldGlow ? 'ring-4 ring-amber-400 bg-amber-100 border-amber-500 animate-pulse' : ''
                  } ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* [🎤 Say it] Practice (Enabled only after the sentence is correct) */}
        {isSentenceCorrect && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="text-sm font-bold text-slate-700 block">
              Say your final report out loud:
            </span>

            {/* Microphone Help for Kids (shown before the very first recording in the app) */}
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

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 min-h-[50px] bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>{hasRecording ? '🎤 Say it again' : '🎤 Say it'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 min-h-[50px] bg-red-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md animate-pulse cursor-pointer"
                >
                  <MicOff className="w-5 h-5" />
                  <span>Recording ({durationSeconds}s) · Tap to Stop</span>
                </button>
              )}

              {hasRecording && !isRecording && (
                <button
                  type="button"
                  onClick={playRecording}
                  className={`min-h-[50px] px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 border-2 transition active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white border-amber-300 text-amber-950 hover:bg-amber-50'
                  }`}
                >
                  {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Listen 🎧</span>
                </button>
              )}
            </div>

            {/* Hint under buttons */}
            {hasRecording && !hasPlayedAudioOnce && (
              <p className="text-sm text-amber-800 font-semibold text-center animate-pulse">
                Record, then listen to yourself 🎧
              </p>
            )}

            {(isMicUnavailable || hasPracticedWithoutMic) && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-900 flex items-center justify-between">
                <span>Mic not available on device.</span>
                {hasPracticedWithoutMic ? (
                  <span className="text-emerald-700 font-bold text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Practiced!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHasPracticedWithoutMic(true)}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-sm cursor-pointer"
                  >
                    I said it! 👍
                  </button>
                )}
              </div>
            )}

            {/* Requirement 9: Speech Check Button [🟢 Check my words] */}
            {hasRecording && !isRecording && (
              <div className="pt-1.5 border-t border-amber-200">
                {!isListening ? (
                  <button
                    type="button"
                    onClick={() => startCheck(finalSentence)}
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

      {/* FINAL BADGE & REPORT (Item 10: exact PRD labels) */}
      {isAllCompleted && (
        <div className="bg-gradient-to-b from-amber-100 to-amber-200/90 rounded-3xl p-4 border-3 border-amber-400 shadow-lg text-center space-y-3 animate-in zoom-in-95">
          {/* Badge Icon and Exact Heading: "Case closed!" next to Detective Badge */}
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-4xl animate-bounce-slow">🏅</span>
            <h3 className="text-2xl font-extrabold text-amber-950 font-display">
              Case closed!
            </h3>
          </div>

          <p className="text-sm font-semibold text-amber-900">
            Detective Badge Earned · Grade 5–6 Mystery Solver
          </p>

          {/* Comparison: Cover Guess vs Real Culprit */}
          <div className="bg-white/95 rounded-2xl p-3.5 border border-amber-300 text-left space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">Your Cover Guess:</span>
              <span className="font-extrabold text-slate-900">
                {coverGuess ? `${guessMap[coverGuess].emoji} ${guessMap[coverGuess].label}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-amber-100 pt-1.5">
              <span className="font-semibold text-slate-600">Real Culprit:</span>
              <span className="font-extrabold text-amber-950">🐦 The Magpie (loves shiny buttons!)</span>
            </div>
            {coverGuess === 'bird' ? (
              <p className="text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg text-center mt-1">
                🎯 Wow! Your detective instinct was spot on from the start!
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg text-center mt-1">
                🔍 Great detective work following the clues to the real answer!
              </p>
            )}
          </div>

          {/* Metrics summary: Exact PRD strings */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="bg-white/95 rounded-xl p-3 border border-amber-300">
              <span className="text-xs font-bold text-slate-500 uppercase block">SCORED ACCURACY</span>
              <p className="text-base font-extrabold text-amber-950 mt-0.5">
                Clues found: {cluesFoundScore} / 10
              </p>
            </div>

            <div className="bg-white/95 rounded-xl p-3 border border-amber-300">
              <span className="text-xs font-bold text-slate-500 uppercase block">FADING INDEPENDENCE</span>
              <p className="text-sm font-extrabold text-amber-950 mt-0.5">
                Word taps: Ch.1 {wordTapsByChapter[1]} → Ch.2 {wordTapsByChapter[2]} → Ch.3 {wordTapsByChapter[3]}
              </p>
            </div>
          </div>

          {/* Action Buttons: [Replay Case] and [Home] */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onReplayCase}
              className="min-h-[50px] rounded-2xl bg-white border-2 border-amber-400 text-amber-950 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-amber-50 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Replay Case</span>
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="min-h-[50px] rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
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
