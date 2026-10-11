import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StoryPageData, ChapterNumber, NewWordInfo } from '../../types/story';
import { StoryIllustration } from '../illustrations/StoryIllustration';
import { TapWordModal } from '../TapWordModal';
import { Volume2, VolumeX, ArrowRight, Languages, Gauge } from 'lucide-react';

interface StoryPageScreenProps {
  pageData: StoryPageData;
  totalPages: number;
  chapterKoUsesRemaining: number; // For Chapter 2: max 3 uses total
  onUseKo: () => void;
  onRecordWordTap: (chapter: ChapterNumber) => void;
  onGoToQuestion: () => void;
  // Speech controls passed from parent or hook
  speakText: (text: string, options?: { rateOverride?: number; onEndCallback?: () => void; wordsList?: string[] }) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  highlightedWordIndex: number | null;
  isSlowSpeed: boolean;
  toggleSlowSpeed: () => void;
}

export const StoryPageScreen: React.FC<StoryPageScreenProps> = ({
  pageData,
  totalPages,
  chapterKoUsesRemaining,
  onUseKo,
  onRecordWordTap,
  onGoToQuestion,
  speakText,
  stopSpeaking,
  isSpeaking,
  highlightedWordIndex,
  isSlowSpeed,
  toggleSlowSpeed
}) => {
  const [showKo, setShowKo] = useState(false);
  const [activeWordPopup, setActiveWordPopup] = useState<NewWordInfo | null>(null);
  const [hasCompletedAudioOnce, setHasCompletedAudioOnce] = useState(false);
  const autoPlayTriggeredRef = useRef(false);

  // Flatten all words across sentences for unified speech highlighting
  const fullText = useMemo(() => pageData.sentences.join(' '), [pageData.sentences]);
  const wordTokens = useMemo(() => fullText.split(/\s+/).filter(Boolean), [fullText]);

  // Clean word helper to match against newWord
  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Reset states on page change
  useEffect(() => {
    setShowKo(false);
    setActiveWordPopup(null);
    setHasCompletedAudioOnce(false);
    autoPlayTriggeredRef.current = false;
  }, [pageData.id]);

  // Fading help audio auto-play logic:
  // Chapter 1: audio auto-plays with word highlighting
  useEffect(() => {
    if (pageData.chapter === 1 && !autoPlayTriggeredRef.current) {
      autoPlayTriggeredRef.current = true;
      const timer = window.setTimeout(() => {
        handlePlayAudio();
      }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [pageData.id, pageData.chapter]);

  const handlePlayAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    speakText(fullText, {
      wordsList: wordTokens,
      onEndCallback: () => {
        setHasCompletedAudioOnce(true);
      }
    });
  };

  const handleToggleKo = () => {
    if (pageData.chapter === 3) return; // No KO in Ch 3

    if (showKo) {
      setShowKo(false);
      return;
    }

    // Opening KO
    if (pageData.chapter === 1) {
      setShowKo(true);
      onUseKo();
    } else if (pageData.chapter === 2) {
      if (chapterKoUsesRemaining > 0) {
        setShowKo(true);
        onUseKo();
      }
    }
  };

  const handleWordClick = (wordInfo: NewWordInfo) => {
    setActiveWordPopup(wordInfo);
    onRecordWordTap(pageData.chapter);
  };

  // Next button unlocking condition based on fading help:
  // - Chapter 1: [Next] unlocks when audio finishes!
  // - Chapter 2: [Next] unlocks after audio has played once!
  // - Chapter 3: [Next] is always on!
  const isNextUnlocked = useMemo(() => {
    if (pageData.chapter === 3) return true;
    if (pageData.chapter === 2) return hasCompletedAudioOnce;
    if (pageData.chapter === 1) return hasCompletedAudioOnce;
    return true;
  }, [pageData.chapter, hasCompletedAudioOnce]);

  // Help meter icons: Ch.1 -> 🔍🔍🔍, Ch.2 -> 🔍🔍, Ch.3 -> 🔍
  const renderHelpMeter = () => {
    const count = pageData.chapter === 1 ? 3 : pageData.chapter === 2 ? 2 : 1;
    return (
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100/90 border border-amber-300 text-sm font-bold text-amber-900 shadow-xs">
        <span className="text-xs uppercase tracking-wider text-amber-800 mr-0.5">Help</span>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="text-base">🔍</span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between p-3.5 space-y-3">
      {/* Top Header Bar with exact PRD format: Ch.1 · Page 3 / 12 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-extrabold text-sm sm:text-base text-amber-950 bg-amber-200/90 px-3 py-1 rounded-xl shadow-xs">
            Ch.{pageData.chapter} · Page {pageData.pageNumber} / {totalPages}
          </span>
        </div>
        <div>{renderHelpMeter()}</div>
      </div>

      {/* Top Half: Illustration */}
      <div className="relative">
        <StoryIllustration sceneId={pageData.sceneId} />
      </div>

      {/* Bottom Half: Sentences with word highlighting and Tap-a-Word */}
      <div className="flex-1 bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex flex-col justify-between min-h-[170px]">
        <div className="space-y-2">
          {pageData.sentences.map((sentence, sIdx) => {
            // Split sentence into words preserving punctuation
            const rawTokens = sentence.split(' ');
            return (
              <p
                key={sIdx}
                className="text-[20px] sm:text-[22px] leading-relaxed font-bold text-slate-900 select-none flex flex-wrap items-center gap-x-1.5"
              >
                {rawTokens.map((rawWord, wIdx) => {
                  const cleaned = cleanWord(rawWord);
                  const isNewWordTarget =
                    pageData.newWord && cleaned === cleanWord(pageData.newWord.word);

                  // Calculate index in flat tokens
                  const previousWordsCount = pageData.sentences
                    .slice(0, sIdx)
                    .reduce((acc, curr) => acc + curr.split(/\s+/).filter(Boolean).length, 0);
                  const currentTokenIndex = previousWordsCount + wIdx;

                  const isCurrentlyHighlighted =
                    isSpeaking && highlightedWordIndex === currentTokenIndex;

                  if (isNewWordTarget && pageData.newWord) {
                    return (
                      <button
                        key={wIdx}
                        type="button"
                        onClick={() => handleWordClick(pageData.newWord!)}
                        className={`inline-flex items-center underline decoration-amber-500 decoration-3 underline-offset-4 font-extrabold transition-all px-1 py-0.5 rounded cursor-pointer ${
                          isCurrentlyHighlighted
                            ? 'bg-amber-300 text-amber-950 scale-105 shadow-xs'
                            : 'text-amber-800 hover:bg-amber-100 hover:text-amber-900'
                        }`}
                        title="Tap to see picture & meaning"
                      >
                        {rawWord}
                      </button>
                    );
                  }

                  return (
                    <span
                      key={wIdx}
                      className={`transition-colors duration-150 rounded px-0.5 ${
                        isCurrentlyHighlighted
                          ? 'bg-amber-200 text-amber-950 font-extrabold'
                          : 'text-slate-900'
                      }`}
                    >
                      {rawWord}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>

        {/* Korean Translation Box (when toggled, 16px font text-base) */}
        {showKo && (
          <div className="mt-3 pt-2.5 border-t border-amber-200 bg-amber-50/70 -mx-4 -mb-4 p-3.5 rounded-b-2xl animate-in fade-in">
            <span className="text-sm font-bold text-amber-800 uppercase tracking-wider block mb-1">
              한국어 번역
            </span>
            <div className="space-y-1.5">
              {pageData.koreanSentences.map((koLine, idx) => (
                <p key={idx} className="text-base font-semibold text-slate-800 leading-snug">
                  {koLine}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: [🔊 Listen] + [0.8×] + [KO] + [Next ▶] */}
      <div className="pt-1">
        <div className="grid grid-cols-4 gap-2">
          {/* [🔊 Listen] Button */}
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`min-h-[52px] col-span-1 rounded-2xl font-bold text-sm flex flex-col items-center justify-center transition active:scale-95 shadow-xs cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-white text-slate-800 border-2 border-amber-300 hover:bg-amber-50'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-600" />}
            <span className="mt-0.5">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          {/* [0.8×] Speed Toggle */}
          <button
            type="button"
            onClick={toggleSlowSpeed}
            className={`min-h-[52px] col-span-1 rounded-2xl font-bold text-sm flex flex-col items-center justify-center transition active:scale-95 border-2 shadow-xs cursor-pointer ${
              isSlowSpeed
                ? 'bg-amber-100 border-amber-500 text-amber-950 font-extrabold ring-2 ring-amber-400 shadow-sm'
                : 'bg-white border-amber-300 text-slate-700 hover:bg-amber-50'
            }`}
          >
            <Gauge className="w-4 h-4 text-amber-600" />
            <span className="mt-0.5">0.8×</span>
          </button>

          {/* [KO] Toggle Button */}
          {pageData.chapter !== 3 ? (
            <button
              type="button"
              onClick={handleToggleKo}
              disabled={pageData.chapter === 2 && chapterKoUsesRemaining <= 0 && !showKo}
              className={`min-h-[52px] col-span-1 rounded-2xl font-bold text-sm flex flex-col items-center justify-center transition active:scale-95 border-2 shadow-xs cursor-pointer ${
                showKo
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sky-500/20'
                  : pageData.chapter === 2 && chapterKoUsesRemaining <= 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Languages className="w-4 h-4 text-sky-600" />
              <span className="mt-0.5">
                {pageData.chapter === 2 ? `KO ${chapterKoUsesRemaining}/3` : 'KO 뜻'}
              </span>
            </button>
          ) : (
            <div className="col-span-1 min-h-[52px] flex items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-500 font-bold text-center px-1">
              English Only
            </div>
          )}

          {/* [Next ▶] Button */}
          <button
            type="button"
            onClick={onGoToQuestion}
            disabled={!isNextUnlocked}
            className={`min-h-[52px] col-span-1 rounded-2xl font-bold text-sm flex flex-col items-center justify-center transition active:scale-95 shadow-md ${
              isNextUnlocked
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25 ring-2 ring-emerald-400/50 cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            <span className="mt-0.5">{isNextUnlocked ? 'Next ▶' : 'Listen 🔒'}</span>
          </button>
        </div>
      </div>

      {/* Tap-a-Word Popup Modal */}
      {activeWordPopup && (
        <TapWordModal
          wordInfo={activeWordPopup}
          chapter={pageData.chapter}
          onClose={() => setActiveWordPopup(null)}
          onSpeakWord={(word) => speakText(word)}
        />
      )}
    </div>
  );
};
