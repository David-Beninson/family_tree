'use client';

import React from 'react';
import MegaTree from '../components/canvas/MegaTree';
import { Plus, Share2, Search } from 'lucide-react';

export default function Home() {
  const handleAlert = (action: string) => {
    window.alert(`פעולה זו פותחת את: ${action}`);
  };

  return (
    <main className="w-screen h-screen flex flex-col bg-parchment text-wood-dark overflow-hidden font-sans">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-wood-dark flex items-center gap-2">
            Family Roots <span className="text-accent-amber">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-accent-amber transition-colors" />
            <input
              type="text"
              placeholder="חיפוש באילן..."
              dir="rtl"
              className="pl-10 pr-6 py-3 bg-white/80 backdrop-blur-md border border-stone-100 rounded-full text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-accent-amber/10 w-72 transition-all hover:border-stone-200 text-right"
              onClick={() => handleAlert('שורת חיפוש')}
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-md border border-stone-100 rounded-full text-stone-600 hover:text-wood-dark shadow-sm transition-all hover:border-stone-200 font-medium text-sm"
            onClick={() => handleAlert('שיתוף עץ')}
          >
            <Share2 className="w-4 h-4" />
            שתף עץ
          </button>
        </div>
      </header>

      <div className="h-full w-full">
        <MegaTree />
      </div>

      <div className="fixed bottom-10 left-10 z-20">
        <button
          onClick={() => handleAlert('חלון הוספת בן אדם חדש')}
          className="w-16 h-16 bg-sky-400 text-white rounded-full shadow-2xl hover:bg-sky-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus className="w-8 h-8" strokeWidth={2.5} />
        </button>
      </div>
    </main>
  );
}