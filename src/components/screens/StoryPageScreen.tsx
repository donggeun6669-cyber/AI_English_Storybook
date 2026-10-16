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

  // Clue Hotspot state
  const [showHotspot, setShowHotspot] = useState(false);
  const [showHotspotLabel, setShowHotspotLabel] = useState(false);
  const labelTimerRef = useRef<number | null>(null);

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
    setShowHotspot(false);
    setShowHotspotLabel(false);
    if (labelTimerRef.current) {
      window.clearTimeout(labelTimerRef.current);
      labelTimerRef.current = null;
    }
  }, [pageData.id]);

  // Hotspot appearance behavior:
  // Appears after page has been read aloud once (or in Ch.3 after 3 seconds or listen once)
  useEffect(() => {
    if (pageData.chapter === 3) {
      const timer = window.setTimeout(() => {
        setShowHotspot(true);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [pageData.id, pageData.chapter]);

  useEffect(() => {
    if (hasCompletedAudioOnce) {
      setShowHotspot(true);
    }
  }, [hasCompletedAudioOnce]);

  const handleHotspotClick = () => {
    if (!pageData.clueSpot) return;
    speakText(pageData.clueSpot.word);
    setShowHotspotLabel(true);
    if (labelTimerRef.current) {
      window.clearTimeout(labelTimerRef.current);
    }
    labelTimerRef.current = window.setTimeout(() => {
      setShowHotspotLabel(false);
      labelTimerRef.current = null;
    }, 3000);
  };

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
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="px-3.5 py-1.5 rounded-full bg-[#FCE9DA] text-[#2D241E] text-xs sm:text-sm font-extrabold shadow-xs">
          Ch.{pageData.chapter} · Page {pageData.pageNumber} / {totalPages}
        </div>
      </div>

      {/* Large Rounded Illustration with Clue Hotspot */}
      <div className="bg-white rounded-[24px] p-2 shadow-xs overflow-hidden">
        <StoryIllustration sceneId={pageData.sceneId}>
          {pageData.clueSpot && showHotspot && (
            <div
              className="absolute z-20"
              style={{
                left: `${pageData.clueSpot.x}%`,
                top: `${pageData.clueSpot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Hotspot: 44px round yellow button with 🔍, soft pulse, white border, shadow */}
              <button
                type="button"
                onClick={handleHotspotClick}
                className="w-[44px] h-[44px] rounded-full bg-[#FFD13B] hover:bg-[#F6C62C] border-2 border-white shadow-md flex items-center justify-center text-lg animate-pulse transition active:scale-90 cursor-pointer"
                title={pageData.clueSpot.word}
                aria-label={`Clue hotspot: ${pageData.clueSpot.word}`}
              >
                🔍
              </button>

              {/* Small white pill label with word next to spot for 3 seconds */}
              {showHotspotLabel && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap bg-white text-[#2D241E] font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md border border-[#FCE9DA] z-30 animate-in fade-in zoom-in-95 pointer-events-none ${
                    pageData.clueSpot.x > 60 ? 'right-full mr-2' : 'left-full ml-2'
                  }`}
                >
                  {pageData.clueSpot.word}
                </div>
              )}
            </div>
          )}
        </StoryIllustration>
      </div>

      {/* Sentences in a white rounded card directly under picture */}
      <div className="flex-1 bg-white rounded-[24px] p-4 shadow-sm flex flex-col justify-between min-h-[170px]">
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
