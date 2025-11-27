'use client';

import { Flame } from 'lucide-react';
import dynamic from 'next/dynamic';

const ChatInterface = dynamic(() => import('./components/ChatInterface'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-orange-900 selection:text-orange-100">
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StoryForge</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
