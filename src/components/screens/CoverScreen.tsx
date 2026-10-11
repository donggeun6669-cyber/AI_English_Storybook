import React, { useState } from 'react';
import { StoryIllustration } from '../illustrations/StoryIllustration';
import { LennyGuide } from '../LennyGuide';
import { CoverGuess } from '../../types/story';
import { Compass, Sparkles, Check, X, HelpCircle, BookOpen } from 'lucide-react';

interface CoverScreenProps {
  onStartCase: (guess: CoverGuess) => void;
  onLennySpeak?: (text: string) => void;
}

const TARGET_WORDS = [
  'mascot',
  'empty',
  'feathers',
  'breeze',
  'suspects',
  'footprints',
  'shiny',
  'branch',
  'magpie',
  'nest',
  'gently',
  'cheer'
];

export const CoverScreen: React.FC<CoverScreenProps> = ({ onStartCase, onLennySpeak }) => {
  const [selectedGuess, setSelectedGuess] = useState<CoverGuess | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const options: { id: CoverGuess; title: string; subtitle: string; emoji: string }[] = [
    { id: 'boy', title: 'A Boy', subtitle: 'A classmate?', emoji: '👦' },
    { id: 'dog', title: 'A Dog', subtitle: 'Playful Max?', emoji: '🐶' },
    { id: 'bird', title: 'A Bird', subtitle: 'A visitor?', emoji: '🐦' }
  ];

  const handleOptionSelect = (guessId: CoverGuess) => {
    setSelectedGuess(guessId);
    onLennySpeak?.(`You guessed ${guessId === 'boy' ? 'a boy' : guessId === 'dog' ? 'a dog' : 'a bird'}! Let's search for clues!`);
  };

  const handleStart = () => {
    if (selectedGuess) {
      onStartCase(selectedGuess);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between p-4 space-y-3.5 relative text-[#2D241E]">
      {/* Top Header with [?] Guide Button at top-right */}
      <header className="text-center pt-0.5 relative">
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="absolute top-0 right-0 w-9 h-9 rounded-full bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#2D241E] font-extrabold text-sm flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer z-10"
          title="Teacher & Parent Guide"
          aria-label="Teacher & Parent Guide"
        >
          ?
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD13B] text-[#2D241E] text-xs font-extrabold tracking-wide uppercase shadow-xs mb-1">
          Interactive Mystery Reader
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D241E] tracking-tight leading-tight">
          Clue Readers
        </h1>
        <div className="inline-block mt-1 px-3.5 py-1 rounded-full bg-[#FCE9DA] text-[#2D241E] text-xs sm:text-sm font-bold shadow-xs">
          The Missing Mascot · 호랑이 티기 실종 사건
        </div>
      </header>

      {/* Cover Illustration in a white rounded card */}
      <div className="bg-white rounded-[24px] p-2.5 shadow-xs overflow-hidden">
        <StoryIllustration sceneId="cover" />
      </div>

      {/* Lenny's bubble "Who took the mascot?" in a peach card under the picture */}
      <div className="space-y-3">
        <div className="bg-[#FCE9DA] rounded-[24px] p-3.5 shadow-xs">
          <LennyGuide
            mood={selectedGuess ? 'happy' : 'questioning'}
            speechText="Who took the mascot?"
            subText="Choose one suspect to start the investigation."
            onSpeak={() => onLennySpeak?.("Who took the mascot?")}
          />
        </div>

        {/* Suspect Pick Label & 3 Guess Cards */}
        <div className="space-y-2">
          <p className="text-sm font-extrabold text-[#2D241E]">
            Pick your guess before reading:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => {
              const isSelected = selectedGuess === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionSelect(opt.id)}
                  className={`relative min-h-[76px] flex flex-col items-center justify-center p-2.5 rounded-[24px] transition-all active:scale-95 text-center cursor-pointer ${
                    isSelected
                      ? 'bg-green-50/90 border-2 border-[#4CAF50] ring-2 ring-[#4CAF50]/20 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-[#2D241E] shadow-xs'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-2xl mb-0.5">{opt.emoji}</span>
                  <span className="text-sm font-extrabold text-[#2D241E] leading-tight">{opt.title}</span>
                  <span className="text-xs text-[#2D241E]/70 font-bold">{opt.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Start Action: Full-width orange pill "🔍 Start the Case →" with 3D bottom shadow */}
      <div className="pt-1 pb-1">
        <button
          type="button"
          onClick={handleStart}
          disabled={!selectedGuess}
          className={`w-full min-h-[48px] rounded-full font-extrabold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedGuess
              ? 'bg-[#FF9436] hover:bg-[#F58625] text-white btn-3d-orange'
              : 'bg-[#E5D7CC] text-[#8C7A6D] cursor-not-allowed'
          }`}
        >
          <span>🔍 Start the Case →</span>
        </button>
      </div>

      {/* Teacher & Parent Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D241E]/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-[24px] p-5 shadow-2xl text-left animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-[#2D241E]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#FCE9DA]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#FFD13B] flex items-center justify-center text-[#2D241E] font-extrabold">
                  <HelpCircle className="w-5 h-5 text-[#8A4B14]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2D241E] leading-tight">
                    Teacher & Parent Guide
                  </h3>
                  <p className="text-xs font-bold text-[#8A4B14]">선생님 & 학부모 안내</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FCE9DA] text-[#2D241E] hover:bg-[#F5DAC4] transition cursor-pointer"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Short lines on how to use */}
            <div className="mt-3.5 space-y-2 text-sm text-[#2D241E]">
              <div className="flex items-start gap-2.5 p-2.5 bg-[#FCE9DA]/60 rounded-[18px]">
                <span className="text-base shrink-0">1️⃣</span>
                <p className="font-semibold leading-snug">
                  <strong className="text-[#2D241E] font-extrabold">Read with fading help:</strong> Listen to the story and tap underlined words (Ch.1 audio auto-plays & KO → Ch.2 audio on tap → Ch.3 English only).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-[#FCE9DA]/60 rounded-[18px]">
                <span className="text-base shrink-0">2️⃣</span>
                <p className="font-semibold leading-snug">
                  <strong className="text-[#2D241E] font-extrabold">Answer Lenny & say aloud:</strong> Solve Lenny's clue question, then practice speaking the sentence aloud (takes about 15 minutes).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-[#FCE9DA]/60 rounded-[18px]">
                <span className="text-base shrink-0">3️⃣</span>
                <p className="font-semibold leading-snug">
                  <strong className="text-[#2D241E] font-extrabold">Microphone permission:</strong> Please help the child tap <span className="underline font-bold text-[#8A4B14]">'Allow'</span> when the browser asks to use the microphone.
                </p>
              </div>
            </div>

            {/* List of 12 Target Words */}
            <div className="mt-4 pt-3 border-t border-[#FCE9DA]">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-4 h-4 text-[#8A4B14]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#8A4B14]">
                  12 Target Words (A1 Vocabulary)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TARGET_WORDS.map((w, idx) => (
                  <span
                    key={w}
                    className="px-2.5 py-1 bg-[#FFD13B]/40 text-[#2D241E] text-xs font-extrabold rounded-full"
                  >
                    {idx + 1}. {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Close Button: Orange pill */}
            <div className="mt-4 pt-1">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full min-h-[48px] bg-[#FF9436] hover:bg-[#F58625] text-white font-extrabold text-sm rounded-full btn-3d-orange transition active:scale-95 cursor-pointer"
              >
                Got it! Let's Start 👍
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
