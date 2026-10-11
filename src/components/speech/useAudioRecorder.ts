import { useState, useRef, useEffect, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasPlayedAudioOnce, setHasPlayedAudioOnce] = useState(false);
  const [isMicUnavailable, setIsMicUnavailable] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Clear timer
  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset current recording state
  const resetRecording = useCallback(() => {
    stopTimer();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
    setHasPlayedAudioOnce(false);
    setIsRecording(false);
    setIsPlaying(false);
    setDurationSeconds(0);
  }, []);

  // Clean up ONLY on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    // Stop any active speech before recording
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Revoke old URL only when a new recording replaces it
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    setAudioUrl(null);
    setHasPlayedAudioOnce(false);
    setIsMicUnavailable(false);
    setMicErrorMessage(null);
    stopTimer();

    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setIsMicUnavailable(true);
      setMicErrorMessage("Microphone is not available on this device.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Choose mimeType in order: audio/mp4, audio/webm;codecs=opus, audio/webm
      let chosenMimeType = '';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          chosenMimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          chosenMimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          chosenMimeType = 'audio/webm';
        }
      }

      const options = chosenMimeType ? { mimeType: chosenMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopTimer();
        setIsRecording(false);

        // Stop all audio tracks from stream to release mic indicator
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0) {
          const mime = mediaRecorder.mimeType || chosenMimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mime });
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;
          setAudioUrl(url);
        }
      };

      // Start recording WITHOUT timeslice (full continuous stream)
      mediaRecorder.start();
      setIsRecording(true);
      setDurationSeconds(0);

      timerRef.current = window.setInterval(() => {
        setDurationSeconds((sec) => {
          if (sec >= 15) {
            // Auto stop after 15 seconds
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            return 15;
          }
          return sec + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.warn("Microphone access error:", err);
      setIsMicUnavailable(true);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicErrorMessage("Please allow the microphone in your browser settings.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setMicErrorMessage("No microphone found.");
        } else {
          setMicErrorMessage("Microphone is not available on this device.");
        }
      } else {
        setMicErrorMessage("Microphone is not available on this device.");
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
  }, []);

  const playRecording = useCallback(() => {
    const currentUrl = audioUrlRef.current || audioUrl;
    if (!currentUrl) return;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio();
    (audio as any).playsInline = true;
    audio.setAttribute('playsinline', 'true');
    audio.src = currentUrl;
    audioElementRef.current = audio;
    setIsPlaying(true);
    setHasPlayedAudioOnce(true);

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    audio.play().catch((e) => {
      console.warn("Playback error:", e);
      setIsPlaying(false);
    });
  }, [audioUrl]);

  return {
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
    isRecording,
    isPlaying,
    audioUrl,
    hasRecording: Boolean(audioUrl),
    hasPlayedAudioOnce,
    isMicUnavailable,
    setIsMicUnavailable,
    micErrorMessage,
    durationSeconds
  };
}
