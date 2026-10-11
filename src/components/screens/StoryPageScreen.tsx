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
  onGoBack: () => void;
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
  onGoBack,
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
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FCE9DA] text-[#2D241E] text-xs font-extrabold shadow-xs">
        <span className="mr-0.5 uppercase tracking-wider text-[#8A4B14]">Help</span>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="text-sm">🔍</span>
        ))}
      </div>
    );
  };

  // Example sentence on this page containing the active tapped word
  const exampleSentenceForPopup = useMemo(() => {
    if (!activeWordPopup) return undefined;
    const targetWord = cleanWord(activeWordPopup.word);
    const foundSentence = pageData.sentences.find((s) => {
      const words = s.split(/\s+/).map(cleanWord);
      return words.includes(targetWord);
    });
    return foundSentence || pageData.sentences[0];
  }, [activeWordPopup, pageData.sentences]);

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between p-3.5 space-y-3 text-[#2D241E]">
      {/* Top Header Bar: "Ch.1 · Page 3 / 12" peach pill on left, 🔍 help meter pill on right */}
      <div className="flex items-center justify-between">
        <div className="px-3.5 py-1.5 rounded-full bg-[#FCE9DA] text-[#2D241E] text-xs sm:text-sm font-extrabold shadow-xs">
          Ch.{pageData.chapter} · Page {pageData.pageNumber} / {totalPages}
        </div>
        <div>{renderHelpMeter()}</div>
      </div>

      {/* Large Rounded Illustration */}
      <div className="bg-white rounded-[24px] p-2 shadow-xs overflow-hidden">
        <StoryIllustration sceneId={pageData.sceneId} />
      </div>

      {/* Sentences in a white rounded card directly under picture with small round speaker icon on left */}
      <div className="flex-1 bg-white rounded-[24px] p-4 shadow-sm flex flex-col justify-between min-h-[170px]">
        <div className="flex items-start gap-3">
          {/* Small round speaker icon on the left */}
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition shadow-xs cursor-pointer ${
              isSpeaking
                ? 'bg-[#8A4B14] text-white ring-2 ring-[#FF9436]'
                : 'bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#8A4B14]'
            }`}
            title="Read story aloud"
            aria-label="Read story aloud"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="space-y-2 flex-1">
            {pageData.sentences.map((sentence, sIdx) => {
              const rawTokens = sentence.split(' ');
              return (
                <p
                  key={sIdx}
                  className="text-[20px] sm:text-[22px] leading-relaxed font-bold text-[#2D241E] select-none flex flex-wrap items-center gap-x-1.5"
                >
                  {rawTokens.map((rawWord, wIdx) => {
                    const cleaned = cleanWord(rawWord);
                    const isNewWordTarget =
                      pageData.newWord && cleaned === cleanWord(pageData.newWord.word);

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
                          className={`inline-flex items-center underline decoration-[#FF9436] decoration-4 underline-offset-4 font-extrabold transition-all px-1 py-0.5 rounded cursor-pointer ${
                            isCurrentlyHighlighted
                              ? 'bg-[#FFD13B] text-[#2D241E] scale-105 shadow-xs'
                              : 'text-[#8A4B14] hover:bg-[#FCE9DA]'
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
                            ? 'bg-[#FFD13B]/70 text-[#2D241E] font-extrabold'
                            : 'text-[#2D241E]'
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
        </div>

        {/* Korean Translation Box (when toggled) in a soft peach card */}
        {showKo && (
          <div className="mt-3 p-3 bg-[#FCE9DA] rounded-[18px] animate-in fade-in">
            <span className="text-xs font-extrabold text-[#8A4B14] uppercase tracking-wider block mb-1">
              한국어 번역
            </span>
            <div className="space-y-1">
              {pageData.koreanSentences.map((koLine, idx) => (
                <p key={idx} className="text-base font-semibold text-[#2D241E] leading-snug">
                  {koLine}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: round peach [◀ Back], brown pill [Listen], small round yellow [0.8×], small round white [KO], orange pill [Next ▶] */}
      <div className="pt-0.5">
        <div className="flex items-center gap-2">
          {/* Round peach [◀ Back] button (hidden on page 1) */}
          {pageData.pageNumber > 1 && (
            <button
              type="button"
              onClick={onGoBack}
              className="w-12 h-12 rounded-full bg-[#FCE9DA] hover:bg-[#F5DAC4] text-[#2D241E] font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0 transition active:scale-95 cursor-pointer"
              title="Previous page"
              aria-label="Previous page"
            >
              ◀
            </button>
          )}

          {/* Brown pill [Listen] */}
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`min-h-[48px] px-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer flex-1 ${
              isSpeaking
                ? 'bg-[#723C0E] text-white ring-2 ring-[#FF9436]'
                : 'bg-[#8A4B14] hover:bg-[#723C0E] text-white'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          {/* Small round yellow [0.8×] */}
          <button
            type="button"
            onClick={toggleSlowSpeed}
            className={`w-12 h-12 rounded-full font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 transition active:scale-95 cursor-pointer ${
              isSlowSpeed
                ? 'bg-[#FFD13B] text-[#2D241E] ring-2 ring-[#FF9436]'
                : 'bg-white text-[#2D241E] hover:bg-[#FCE9DA]'
            }`}
            title="0.8× Speed Toggle"
          >
            0.8×
          </button>

          {/* Small round white [KO] */}
          {pageData.chapter !== 3 ? (
            <button
              type="button"
              onClick={handleToggleKo}
              disabled={pageData.chapter === 2 && chapterKoUsesRemaining <= 0 && !showKo}
              className={`w-12 h-12 rounded-full font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 transition active:scale-95 cursor-pointer ${
                showKo
                  ? 'bg-[#FFD13B] text-[#2D241E]'
                  : pageData.chapter === 2 && chapterKoUsesRemaining <= 0
                  ? 'bg-[#E5D7CC] text-[#8C7A6D] cursor-not-allowed'
                  : 'bg-white text-[#2D241E] hover:bg-[#FCE9DA]'
              }`}
              title={pageData.chapter === 2 ? `KO ${chapterKoUsesRemaining}/3` : 'KO 뜻'}
            >
              {pageData.chapter === 2 ? `KO ${chapterKoUsesRemaining}` : 'KO'}
            </button>
          ) : (
            <div
              className="w-12 h-12 rounded-full bg-[#E5D7CC] text-[#8C7A6D] font-extrabold text-[11px] flex items-center justify-center shrink-0"
              title="English Only"
            >
              EN
            </div>
          )}

          {/* Orange pill [Next ▶] on the right */}
          <button
            type="button"
            onClick={onGoToQuestion}
            disabled={!isNextUnlocked}
            className={`min-h-[48px] px-4 rounded-full font-extrabold text-sm flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer flex-1 ${
              isNextUnlocked
                ? 'bg-[#FF9436] hover:bg-[#F58625] text-white btn-3d-orange'
                : 'bg-[#E5D7CC] text-[#8C7A6D] cursor-not-allowed'
            }`}
          >
            <span>{isNextUnlocked ? 'Next ▶' : 'Listen 🔒'}</span>
          </button>
        </div>
      </div>

      {/* Tap-a-Word Popup Modal */}
      {activeWordPopup && (
        <TapWordModal
          wordInfo={activeWordPopup}
          chapter={pageData.chapter}
          exampleSentence={exampleSentenceForPopup}
          onClose={() => setActiveWordPopup(null)}
          onSpeakText={(text) => speakText(text)}
        />
      )}
    </div>
  );
};
