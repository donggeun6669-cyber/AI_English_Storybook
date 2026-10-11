import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CoverGuess } from '../../types/story';
import { CASE_CLOSED_CARDS, SENTENCE_BUILDER_DATA, StoryOrderCard } from '../../data/storyData';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { useSpeechRecognition } from '../speech/useSpeechRecognition';
import {
  Check,
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
    <div className="flex flex-col h-full min-h-[620px] justify-between p-3.5 space-y-4 pb-6 overflow-y-auto text-[#2D241E]">
      {/* Top Title Banner */}
      <div className="text-center pt-0.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFD13B] text-[#2D241E] text-xs font-extrabold uppercase shadow-xs mb-1">
          <Trophy className="w-3.5 h-3.5 text-[#8A4B14]" />
          <span>Case Conclusion · 최종 수사</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D241E] tracking-tight">
          Case Closed! 🔍
        </h2>
        <p className="text-xs sm:text-sm font-bold text-[#8A4B14]">
          Put the story in order and build your detective report.
        </p>
      </div>

      {/* SECTION 1: 4 Story Cards Sequencing in a 2x2 Grid */}
      <div className="bg-white rounded-[24px] p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#2D241E] uppercase">
            <span>1. Story Timeline (Tap in order 1 → 4)</span>
          </div>
          {isSequenceCorrect ? (
            <span className="px-3 py-1 rounded-full bg-[#4CAF50] text-white text-xs font-extrabold shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4 / 4 Completed
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {selectedCardIds.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FCE9DA] text-[#8A4B14] text-xs font-extrabold">
                  {selectedCardIds.length} / 4 Completed
                </span>
              )}
              <button
                type="button"
                onClick={handleResetCards}
                className="text-xs font-extrabold text-[#8A4B14] hover:text-[#2D241E] flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          )}
        </div>

        {/* Lenny guidance on card sequencing */}
        {lennyCardAdvice && !isSequenceCorrect && (
          <div className="flex items-center gap-2 p-2.5 bg-[#FCE9DA] rounded-[18px] text-xs sm:text-sm text-[#8A4B14] font-bold animate-in fade-in">
            <span className="text-base">🔍</span>
            <span>Lenny: "{lennyCardAdvice}"</span>
          </div>
        )}

        {/* 2x2 Cards Grid of rounded white cards */}
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
                className={`min-h-[88px] p-2.5 rounded-[24px] text-left transition-all active:scale-95 flex flex-col justify-between cursor-pointer relative shadow-xs ${
                  isShaking ? 'animate-shake' : ''
                } ${
                  isSequenceCorrect
                    ? 'bg-green-50/90 border-2 border-[#4CAF50] text-[#2D241E]'
                    : isSelected
                    ? 'bg-[#FFD13B]/40 ring-2 ring-[#FFD13B] text-[#2D241E]'
                    : 'bg-[#FDF3EA]/60 hover:bg-[#FDF3EA] text-[#2D241E]'
                }`}
              >
                {card.image && (
                  <img
                    src={card.image}
                    alt=""
                    className="w-full aspect-[4/3] object-cover rounded-[16px] mb-1.5 select-none"
                    draggable={false}
                  />
                )}
                <div className="flex items-center justify-between w-full">
                  {!card.image && <span className="text-2xl">{card.emoji}</span>}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#4CAF50] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {isSequenceCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : orderIndex + 1}
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-xs sm:text-sm font-extrabold leading-tight line-clamp-1">{card.title}</p>
                  <p className="text-[11px] font-semibold text-[#2D241E]/70 leading-tight line-clamp-2 mt-0.5">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: "Lenny's Detective Deduction" card with yellow & green pills */}
      <div className="bg-white rounded-[24px] p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-extrabold text-[#2D241E] uppercase">
            Lenny's Detective Deduction
          </span>
          {isSentenceCorrect && (
            <button
              type="button"
              onClick={() => onSpeakText(finalSentence)}
              className="text-xs font-extrabold text-[#8A4B14] hover:text-[#2D241E] underline cursor-pointer"
            >
              Listen 🔊
            </button>
          )}
        </div>

        {/* Lenny guidance for sentence builder */}
        {lennySentenceAdvice && !isSentenceCorrect && (
          <div className="flex items-center gap-2 p-2.5 bg-[#FCE9DA] rounded-[18px] text-xs sm:text-sm text-[#8A4B14] font-bold animate-in fade-in">
            <span className="text-base">🔍</span>
            <span>Lenny: "{lennySentenceAdvice}"</span>
          </div>
        )}

        {/* Deduction Sentence Area with yellow & green pills */}
        <div className="p-3.5 bg-[#FDF3EA] rounded-[20px] text-base font-extrabold text-[#2D241E] leading-relaxed shadow-inner">
          I think the{' '}
          {selectedSlot1 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFD13B] text-[#2D241E] font-extrabold text-sm mx-1 shadow-xs">
              {slot1Text}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border border-dashed border-[#8A4B14] text-[#8A4B14] text-xs font-bold mx-1">
              [who?]
            </span>
          )}{' '}
          took the mascot because{' '}
          {selectedSlot2 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4CAF50] text-white font-extrabold text-sm mx-1 shadow-xs">
              {slot2Text}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border border-dashed border-[#8A4B14] text-[#8A4B14] text-xs font-bold mx-1">
              [why?]
            </span>
          )}
          .
        </div>

        {/* Slot 1 Chips: Who (Culprit) */}
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-[#8A4B14] uppercase">Who took it?</span>
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
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isWobbling ? 'animate-shake' : ''
                  } ${
                    shouldGlow ? 'ring-4 ring-[#FFD13B] bg-[#FFD13B]/60' : ''
                  } ${
                    isSelected
                      ? 'bg-[#FFD13B] text-[#2D241E] ring-2 ring-[#FF9436]'
                      : 'bg-[#FDF3EA] hover:bg-[#FCE9DA] text-[#2D241E]'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot 2 Chips: Why (Reason) */}
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-[#8A4B14] uppercase">Why did it take it?</span>
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
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isWobbling ? 'animate-shake' : ''
                  } ${
                    shouldGlow ? 'ring-4 ring-[#FFD13B] bg-[#FFD13B]/60' : ''
                  } ${
                    isSelected
                      ? 'bg-[#4CAF50] text-white ring-2 ring-[#4CAF50]/40'
                      : 'bg-[#FDF3EA] hover:bg-[#FCE9DA] text-[#2D241E]'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* [🎤 Say it] Practice (Orange full-width pill once sentence is correct) */}
        {isSentenceCorrect && (
          <div className="pt-2 border-t border-[#FCE9DA] space-y-2.5">
            <span className="text-xs font-extrabold text-[#2D241E] uppercase block">
              Say your final report out loud:
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

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 min-h-[48px] bg-[#FF9436] hover:bg-[#F58625] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 btn-3d-orange transition active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{hasRecording ? '🎤 Say again' : '🎤 Say it'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 min-h-[48px] bg-rose-500 text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 shadow-md animate-pulse ring-2 ring-rose-400 cursor-pointer"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Stop ({durationSeconds}s) ⏹</span>
                </button>
              )}

              {hasRecording && !isRecording && (
                <button
                  type="button"
                  onClick={playRecording}
                  className={`min-h-[48px] px-4 rounded-full font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-[#8A4B14] text-white'
                      : 'bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#2D241E]'
                  }`}
                >
                  {isPlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current text-[#8A4B14]" />}
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

            {(isMicUnavailable || hasPracticedWithoutMic) && (
              <div className="p-3 bg-[#FCE9DA]/70 rounded-[18px] text-xs font-bold text-[#2D241E] flex items-center justify-between">
                <span>Mic not available on device.</span>
                {hasPracticedWithoutMic ? (
                  <span className="text-[#4CAF50] font-extrabold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" /> Practiced!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHasPracticedWithoutMic(true)}
                    className="px-3.5 py-1.5 bg-[#FF9436] hover:bg-[#F58625] text-white font-extrabold rounded-full btn-3d-orange text-xs cursor-pointer"
                  >
                    I said it! 👍
                  </button>
                )}
              </div>
            )}

            {/* Speech Check Button [🟢 Check my words] */}
            {hasRecording && !isRecording && (
              <div className="pt-1.5 border-t border-[#FCE9DA]">
                {!isListening ? (
                  <button
                    type="button"
                    onClick={() => startCheck(finalSentence)}
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

      {/* Result card: badge icon in a yellow circle, JUNIOR DETECTIVE BADGE, Case closed!, Your guess / Answer row, Clues found progress bar, Word taps boxes, [Replay Case] & [Home] buttons */}
      {isAllCompleted && (
        <div className="bg-white rounded-[24px] p-5 shadow-sm text-center space-y-3.5 animate-in zoom-in-95">
          {/* Badge icon in a yellow circle */}
          <div className="w-16 h-16 rounded-full bg-[#FFD13B] flex items-center justify-center text-3xl mx-auto shadow-xs">
            🏅
          </div>

          <div>
            <span className="text-xs font-extrabold text-[#8A4B14] tracking-wider uppercase block">
              JUNIOR DETECTIVE BADGE
            </span>
            <h3 className="text-2xl font-extrabold text-[#2D241E] mt-0.5">
              Case closed!
            </h3>
            <p className="text-xs font-bold text-[#8A4B14] mt-0.5">
              Grade 5–6 Mystery Solver
            </p>
          </div>

          {/* Your guess / Answer row */}
          <div className="bg-[#FDF3EA] rounded-[18px] p-3 text-left space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-[#8A4B14]">Your guess:</span>
              <span className="font-extrabold text-[#2D241E]">
                {coverGuess ? `${guessMap[coverGuess].emoji} ${guessMap[coverGuess].label}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm border-t border-[#FCE9DA] pt-1.5">
              <span className="font-bold text-[#8A4B14]">Answer:</span>
              <span className="font-extrabold text-[#2D241E]">🐦 The Magpie (likes shiny buttons!)</span>
            </div>
            {coverGuess === 'bird' ? (
              <p className="text-xs font-extrabold text-[#4CAF50] bg-green-50 px-2.5 py-1.5 rounded-full text-center mt-1">
                🎯 Wow! Your detective instinct was spot on from the start!
              </p>
            ) : (
              <p className="text-xs font-extrabold text-[#8A4B14] bg-[#FCE9DA] px-2.5 py-1.5 rounded-full text-center mt-1">
                🔍 Great detective work following the clues to the real answer!
              </p>
            )}
          </div>

          {/* Clues found: X / 10 with a green progress bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-xs sm:text-sm font-extrabold text-[#2D241E]">
              <span>Clues found: {cluesFoundScore} / 10</span>
              <span className="text-[#4CAF50]">{Math.round((cluesFoundScore / 10) * 100)}%</span>
            </div>
            <div className="w-full h-3.5 bg-[#E8DCCF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4CAF50] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, (cluesFoundScore / 10) * 100))}%` }}
              />
            </div>
          </div>

          {/* Word taps as three small rounded boxes Ch.1 → Ch.2 → Ch.3 */}
          <div className="space-y-1.5 text-left">
            <span className="text-xs font-extrabold text-[#8A4B14] uppercase">Word taps</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#FDF3EA] rounded-[16px] p-2.5 text-center">
                <span className="text-[11px] font-bold text-[#8A4B14] block">Ch.1</span>
                <span className="text-sm font-extrabold text-[#2D241E]">{wordTapsByChapter[1]}</span>
              </div>
              <div className="bg-[#FDF3EA] rounded-[16px] p-2.5 text-center">
                <span className="text-[11px] font-bold text-[#8A4B14] block">Ch.2</span>
                <span className="text-sm font-extrabold text-[#2D241E]">{wordTapsByChapter[2]}</span>
              </div>
              <div className="bg-[#FDF3EA] rounded-[16px] p-2.5 text-center">
                <span className="text-[11px] font-bold text-[#8A4B14] block">Ch.3</span>
                <span className="text-sm font-extrabold text-[#2D241E]">{wordTapsByChapter[3]}</span>
              </div>
            </div>
          </div>

          {/* Buttons side by side: beige pill [Replay Case] and orange pill [Home] */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onReplayCase}
              className="flex-1 min-h-[48px] rounded-full bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#2D241E] font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#8A4B14]" />
              <span>Replay Case</span>
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="flex-1 min-h-[48px] rounded-full bg-[#FF9436] hover:bg-[#F58625] text-white font-extrabold text-sm flex items-center justify-center gap-1.5 btn-3d-orange transition active:scale-95 cursor-pointer"
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
