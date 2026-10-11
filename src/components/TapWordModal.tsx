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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border-4 border-amber-300 text-center animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          aria-label="Close word popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Word Picture (Emoji / SVG) */}
        <div className="w-20 h-20 mx-auto my-1 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-inner">
          <span>{wordInfo.emoji}</span>
        </div>

        {/* Word Title */}
        <div className="mt-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-wide font-display">
            {wordInfo.word}
          </h3>
        </div>

        {/* Example sentence from this page */}
        {exampleSentence && (
          <div className="mt-2.5 p-2.5 bg-amber-50/85 rounded-xl border border-amber-200 text-base font-bold text-slate-800 leading-snug">
            "{exampleSentence}"
          </div>
        )}

        {/* Two small listen buttons: [🔊 word] and [🔊 sentence] */}
        <div className="flex items-center justify-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => onSpeakText(wordInfo.word)}
            className="flex-1 py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer border border-amber-300"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>🔊 word</span>
          </button>
          {exampleSentence && (
            <button
              type="button"
              onClick={() => onSpeakText(exampleSentence)}
              className="flex-1 py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer border border-amber-300"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>🔊 sentence</span>
            </button>
          )}
        </div>

        {/* English simple definition */}
        <p className="text-sm text-slate-700 mt-2.5 px-2 leading-relaxed font-medium">
          {wordInfo.simpleDefinition}
        </p>

        {/* Korean Meaning (Chapter 1 ONLY!) */}
        {chapter === 1 ? (
          <div className="mt-4 pt-3 border-t border-amber-100 bg-amber-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <span className="text-sm font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
              Korean Meaning
            </span>
            <p className="text-xl font-bold text-amber-950 font-sans">
              {wordInfo.koreanMeaning}
            </p>
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-500 font-medium">
            🔍 Detective clue word
          </div>
        )}
      </div>
    </div>
  );
};
