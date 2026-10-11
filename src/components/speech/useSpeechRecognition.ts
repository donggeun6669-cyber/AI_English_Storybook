import { useState, useCallback, useRef, useEffect } from 'react';

// Browser Web Speech Recognition declaration
type SpeechRecognitionType = any;

export interface SpeechCheckWord {
  raw: string;
  clean: string;
  matched: boolean;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [heardTranscript, setHeardTranscript] = useState<string | null>(null);
  const [wordResults, setWordResults] = useState<SpeechCheckWord[] | null>(null);
  const [matchRatio, setMatchRatio] = useState<{ matched: number; total: number } | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const targetWordsRef = useRef<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

  const checkWordsAgainstTarget = useCallback((transcript: string, targetSentence: string) => {
    const targetTokens = targetSentence.split(/\s+/).filter(Boolean);
    const heardTokens = transcript.split(/\s+/).map((t) => cleanWord(t)).filter(Boolean);

    let matchCount = 0;
    const results: SpeechCheckWord[] = targetTokens.map((token) => {
      const cleaned = cleanWord(token);
      const isMatched = heardTokens.includes(cleaned);
      if (isMatched) matchCount++;
      return {
        raw: token,
        clean: cleaned,
        matched: isMatched
      };
    });

    setWordResults(results);
    setMatchRatio({ matched: matchCount, total: targetTokens.length });
  }, []);

  const startCheck = useCallback((targetSentence: string) => {
    setErrorMessage(null);
    setHeardTranscript(null);
    setWordResults(null);
    setMatchRatio(null);

    if (typeof window === 'undefined') return;

    // Stop speech synthesis if speaking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage("Speech check is not available on this device.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        setIsListening(false);
        let bestTranscript = '';
        if (event.results && event.results.length > 0) {
          // Check top alternatives
          const alternatives = event.results[0];
          for (let i = 0; i < alternatives.length; i++) {
            const altText = alternatives[i].transcript;
            if (altText) {
              bestTranscript = altText;
              break;
            }
          }
        }

        setHeardTranscript(bestTranscript);
        checkWordsAgainstTarget(bestTranscript, targetSentence);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setErrorMessage("Please allow microphone access to check words.");
        } else if (e.error === 'no-speech') {
          setErrorMessage("No speech was heard. Tap again to try!");
        } else {
          setErrorMessage("Speech check could not connect. You can continue!");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: unknown) {
      console.warn("Failed to start SpeechRecognition:", err);
      setIsListening(false);
      setErrorMessage("Speech check is not available on this device.");
    }
  }, [checkWordsAgainstTarget]);

  const stopCheck = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const resetCheck = useCallback(() => {
    stopCheck();
    setHeardTranscript(null);
    setWordResults(null);
    setMatchRatio(null);
    setErrorMessage(null);
  }, [stopCheck]);

  return {
    startCheck,
    stopCheck,
    resetCheck,
    isListening,
    heardTranscript,
    wordResults,
    matchRatio,
    isSupported,
    errorMessage
  };
}
