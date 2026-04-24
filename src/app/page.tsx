'use client';

import React, { useEffect } from 'react';
import MegaTree from '../components/canvas/MegaTree';
import { useFamilyStore } from '../lib/store';
import { Share2, UserPlus } from 'lucide-react';
import AddFamilyMemberDrawer from '../components/canvas/AddFamilyMemberDrawer';

export default function Home() {
  const { rebuildGraph, openAddDrawer } = useFamilyStore();

  useEffect(() => {
    rebuildGraph();
  }, [rebuildGraph]);

  const handleShare = () => {
    console.log('Share feature coming soon...');
  };

  return (
    <main className="w-screen h-screen flex flex-col relative">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-wood-dark flex items-center gap-2">
            Family Roots <span className="text-accent-amber">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-md border border-stone-100 rounded-full text-stone-600 hover:text-wood-dark shadow-sm transition-all hover:border-stone-200 font-medium text-sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            שתף עץ
          </button>
        </div>
      </header>

      <div className="h-full w-full transition-all duration-300 ease-in-out">
        <MegaTree />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <button
          onClick={() => openAddDrawer({ action: 'add_root' })}
          className="flex items-center gap-3 px-6 py-3.5 bg-wood-dark text-white rounded-full shadow-[0_8px_30px_rgba(44,30,20,0.3)] hover:shadow-[0_8px_30px_rgba(44,30,20,0.45)] hover:-translate-y-1 transition-all duration-300 font-medium border border-wood-light"
        >
          <div className="bg-accent-amber/20 p-1.5 rounded-full">
            <UserPlus className="w-4 h-4 text-accent-amber" />
          </div>
          <span>הוספת אדם חדש לעץ</span>
        </button>
      </div>

      <AddFamilyMemberDrawer />
    </main>
  );
}
