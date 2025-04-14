// src/components/txt2img-feature.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image'; // Use next/image
import { Loader2 } from 'lucide-react';
import { puter } from '@/lib/puter';

// --- Interfaces ---
interface PuterAI {
    txt2img?: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement | null | unknown>; // Update return type potentially
}

export function Txt2ImgFeature() {
  const [prompt, setPrompt] = useState('A futuristic cityscape at sunset');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puterInstance, setPuterInstance] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.puter?.ai) {
        setPuterInstance(window.puter.ai);
      } else {
        console.warn("Txt2Img: Puter SDK AI instance not found.");
        setError("Puter SDK not loaded."); 
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isLoading || !puterInstance?.txt2img) {
        if (!puterInstance?.txt2img) setError("Puter txt2img function not available.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      console.log("Generating image with Puter.ai...");
      // Using testMode=true initially to avoid credit usage during tests
      const imageResult: unknown = await puterInstance.txt2img(prompt, true);

      // Check the result type - Puter docs say data URL or Image element? Let's assume data URL based on other APIs
       if (typeof imageResult === 'string' && imageResult.startsWith('data:image')) {
           setImageUrl(imageResult);
       } else if (imageResult instanceof HTMLImageElement) {
           setImageUrl(imageResult.src); // Extract src if it's an element
       } else {
           console.error("Unexpected result type from txt2img:", imageResult);
           throw new Error("Failed to get a valid image URL from Puter.");
       }

    } catch (err: unknown) { // Fix: Use unknown for error type
      console.error("Text-to-Image error:", err);
      // Refined error extraction
      let errorMsg = 'Failed to generate image.';
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
            <CardTitle>Text-to-Image</CardTitle>
            <CardDescription>Enter a prompt to generate an image using AI.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
            <Textarea
                placeholder="Enter image generation prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="text-sm"
                disabled={isLoading}
             />
            <Button onClick={handleGenerateImage} disabled={isLoading || !prompt.trim() || !puterInstance?.txt2img}>
                {isLoading ? 'Generating...' : 'Generate Image'}
            </Button>

            {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
            )}

            {imageUrl && (
                <div className="mt-4 flex-grow border rounded bg-muted/50 flex items-center justify-center overflow-hidden relative min-h-[200px]">
                     {/* Use next/image */}
                     <Image
                        src={imageUrl}
                        alt="Generated image"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes
                     />
                </div>
            )}
             {!imageUrl && !isLoading && (
                 <div className="mt-4 flex-grow border rounded bg-muted/50 flex items-center justify-center text-muted-foreground">
                     Image will appear here
                 </div>
             )}
        </CardContent>
    </Card>
  );
}