interface PuterAI {
  chat: (
    messages: { role: string; content: string }[], 
    options?: { 
      model?: string; 
      stream?: boolean; 
      tools?: unknown[]; 
      imageURL?: string | File | Blob;
    }
  ) => Promise<unknown>;
  img2txt?: (image: string | File | Blob, testMode?: boolean) => Promise<unknown>;
}

interface PuterKV {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
}

interface PuterSDK {
  ai: PuterAI;
  kv: PuterKV;
  print?: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    puter?: PuterSDK;
  }
}

export {}; 