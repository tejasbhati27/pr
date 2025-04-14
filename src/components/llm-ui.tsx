// src/components/llm-ui.tsx (New File)
"use client";

import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Loader2 } from "lucide-react"; // Icons

// Import feature components
import { ChatFeature } from './chat-feature';
import { Txt2ImgFeature } from './txt2img-feature';
import { Txt2SpeechFeature } from './txt2speech-feature';
import { ImageAnalysisFeature } from './image-analysis-feature';

type Feature = 'chat' | 'txt2img' | 'txt2speech' | 'imgAnalysis';

export function LlmUi() {
  const [activeFeature, setActiveFeature] = useState<Feature>('chat');

  const renderFeature = () => {
    switch (activeFeature) {
      case 'chat':
        return <ChatFeature />;
      case 'txt2img':
        return <Txt2ImgFeature />;
      case 'txt2speech':
        return <Txt2SpeechFeature />;
      case 'imgAnalysis':
        return <ImageAnalysisFeature />;
      default:
        return <ChatFeature />; // Default to chat
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full rounded-lg border">
      {/* Left Sidebar for Feature Selection */}
      <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
        <div className="flex h-full flex-col items-center justify-start p-4 gap-2">
          <h2 className="text-lg font-semibold mb-4">Features</h2>
          <Button
            variant={activeFeature === 'chat' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveFeature('chat')}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Chat / Code
          </Button>
          <Button
            variant={activeFeature === 'txt2img' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveFeature('txt2img')}
          >
            <Loader2 className="mr-2 h-4 w-4" /> Text-to-Image
          </Button>
           <Button
            variant={activeFeature === 'txt2speech' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveFeature('txt2speech')}
          >
            <Loader2 className="mr-2 h-4 w-4" /> Text-to-Speech
          </Button>
           <Button
            variant={activeFeature === 'imgAnalysis' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveFeature('imgAnalysis')}
          >
            <Loader2 className="mr-2 h-4 w-4" /> Image Analysis
          </Button>
          {/* Add more feature buttons here */}
          <Separator className="my-4" />
          {/* Placeholder for future history or settings */}
           <div className="mt-auto text-xs text-muted-foreground">Puter.ai Powered</div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Main Content Area */}
      <ResizablePanel defaultSize={85}>
        <div className="h-full p-1"> {/* Reduced padding */}
          {renderFeature()}
        </div>
      </ResizablePanel>

      {/* Optional Right Sidebar (if needed later) */}
      {/*
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={20}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Right Sidebar</span>
        </div>
      </ResizablePanel>
      */}
    </ResizablePanelGroup>
  );
}