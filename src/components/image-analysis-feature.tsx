// src/components/image-analysis-feature.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { puter } from '@/lib/puter';

export function ImageAnalysisFeature() {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Describe this image.');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puterInstance, setPuterInstance] = useState<any | null>(null);

  useEffect(() => {
      const timer = setTimeout(() => { 
        if (typeof window !== 'undefined' && window.puter?.ai) {
          setPuterInstance(window.puter.ai);
        } else { 
          console.warn("ImageAnalysis: Puter SDK AI not found.");
          setError("Puter SDK not loaded.");
        }
      }, 150);
      return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) { const file = event.target.files[0]; setImageFile(file); setImageUrl(URL.createObjectURL(file)); setAnalysisResult(''); setError(null); }
  };

  const handleAnalyze = async () => {
    const imageSource = imageFile || imageUrl.trim();
    if (!imageSource || isLoading || !puterInstance) {
        if (!puterInstance) setError("Puter not ready."); if (!imageSource) setError("Please upload an image or provide a URL."); return;
    }
    setIsLoading(true); setError(null); setAnalysisResult('');

     try {
      let resultText = '';
      let response: unknown;

      if (prompt && puterInstance.chat) {
          console.log("Analyzing image with Vision model via puter.ai.chat");
          response = await puterInstance.chat([{ role: 'user', content: prompt }], { imageURL: imageSource });
          console.log("Puter Vision Response:", response);

          // --- Refined Type Guard for Chat Response ---
          let messageContent: unknown = null; // Variable to hold content safely

          // Check top-level structure
          if (typeof response === 'object' && response !== null && 'message' in response) {
            // Check nested 'message' structure
            const messageObj = (response as { message?: unknown }).message;
            if (typeof messageObj === 'object' && messageObj !== null && 'content' in messageObj) {
              // Assign content for further checks
              messageContent = (messageObj as { content?: unknown }).content;
            }
          }

          // Now check the type of messageContent
          if (typeof messageContent === 'string') {
              resultText = messageContent;
          } else if (Array.isArray(messageContent) && messageContent[0]?.type === 'text' && typeof messageContent[0].text === 'string') {
              // Check nested text property
              resultText = messageContent[0].text;
          } else if (messageContent !== null && messageContent !== undefined) {
               // If content exists but isn't string or expected array, stringify it
               console.warn("Unrecognized message content format:", messageContent);
               resultText = JSON.stringify(messageContent);
          } else {
              // If messageContent is null or undefined or structure failed checks
              throw new Error("Invalid or missing message content in vision analysis response.");
          }
          // --- End Refined Type Guard ---

      }
      else if (puterInstance.img2txt) {
          console.log("Extracting text with OCR via puter.ai.img2txt");
          response = await puterInstance.img2txt(imageSource);
          console.log("Puter OCR Response:", response);
          // Type guard for img2txt response structure
          if (typeof response === 'string') {
              resultText = response;
          } else {
              throw new Error("Invalid response structure from OCR (expected string).");
          }
      }
       else { throw new Error("No suitable analysis method available in Puter instance."); }

      setAnalysisResult(resultText);

    } catch (err: unknown) {
      console.error("Image analysis error:", err);
      let errorMsg = 'Image analysis failed.';
      if (err instanceof Error) { errorMsg = err.message; }
      else if (typeof err === 'string') { errorMsg = err; }
      else { try { errorMsg = JSON.stringify(err); } catch { errorMsg = 'An unknown or non-serializable error occurred.' } }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none">
        <CardHeader>
            <CardTitle>Image Analysis (Vision / OCR)</CardTitle>
            <CardDescription>Upload an image or provide a URL to analyze.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
            <div className="flex gap-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-grow" disabled={isLoading} />
            </div>
             <Textarea placeholder="Analysis prompt (e.g., 'What objects are in this image?', 'Extract text from image')" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className="text-sm" disabled={isLoading} />

            {imageUrl && (
                <div className="mt-2 flex justify-center" style={{ maxHeight: '200px', position: 'relative', width: '100%' }}>
                 <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded"
                 />
                </div>
            )}

            <Button onClick={handleAnalyze} disabled={isLoading || (!imageFile && !imageUrl.trim()) || !puterInstance} className="mt-2">
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </Button>

            {error && (<p className="text-sm text-destructive mt-2">{error}</p>)}

            {analysisResult && (
                <ScrollArea className="mt-4 flex-grow border rounded p-2 bg-muted/50 min-h-[100px]">
                     <p className="text-sm whitespace-pre-wrap">{analysisResult}</p>
                </ScrollArea>
            )}
        </CardContent>
    </Card>
  );
}