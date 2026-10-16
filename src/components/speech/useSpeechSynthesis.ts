import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechSynthesisOptions {
  onEnd?: () => void;
  onError?: (e: unknown) => void;
  isSlow?: boolean;
}

let cachedEnglishVoice: SpeechSynthesisVoice | null = null;

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  const englishVoice =
    voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Natural') ||
          v.name.includes('US'))
    ) || voices.find((v) => v.lang.startsWith('en'));
  if (englishVoice) {
    cachedEnglishVoice = englishVoice;
  }
  return englishVoice || null;
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [isSlowSpeed, setIsSlowSpeed] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  // Listen for voices changed and cache voice reliably
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      pickEnglishVoice();
      const handleVoicesChanged = () => {
        pickEnglishVoice();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Stop any active speech
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentWordIndex(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const speak = useCallback(
    (
      text: string,
      options?: {
        rateOverride?: number;
        onEndCallback?: () => void;
        wordsList?: string[];
      }
    ) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        options?.onEndCallback?.();
        return;
      }

      stop();

      const rate = options?.rateOverride ?? (isSlowSpeed ? 0.7 : 0.9);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.lang = 'en-US';

      // Pick cached English voice if available
      const englishVoice = cachedEnglishVoice || pickEnglishVoice();
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Prepare word boundary mapping
      const words = options?.wordsList || text.split(/\s+/).filter(Boolean);
      let charIndexMap: { start: number; end: number; index: number }[] = [];
      let cursor = 0;
      for (let i = 0; i < words.length; i++) {
        const found = text.indexOf(words[i], cursor);
        if (found !== -1) {
          charIndexMap.push({
            start: found,
            end: found + words[i].length,
            index: i
          });
          cursor = found + words[i].length;
        } else {
          charIndexMap.push({
            start: cursor,
            end: cursor + words[i].length,
            index: i
          });
          cursor += words[i].length + 1;
        }
      }

      let boundaryFired = false;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentWordIndex(0);

        // Fallback ticker if browser boundary is quiet
        let approxDurationPerWordMs = Math.max(260, 60000 / (130 * rate));
        let tickWord = 0;
        fallbackTimerRef.current = window.setInterval(() => {
          if (!boundaryFired && tickWord < words.length - 1) {
            tickWord++;
            setCurrentWordIndex(tickWord);
          }
        }, approxDurationPerWordMs);
      };

      utterance.onboundary = (event) => {
        boundaryFired = true;
        if (fallbackTimerRef.current) {
          window.clearInterval(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        if (event.name === 'word' || typeof event.charIndex === 'number') {
          const charIdx = event.charIndex;
          let match = charIndexMap.find(
            (item) => charIdx >= item.start && charIdx < item.end
          );
          if (!match) {
            const candidates = charIndexMap.filter((item) => item.start <= charIdx);
            if (candidates.length > 0) {
              match = candidates[candidates.length - 1];
            }
          }
          if (match) {
            setCurrentWordIndex(match.index);
          }
        }
      };

      utterance.onend = () => {
        if (fallbackTimerRef.current) {
          window.clearInterval(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        setIsSpeaking(false);
        setCurrentWordIndex(null);
        options?.onEndCallback?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis note:', e);
        if (fallbackTimerRef.current) {
          window.clearInterval(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        setIsSpeaking(false);
        setCurrentWordIndex(null);
        options?.onEndCallback?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSlowSpeed, stop]
  );

  return {
    speak,
    stop,
    isSpeaking,
    currentWordIndex,
    isSlowSpeed,
    setIsSlowSpeed,
    toggleSlowSpeed: () => setIsSlowSpeed((prev) => !prev)
  };
}
