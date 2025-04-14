// src/components/txt2speech-feature.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { puter } from '@/lib/puter';

// --- Language Options (from Puter docs) ---
const TTS_LANGUAGES = [
  { value: 'en-US', label: 'English (US)' }, { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' }, { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' }, { value: 'it-IT', label: 'Italian (Italy)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' }, { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' }, { value: 'hi-IN', label: 'Hindi' },
  { value: 'ar-AE', label: 'Arabic (UAE)' }, { value: 'yue-CN', label: 'Chinese (Cantonese)'},
  { value: 'cmn-CN', label: 'Chinese (Mandarin)'}, // Add more as needed from docs
];

export function Txt2SpeechFeature() {
  const [text, setText] = useState('Hello world! Puter is pretty amazing, don\'t you agree?');
  const [language, setLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puterInstance, setPuterInstance] = useState<any | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to control audio playback

  useEffect(() => {
    const timer = setTimeout(() => { 
      if (typeof window !== 'undefined' && window.puter?.ai) {
        setPuterInstance(window.puter.ai);
      } else {
        console.warn("Txt2Speech: Puter SDK AI not found.");
        setError("Puter SDK not loaded.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateSpeech = async () => {
    if (!text.trim() || isLoading || !puterInstance?.txt2speech) {
        if (!puterInstance?.txt2speech) setError("Puter txt2speech function not available.");
        return;
    }
    // Stop any currently playing audio
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Generating speech with Puter.ai (Lang: ${language})...`);
      // Use testMode=true initially
      const audioResult: unknown = await puterInstance.txt2speech(text, language, true);

      // Check if result is an HTMLAudioElement
      if (audioResult instanceof HTMLAudioElement) {
          audioRef.current = audioResult; // Store ref
          audioRef.current.play(); // Play the audio
          audioRef.current.onended = () => { audioRef.current = null; }; // Clear ref on end
      } else {
           console.error("Unexpected result type from txt2speech:", audioResult);
           throw new Error("Failed to get valid audio from Puter.");
      }

    } catch (err: unknown) { // Fix: Use unknown for error type
      console.error("Text-to-Speech error:", err);
      // Refined error extraction
      let errorMsg = 'Failed to generate speech.';
      if (err instanceof Error) { errorMsg = err.message; }
      else if (typeof err === 'string') { errorMsg = err; }
      else { try { errorMsg = JSON.stringify(err); } catch { errorMsg = 'An unknown error occurred.' } }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Card className="h-full flex flex-col border-none shadow-none">
        <CardHeader>
            <CardTitle>Text-to-Speech</CardTitle>
            <CardDescription>Enter text and select a language to generate speech.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
            <Textarea
                placeholder="Enter text to synthesize..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                maxLength={3000} // From Puter docs limit
                className="text-sm flex-grow"
                disabled={isLoading}
             />
             <div className='flex items-center gap-2'>
                 <label htmlFor="tts-language" className="text-sm font-medium text-muted-foreground">Language:</label>
                 <Select value={language} onValueChange={setLanguage}>
                     <SelectTrigger className="w-[250px] h-8 text-xs" id="tts-language">
                        <SelectValue placeholder="Select Language" />
                     </SelectTrigger>
                     <SelectContent>
                        {TTS_LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                     </SelectContent>
                 </Select>
             </div>
            <Button onClick={handleGenerateSpeech} disabled={isLoading || !text.trim() || !puterInstance?.txt2speech}>
                <Loader2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate & Play Speech'}
            </Button>

            {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            {/* Audio element could be added here for custom controls if needed */}
        </CardContent>
    </Card>
  );
}