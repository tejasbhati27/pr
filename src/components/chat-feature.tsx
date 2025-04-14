// src/components/chat-feature.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Trash2, Loader2 } from 'lucide-react';
import { puter } from '@/lib/puter';

// --- Type Definitions ---
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

// Type for stream parts
type StreamPart = { text?: string; tool_calls?: unknown[] };

// --- Model Definitions ---
const PUTER_CHAT_MODELS = [ /* Model list */
    { value: 'gpt-4o-mini', label: 'OpenAI: GPT-4o Mini (Default)' }, { value: 'gpt-4o', label: 'OpenAI: GPT-4o' }, { value: 'o3-mini', label: 'OpenAI: O3 Mini' }, { value: 'o1-mini', label: 'OpenAI: O1 Mini' }, { value: 'claude-3-5-sonnet', label: 'Anthropic: Claude 3.5 Sonnet' }, { value: 'claude-3-7-sonnet', label: 'Anthropic: Claude 3.7 Sonnet' }, { value: 'deepseek-chat', label: 'DeepSeek: Chat' }, { value: 'deepseek-reasoner', label: 'DeepSeek: Reasoner (R1)' }, { value: 'gemini-1.5-flash', label: 'Google: Gemini 1.5 Flash' }, { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', label: 'Meta: Llama 3.1 8B Turbo (Together)' }, { value: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', label: 'Meta: Llama 3.1 70B Turbo (Together)' }, { value: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', label: 'Meta: Llama 3.1 405B Turbo (Together)' }, { value: 'mistral-large-latest', label: 'Mistral: Large Latest' }, { value: 'pixtral-large-latest', label: 'Mistral: Pixtral Large Latest' }, { value: 'codestral-latest', label: 'Mistral: Codestral Latest' }, { value: 'google/gemma-2-27b-it', label: 'Google: Gemma 2 27B (Groq)' }, { value: 'grok-beta', label: 'xAI: Grok Beta' },
];

// --- Type Guard Function ---
function isStreamPartAsyncIterable(obj: unknown): obj is AsyncIterable<StreamPart> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (obj as any)[Symbol.asyncIterator] === 'function'
  );
}

