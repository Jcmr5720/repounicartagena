"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

type RecognitionSessionOptions = {
  onResult?: (transcript: string) => void;
  onEnd?: (transcript: string) => void;
};

type SpeakOptions = {
  onEnd?: () => void;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onstart: ((event: Event) => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type BrowserSpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const RECOGNITION_LANGUAGE = "es-CO";
const FALLBACK_SPEECH_LANGUAGES = ["es-CO", "es-ES", "es"];

function normalizeSpeechError(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "No se concedio permiso para usar el microfono.";
    case "no-speech":
      return "No se detecto voz. Intenta de nuevo.";
    case "audio-capture":
      return "No fue posible acceder al microfono.";
    case "network":
      return "La captura de voz fallo por un problema de red.";
    default:
      return "Ocurrio un problema al usar la voz.";
  }
}

function pickVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "es-co") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("es-")) ??
    voices.find((voice) => FALLBACK_SPEECH_LANGUAGES.includes(voice.lang)) ??
    null
  );
}

export function useSpeech() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionSessionRef = useRef<RecognitionSessionOptions>({});
  const recognitionTranscriptRef = useRef("");
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechOnEndRef = useRef<(() => void) | null>(null);

  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRecognitionStart = useEffectEvent(() => {
    setError(null);
    setTranscript("");
    recognitionTranscriptRef.current = "";
    setIsListening(true);
  });

  const handleRecognitionResult = useEffectEvent((event: SpeechRecognitionEventLike) => {
    let nextTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const chunk = result[0]?.transcript ?? "";

      if (result.isFinal) {
        nextTranscript += `${chunk} `;
      }
    }

    const mergedTranscript = `${recognitionTranscriptRef.current} ${nextTranscript}`
      .replace(/\s+/g, " ")
      .trim();

    if (!mergedTranscript) {
      return;
    }

    recognitionTranscriptRef.current = mergedTranscript;
    setTranscript(mergedTranscript);
    recognitionSessionRef.current.onResult?.(mergedTranscript);
  });

  const handleRecognitionError = useEffectEvent((event: SpeechRecognitionErrorEventLike) => {
    setError(normalizeSpeechError(event.error));
  });

  const handleRecognitionEnd = useEffectEvent(() => {
    setIsListening(false);
    const finalTranscript = recognitionTranscriptRef.current.trim();
    recognitionSessionRef.current.onEnd?.(finalTranscript);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const browserWindow = window as BrowserSpeechWindow;
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    setIsRecognitionSupported(Boolean(Recognition));
    setIsSynthesisSupported("speechSynthesis" in window);

    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = RECOGNITION_LANGUAGE;
    recognition.maxAlternatives = 1;
    recognition.onstart = handleRecognitionStart;
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handleRecognitionEnd;
    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const handleVoicesChanged = () => {
      setIsSynthesisSupported(true);
    };

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = useCallback((options: RecognitionSessionOptions = {}) => {
    if (!recognitionRef.current) {
      setError("Tu navegador no soporta busqueda por voz.");
      return false;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return true;
    }

    recognitionSessionRef.current = options;
    recognitionTranscriptRef.current = "";
    setTranscript("");
    setError(null);

    try {
      recognitionRef.current.start();
      return true;
    } catch {
      setError("No fue posible iniciar la captura de voz.");
      return false;
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const cancelSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    speechOnEndRef.current = null;
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
    synthesisUtteranceRef.current = null;
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setError("Tu navegador no soporta lectura por voz.");
        return false;
      }

      const normalizedText = text.replace(/\s+/g, " ").trim();

      if (!normalizedText) {
        setError("No hay contenido disponible para leer.");
        return false;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(normalizedText);
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = pickVoice(voices);

      utterance.lang = selectedVoice?.lang ?? RECOGNITION_LANGUAGE;
      utterance.voice = selectedVoice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => {
        setError(null);
        setIsSpeaking(true);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError("No fue posible reproducir la lectura por voz.");
        synthesisUtteranceRef.current = null;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        synthesisUtteranceRef.current = null;
        speechOnEndRef.current?.();
        speechOnEndRef.current = null;
      };

      speechOnEndRef.current = options.onEnd ?? null;
      synthesisUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      return true;
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const state = useMemo(
    () => ({
      clearError,
      error,
      isListening,
      isRecognitionSupported,
      isSpeaking,
      isSynthesisSupported,
      transcript,
      speak,
      startListening,
      stopListening,
      cancelSpeaking,
    }),
    [
      cancelSpeaking,
      clearError,
      error,
      isListening,
      isRecognitionSupported,
      isSpeaking,
      isSynthesisSupported,
      speak,
      startListening,
      stopListening,
      transcript,
    ],
  );

  return state;
}
