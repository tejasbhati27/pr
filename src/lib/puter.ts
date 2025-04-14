// Export a singleton instance with minimal type assertions
export const puter = {
  ai: {
    chat: async (messages: { role: string; content: string }[], options: any = {}) => {
      if (typeof window === 'undefined' || !window.puter?.ai) {
        throw new Error('Puter AI is not available');
      }
      return window.puter.ai.chat(messages, options);
    },
    img2txt: async (image: any, testMode = false) => {
      if (typeof window === 'undefined' || !window.puter?.ai?.img2txt) {
        throw new Error('Puter img2txt is not available');
      }
      return window.puter.ai.img2txt(image, testMode);
    }
  },
  kv: {
    get: async (key: string) => {
      if (typeof window === 'undefined' || !window.puter?.kv) {
        return null;
      }
      return window.puter.kv.get(key);
    },
    set: async (key: string, value: unknown) => {
      if (typeof window === 'undefined' || !window.puter?.kv) {
        return;
      }
      return window.puter.kv.set(key, value);
    },
  },
}; 