// --- Chat Feature Component ---
export function ChatFeature() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(PUTER_CHAT_MODELS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puterInstance, setPuterInstance] = useState<any | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => { 
      if (typeof window !== 'undefined' && window.puter?.ai) { 
        console.log("ChatFeature: Puter AI instance found."); 
        setPuterInstance(window.puter.ai); 
      } else { 
        console.warn("ChatFeature: Puter SDK AI instance not found."); 
      } 
    }, 150); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadChatHistories();
  }, []);

  const loadChatHistories = async () => {
    try {
      const result = await puter.kv.get('chat_histories');
      const histories: ChatHistory[] = result as ChatHistory[] || [];
      setChatHistories(histories);
    } catch (error) {
      console.error('Error loading chat histories:', error);
    }
  };

  const saveChatHistories = async (histories: ChatHistory[]) => {
    try {
      await puter.kv.set('chat_histories', histories);
    } catch (error) {
      console.error('Error saving chat histories:', error);
    }
  };

  const createNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    };
    setChatHistories(prev => {
      const updated = [newChat, ...prev];
      saveChatHistories(updated);
      return updated;
    });
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  const deleteChat = async (chatId: string) => {
    setChatHistories((prev: ChatHistory[]) => {
      const updated = prev.filter((chat: ChatHistory) => chat.id !== chatId);
      saveChatHistories(updated);
      return updated;
    });
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistories.find((c: ChatHistory) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !puterInstance) { if (!puterInstance) setError("Puter is not available."); return; }
    const userMessage: Message = { role: 'user', content: trimmedInput, timestamp: Date.now() };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput(''); setIsLoading(true); setError(null);
    const apiMessages = currentMessages.filter(m => ['user','assistant','system'].includes(m.role)).map(m => ({ role: m.role, content: m.content }));

    try {
        console.log(`Sending to Puter.ai with model: ${selectedModel}`);
        const responseStream: unknown = await puterInstance.chat(apiMessages, { model: selectedModel, stream: true });

        if (!isStreamPartAsyncIterable(responseStream)) {
            console.error("Puter response is not a valid async iterator:", responseStream);
            throw new Error('Expected a streaming response (async iterator) from Puter AI.');
        }

        let assistantResponseText = '';
        const placeholderMessage: Message = { role: 'assistant', content: '...', timestamp: Date.now() };
        setMessages(prev => [...prev, placeholderMessage]);
        const assistantMessageIndex = currentMessages.length;

        // Iterate directly over the now correctly typed responseStream
        for await (const part of responseStream) {
            if (part && typeof part.text === 'string') {
                assistantResponseText += part.text;
                setMessages(prev => {
                    const updatedMessages = [...prev];
                    if(updatedMessages[assistantMessageIndex]) { updatedMessages[assistantMessageIndex] = { ...updatedMessages[assistantMessageIndex], content: assistantResponseText }; }
                    return updatedMessages;
                });
                scrollToBottom();
            }
        }

        setMessages(prev => { /* Final update logic */
            const finalMessages = [...prev]; const finalIndex = finalMessages.findIndex(m => m.role === 'assistant' && m.content.endsWith('...')); if (finalIndex !== -1) { finalMessages[finalIndex] = { ...finalMessages[finalIndex], content: assistantResponseText }; } else if (prev[prev.length-1]?.role === 'assistant') { finalMessages[prev.length-1] = { ...finalMessages[prev.length-1], content: assistantResponseText }; } return finalMessages.filter(m => !(m.role === 'assistant' && m.content === '...'));
        });

        // Update chat history
        if (currentChatId) {
          setChatHistories((prev: ChatHistory[]) => {
            const updated = prev.map((chat: ChatHistory) => {
              if (chat.id === currentChatId) {
                const newMessages: Message[] = [
                  ...chat.messages,
                  {
                    role: 'user' as const,
                    content: trimmedInput,
                    timestamp: Date.now()
                  },
                  {
                    role: 'assistant' as const,
                    content: assistantResponseText,
                    timestamp: Date.now()
                  }
                ];
                return {
                  ...chat,
                  messages: newMessages,
                  title: chat.messages.length === 0 ? trimmedInput.slice(0, 30) + '...' : chat.title
                };
              }
              return chat;
            });
            saveChatHistories(updated);
            return updated;
          });
        } else {
          createNewChat();
        }
    } catch (err: unknown) { /* Error handling */
      console.error("Puter.ai chat error caught:", err); let errorMsg = 'Failed to get response from Puter AI.'; if (err instanceof Error) { errorMsg = err.message; } else if (typeof err === 'string') { errorMsg = err; } else { try { errorMsg = JSON.stringify(err); } catch { errorMsg = 'An unknown or non-serializable error occurred.' } } console.error("Processed error message:", errorMsg); setError(errorMsg); setMessages(prev => [ ...prev.filter(m => !(m.role === 'assistant' && m.content === '...')), { role: 'assistant', content: `Error: ${errorMsg}`, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setInput(event.target.value); };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendMessage(); } };

  // --- Render Component JSX ---
  return (
    <div className="flex h-full">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r border-border bg-card p-4">
        <Button 
          onClick={createNewChat}
          className="w-full mb-4"
          variant="outline"
        >
          New Chat
        </Button>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {chatHistories.map(chat => (
            <div
              key={chat.id}
              className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                currentChatId === chat.id ? 'bg-primary/10' : 'hover:bg-muted'
              }`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(chat.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b border-border p-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {PUTER_CHAT_MODELS.map(model => (
                  <SelectItem key={model.value} value={model.value} className="text-sm">
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'assistant' ? 'bg-muted/50' : ''
                    } p-4 rounded-lg`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {message.role === 'assistant' ? 'AI' : 'U'}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                      !
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[60px] max-h-[200px] resize-none"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              className="self-end"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
