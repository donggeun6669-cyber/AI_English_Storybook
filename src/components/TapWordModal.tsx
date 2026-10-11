import React from 'react';
import { Volume2, X } from 'lucide-react';
import { NewWordInfo, ChapterNumber } from '../types/story';

interface TapWordModalProps {
  wordInfo: NewWordInfo;
  chapter: ChapterNumber;
  exampleSentence?: string;
  onClose: () => void;
  onSpeakText: (text: string) => void;
}

export const TapWordModal: React.FC<TapWordModalProps> = ({
  wordInfo,
  chapter,
  exampleSentence,
  onClose,
  onSpeakText
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D241E]/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs bg-white rounded-[24px] p-5 shadow-2xl text-center animate-in zoom-in-95 text-[#2D241E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full bg-[#FCE9DA] text-[#2D241E] hover:bg-[#F5DAC4] transition cursor-pointer"
          aria-label="Close word popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Word Picture (Emoji / SVG) */}
        <div className="w-20 h-20 mx-auto my-1 rounded-[20px] bg-[#FDF3EA] flex items-center justify-center text-4xl shadow-inner">
          <span>{wordInfo.emoji}</span>
        </div>

        {/* Word Title */}
        <div className="mt-1.5">
          <h3 className="text-2xl font-extrabold text-[#2D241E] tracking-tight">
            {wordInfo.word}
          </h3>
        </div>

        {/* Example sentence from this page */}
        {exampleSentence && (
          <div className="mt-2.5 p-2.5 bg-[#FCE9DA]/70 rounded-[18px] text-base font-bold text-[#2D241E] leading-snug">
            "{exampleSentence}"
          </div>
        )}

        {/* Two small listen buttons: [🔊 word] and [🔊 sentence] */}
        <div className="flex items-center justify-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => onSpeakText(wordInfo.word)}
            className="flex-1 min-h-[44px] py-1.5 px-3 bg-[#FFD13B] hover:bg-[#f6c62c] text-[#2D241E] text-xs font-extrabold rounded-full flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-[#8A4B14]" />
            <span>🔊 word</span>
          </button>
          {exampleSentence && (
            <button
              type="button"
              onClick={() => onSpeakText(exampleSentence)}
              className="flex-1 min-h-[44px] py-1.5 px-3 bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#2D241E] text-xs font-extrabold rounded-full flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-[#8A4B14]" />
              <span>🔊 sentence</span>
            </button>
          )}
        </div>

        {/* English simple definition */}
        <p className="text-sm text-[#2D241E]/80 mt-2.5 px-2 leading-relaxed font-semibold">
          {wordInfo.simpleDefinition}
        </p>

        {/* Korean Meaning (Chapter 1 ONLY!) */}
        {chapter === 1 ? (
          <div className="mt-3.5 pt-3 border-t border-[#FCE9DA] bg-[#FCE9DA]/70 -mx-5 -mb-5 p-4 rounded-b-[24px]">
            <span className="text-xs font-extrabold text-[#8A4B14] uppercase tracking-wider block mb-0.5">
              Korean Meaning
            </span>
            <p className="text-xl font-extrabold text-[#2D241E]">
              {wordInfo.koreanMeaning}
            </p>
          </div>
        ) : (
          <div className="mt-3 text-xs font-bold text-[#8A4B14]">
            🔍 Detective clue word
          </div>
        )}
      </div>
    </div>
  );
};
