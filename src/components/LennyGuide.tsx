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
}

export const LennyGuide: React.FC<LennyGuideProps> = ({
  mood = 'neutral',
  speechText,
  subText,
  onSpeak,
  size = 'md',
  className = ''
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
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Glass Rim Shadow */}
          <circle cx="56" cy="54" r="39" fill="#000000" opacity="0.08" />

          {/* Wooden / Brass Handle */}
          <path
            d="M 83 80 L 108 105 A 7 7 0 0 1 98 115 L 73 90 Z"
            fill="#d97706"
            stroke="#b45309"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Handle Grip Stripes */}
          <path d="M 88 95 L 94 89" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 94 101 L 100 95" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Shiny Metallic Lens Frame */}
          <circle cx="56" cy="52" r="38" fill="#38bdf8" stroke="#0284c7" strokeWidth="6" />

          {/* Glass Lens Interior */}
          <circle cx="56" cy="52" r="32" fill="#e0f2fe" />

          {/* Glass Highlight Gleam */}
          <path
            d="M 34 38 A 24 24 0 0 1 76 34"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
            fill="none"
          />
          <path
            d="M 32 46 A 24 24 0 0 0 40 68"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
            fill="none"
          />

          {/* Detective Cap */}
          <path
            d="M 32 26 Q 56 12 80 26 C 85 27 75 22 56 22 C 37 22 27 27 32 26 Z"
            fill="#854d0e"
          />
          <path
            d="M 34 26 C 36 10 76 10 78 26 Z"
            fill="#a16207"
            stroke="#713f12"
            strokeWidth="2"
          />
          {/* Little Detective Ribbon */}
          <rect x="42" y="22" width="28" height="4" rx="2" fill="#ca8a04" />

          {/* Lenny's Cute Expressive Face */}
          {getLennyFace()}
        </svg>

        {/* Small detective badge badge pin */}
        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-bold text-[9px] px-1 py-0.5 rounded-full border border-amber-600 shadow-xs flex items-center gap-0.5">
          <span>🔍</span>
        </div>
      </div>

      {/* Lenny's Speech Bubble */}
      {speechText && (
        <div className="relative flex-1 bg-white border-2 border-amber-300 rounded-2xl p-3 shadow-md text-slate-800">
          {/* Bubble beak pointing left */}
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-amber-300" />
          <div className="absolute -left-1.5 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white" />

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-700">Lenny</span>
                <span className="text-[10px] text-slate-400">· Detective Guide</span>
              </div>
              <p className="text-base font-semibold leading-snug text-slate-900">{speechText}</p>
              {subText && <p className="text-xs text-slate-500 mt-1 font-medium">{subText}</p>}
            </div>

            {onSpeak && (
              <button
                type="button"
                onClick={onSpeak}
                aria-label="Listen to Lenny"
                className="shrink-0 p-2 text-amber-700 hover:text-amber-900 bg-amber-50 active:bg-amber-100 rounded-xl transition border border-amber-200"
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
