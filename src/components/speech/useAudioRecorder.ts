import { useState, useRef, useEffect, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMicUnavailable, setIsMicUnavailable] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

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
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsRecording(false);
    setIsPlaying(false);
    setDurationSeconds(0);
  }, [audioUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    resetRecording();
    setIsMicUnavailable(false);
    setMicErrorMessage(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsMicUnavailable(true);
      setMicErrorMessage("Microphone access is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
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
          const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      };

      mediaRecorder.start(200); // 200ms slice
      setIsRecording(true);
      setDurationSeconds(0);

      timerRef.current = window.setInterval(() => {
        setDurationSeconds((sec) => {
          if (sec >= 15) {
            // Auto stop after 15 seconds to prevent accidental giant recordings
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
      setMicErrorMessage("Microphone is unavailable or permission was denied. You can still practice speaking aloud!");
    }
  }, [resetRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrl) return;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioElementRef.current = audio;
    setIsPlaying(true);

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
    isMicUnavailable,
    setIsMicUnavailable,
    micErrorMessage,
    durationSeconds
  };
}
