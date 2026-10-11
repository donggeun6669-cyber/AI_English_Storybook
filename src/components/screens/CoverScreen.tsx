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
    <div className="flex flex-col h-full min-h-[580px] justify-between p-4 space-y-4 relative">
      {/* Top Header with [?] Guide Button at top-right */}
      <header className="text-center pt-1 relative">
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-amber-300 hover:bg-amber-100 text-amber-900 font-extrabold text-sm flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer z-10"
          title="Teacher & Parent Guide"
          aria-label="Teacher & Parent Guide"
        >
          ?
        </button>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-bold tracking-wide uppercase shadow-xs mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Mystery Case #01</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
          Clue Readers
        </h1>
        <p className="text-base font-semibold text-amber-700">The Missing Mascot · 호랑이 티기 실종 사건</p>
      </header>

      {/* Cover Illustration */}
      <div className="relative">
        <StoryIllustration sceneId="cover" />
      </div>

      {/* Lenny Question Section */}
      <div className="space-y-3">
        <LennyGuide
          mood={selectedGuess ? 'happy' : 'questioning'}
          speechText="Who took the mascot?"
          subText="Choose one suspect to start the investigation."
          onSpeak={() => onLennySpeak?.("Who took the mascot?")}
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
                className={`relative min-h-[72px] flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all active:scale-95 text-center cursor-pointer ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                    : 'bg-white border-amber-200 hover:border-amber-300 hover:bg-amber-50/50 shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <span className="text-2xl mb-0.5">{opt.emoji}</span>
                <span className="text-sm font-bold text-slate-900 leading-tight">{opt.title}</span>
                <span className="text-sm text-slate-600 font-medium">{opt.subtitle}</span>
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

      {/* Teacher & Parent Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-4 border-amber-300 text-left animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight font-display">
                    Teacher & Parent Guide
                  </h3>
                  <p className="text-xs font-semibold text-amber-700">선생님 & 학부모 안내</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Short lines on how to use */}
            <div className="mt-3.5 space-y-2.5 text-sm text-slate-800">
              <div className="flex items-start gap-2.5 p-2 bg-amber-50/70 rounded-xl border border-amber-100">
                <span className="text-base shrink-0">1️⃣</span>
                <p className="font-semibold leading-snug">
                  <strong className="text-amber-950 font-bold">Read with fading help:</strong> Listen to the story and tap underlined words (Ch.1 audio auto-plays & KO → Ch.2 audio on tap → Ch.3 English only).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-amber-50/70 rounded-xl border border-amber-100">
                <span className="text-base shrink-0">2️⃣</span>
                <p className="font-semibold leading-snug">
                  <strong className="text-amber-950 font-bold">Answer Lenny & say aloud:</strong> Solve Lenny's clue question, then practice speaking the sentence aloud (takes about 15 minutes).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-amber-50/70 rounded-xl border border-amber-100">
                <span className="text-base shrink-0">3️⃣</span>
                <p className="font-semibold leading-snug">
                  <strong className="text-amber-950 font-bold">Microphone permission:</strong> Please help the child tap <span className="underline font-bold text-rose-700">'Allow'</span> when the browser asks to use the microphone.
                </p>
              </div>
            </div>

            {/* List of 12 Target Words */}
            <div className="mt-4 pt-3 border-t border-amber-200">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  12 Target Words (A1 Vocabulary)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TARGET_WORDS.map((w, idx) => (
                  <span
                    key={w}
                    className="px-2.5 py-1 bg-amber-100 text-amber-950 text-xs font-bold rounded-lg border border-amber-300"
                  >
                    {idx + 1}. {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-4 pt-2">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
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
