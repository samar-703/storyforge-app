'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Character {
  name: string;
  description: string;
  personality: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [characterForm, setCharacterForm] = useState<Character>({
    name: '',
    description: '',
    personality: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const scrollToBottom = () => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Only auto-scroll when new messages are added, not during streaming
    if (messages.length > 0 && !isLoading) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleCharacterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterForm.name.trim()) {
      setCharacter(characterForm);
      
      // Add character details as the first message in chat
      const characterMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `I want to create a character named ${characterForm.name}${
          characterForm.description ? `. Description: ${characterForm.description}` : ''
        }${characterForm.personality ? `. Personality: ${characterForm.personality}` : ''
        }. Let's start an adventure!`,
      };
      
      setMessages([characterMessage]);
      setIsModalOpen(false);
      
      // Auto-send to get AI response
      handleAIResponse(characterMessage);
    }
  };

  const handleAIResponse = async (userMessage: Message) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          character: characterForm,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + text }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content}) => ({
            role,
            content,
          })),
          character,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + text }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* Character Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 p-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Your Character</h2>
                  <p className="mt-1 text-sm text-zinc-400">Design a unique character for your story. Fill in the details below.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCharacterSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Name</label>
                    <input
                      required
                      className="w-full rounded-xl border border-orange-600 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-600"
                      placeholder="Enter character name"
                      value={characterForm.name}
                      onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Description</label>
                    <textarea
                      rows={3}
                      className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                      placeholder="Describe your character's appearance and background"
                      value={characterForm.description}
                      onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Personality</label>
                    <textarea
                      rows={2}
                      className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                      placeholder="Describe your character's personality traits"
                      value={characterForm.personality}
                      onChange={(e) => setCharacterForm({ ...characterForm, personality: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-500"
                    >
                      Create Character
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Hero Section - Always Visible */}
          <div className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex max-w-2xl flex-col items-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900 ring-1 ring-zinc-800">
                <Flame className="h-12 w-12 text-orange-500" />
              </div>
              <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Craft Your Narrative
              </h1>
              <p className="mb-10 text-xl text-zinc-400">
                Enter a prompt and watch as AI weaves a unique and<br />captivating story just for you.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-900/20"
              >
                <Plus className="h-5 w-5" />
                Create Your Character
              </button>
            </motion.div>
          </div>

          {/* Messages Area */}
          {messages.length > 0 && (
            <div className="px-4 pb-8">
              <div className="mx-auto flex max-w-3xl flex-col gap-6">
                {messages.map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-2xl border px-6 py-4 text-base leading-7 ${
                        m.role === 'user'
                          ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-300'
                      }`}
                    >
                      {m.content || (m.role === 'assistant' && isLoading && index === messages.length - 1) ? (
                        m.content
                      ) : null}
                    </div>
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500" />
                      <span className="ml-2 font-medium">Cooking your story...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="sticky bottom-0 w-full bg-black/80 backdrop-blur-xl p-6 pb-8">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 pr-14 text-base text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={character ? `What happens next for ${character.name}?` : "Start your adventure..."}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white transition-all hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="mt-3 text-center text-xs text-zinc-500">
            AI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}
