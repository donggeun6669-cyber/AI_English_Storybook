import React from 'react';
import { Volume2 } from 'lucide-react';

export type LennyMood = 'neutral' | 'questioning' | 'happy' | 'thinking' | 'celebrating';

interface LennyGuideProps {
  mood?: LennyMood;
  speechText?: string;
  subText?: string;
  onSpeak?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hideHeader?: boolean;
}

export const LennyGuide: React.FC<LennyGuideProps> = ({
  mood = 'neutral',
  speechText,
  subText,
  onSpeak,
  size = 'md',
  className = '',
  hideHeader = false
}) => {
  const getLennyFace = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return (
          <>
            {/* Happy eyes */}
            <path d="M 38 46 Q 44 38 50 46" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 62 46 Q 68 38 74 46" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Big smile */}
            <path d="M 46 58 Q 56 70 66 58" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="#f43f5e" />
            {/* Rosy cheeks */}
            <ellipse cx="36" cy="56" rx="5" ry="3" fill="#fbcfe8" opacity="0.8" />
            <ellipse cx="76" cy="56" rx="5" ry="3" fill="#fbcfe8" opacity="0.8" />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Wondering eyebrows */}
            <path d="M 38 40 Q 44 36 50 40" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 62 37 Q 68 33 74 38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Thinking eyes looking up */}
            <circle cx="44" cy="47" r="4.5" fill="#1e293b" />
            <circle cx="68" cy="45" r="4.5" fill="#1e293b" />
            <circle cx="46" cy="45" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="43" r="1.5" fill="#ffffff" />
            {/* Small wavy mouth */}
            <path d="M 50 62 Q 56 59 62 61" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'questioning':
        return (
          <>
            {/* One raised eyebrow */}
            <path d="M 38 42 Q 44 40 50 43" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 62 35 Q 68 31 75 36" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Curious eyes */}
            <circle cx="44" cy="48" r="5" fill="#1e293b" />
            <circle cx="68" cy="47" r="5.5" fill="#1e293b" />
            <circle cx="42" cy="46" r="1.8" fill="#ffffff" />
            <circle cx="66" cy="45" r="2" fill="#ffffff" />
            {/* O mouth */}
            <ellipse cx="56" cy="62" rx="4" ry="5.5" fill="#1e293b" />
          </>
        );
      default:
        return (
          <>
            {/* Friendly open eyes */}
            <circle cx="44" cy="48" r="5" fill="#1e293b" />
            <circle cx="68" cy="48" r="5" fill="#1e293b" />
            <circle cx="42" cy="46" r="1.8" fill="#ffffff" />
            <circle cx="66" cy="46" r="1.8" fill="#ffffff" />
            {/* Gentle smile */}
            <path d="M 48 58 Q 56 66 64 58" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Cheeks */}
            <ellipse cx="36" cy="56" rx="4" ry="2.5" fill="#fde68a" />
            <ellipse cx="76" cy="56" rx="4" ry="2.5" fill="#fde68a" />
          </>
        );
    }
  };

  const dimensionClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Animated Lenny SVG */}
      <div className={`relative shrink-0 ${dimensionClass} ${mood === 'happy' ? 'animate-bounce' : 'animate-bounce-slow'}`}>
        <img
          src="/images/lenny.jpg"
          alt="Lenny"
          className="w-full h-full rounded-full object-cover drop-shadow-md select-none"
          draggable={false}
        />

        {/* Small detective badge badge pin */}
        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-bold text-[9px] px-1 py-0.5 rounded-full border border-amber-600 shadow-xs flex items-center gap-0.5">
          <span>🔍</span>
        </div>
      </div>

      {/* Lenny's Speech Bubble */}
      {speechText && (
        <div className="relative flex-1 bg-white rounded-[20px] p-3 shadow-xs text-[#2D241E] border border-[#FCE9DA]">
          {/* Bubble beak pointing left */}
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#FCE9DA]" />
          <div className="absolute -left-1.5 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white" />

          <div className="flex items-start justify-between gap-2">
            <div>
              {!hideHeader && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#8A4B14]">Lenny</span>
                  <span className="text-xs text-[#2D241E]/60 font-semibold">· Detective Guide</span>
                </div>
              )}
              <p className="text-base font-extrabold leading-snug text-[#2D241E]">{speechText}</p>
              {subText && <p className="text-xs text-[#2D241E]/70 mt-1 font-bold">{subText}</p>}
            </div>

            {onSpeak && (
              <button
                type="button"
                onClick={onSpeak}
                aria-label="Listen to Lenny"
                className="shrink-0 p-1.5 text-[#8A4B14] hover:text-[#2D241E] bg-[#FCE9DA] hover:bg-[#F5DAC4] active:bg-[#FCE9DA] rounded-full transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
