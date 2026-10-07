import React, { useState } from 'react';
import { StoryIllustration } from '../illustrations/StoryIllustration';
import { LennyGuide } from '../LennyGuide';
import { CoverGuess } from '../../types/story';
import { Compass, Sparkles, Check } from 'lucide-react';

interface CoverScreenProps {
  onStartCase: (guess: CoverGuess) => void;
  onLennySpeak?: (text: string) => void;
}

export const CoverScreen: React.FC<CoverScreenProps> = ({ onStartCase, onLennySpeak }) => {
  const [selectedGuess, setSelectedGuess] = useState<CoverGuess | null>(null);

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
    <div className="flex flex-col h-full min-h-[580px] justify-between p-4 space-y-4">
      {/* Top Header */}
      <header className="text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase shadow-xs mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Mystery Case #01</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
          Clue Readers
        </h1>
        <p className="text-sm font-semibold text-amber-700">The Missing Mascot · 호랑이 티기 실종 사건</p>
      </header>

      {/* Cover Illustration */}
      <div className="relative">
        <StoryIllustration sceneId="cover" />
      </div>

      {/* Lenny Question Section */}
      <div className="space-y-3">
        <LennyGuide
          mood={selectedGuess ? 'happy' : 'questioning'}
          speechText="Who took the mascot doll? Make your guess before we start!"
          subText="Choose one suspect to start the investigation."
          onSpeak={() => onLennySpeak?.("Who took the mascot doll? Make your guess before we start!")}
        />

        {/* 3 Suspect Guess Options */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {options.map((opt) => {
            const isSelected = selectedGuess === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleOptionSelect(opt.id)}
                className={`relative min-h-[64px] flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all active:scale-95 text-center ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                    : 'bg-white border-amber-200 hover:border-amber-300 hover:bg-amber-50/50 shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <span className="text-2xl mb-0.5">{opt.emoji}</span>
                <span className="text-xs font-bold text-slate-800 leading-tight">{opt.title}</span>
                <span className="text-[10px] text-slate-500 font-medium">{opt.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Start Action */}
      <div className="pt-2 pb-1">
        <button
          type="button"
          onClick={handleStart}
          disabled={!selectedGuess}
          className={`w-full min-h-[52px] rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
            selectedGuess
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25 cursor-pointer ring-2 ring-amber-400/50'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>{selectedGuess ? 'Start the Case 🔍' : 'Choose a suspect to start'}</span>
        </button>
      </div>
    </div>
  );
};
