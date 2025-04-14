// src/app/page.tsx
import { LlmUi } from "@/components/llm-ui"; // Import the main UI component

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-between">
      {/* This is the only component needed here now, */}
      {/* as LlmUi contains the rest of the layout and feature logic. */}
      <LlmUi />
    </main>
  );
}