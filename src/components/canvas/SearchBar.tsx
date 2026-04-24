'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Search, X } from 'lucide-react';
import { useFamilyStore } from '../../lib/store';
import { Person } from '../../lib/types';
interface SearchResult {
    person: Person;
    nodeId: string;
}
export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { setCenter, getNode } = useReactFlow();
    const { persons, nodes } = useFamilyStore();
    // Search logic — fuzzy match on fullName, maidenName, occupation, birthYear
    const handleSearch = useCallback(
        (value: string) => {
            setQuery(value);
            if (!value.trim()) {
                setResults([]);
                setIsOpen(false);
                return;
            }
            const q = value.trim().toLowerCase();
            const matched: SearchResult[] = [];
            for (const person of persons) {
                const haystack = [
                    person.fullName,
                    person.maidenName ?? '',
                    person.occupation ?? '',
                    String(person.birthYear),
                    person.birthPlace ?? '',
                ]
                    .join(' ')
                    .toLowerCase();
                if (haystack.includes(q)) {
                    // Find the corresponding React Flow node
                    const rfNode = nodes.find((n) => n.id === person.id);
                    if (rfNode) {
                        matched.push({ person, nodeId: rfNode.id });
                    }
                }
            }
            setResults(matched.slice(0, 8)); // cap at 8 results
            setIsOpen(matched.length > 0);
        },
        [persons, nodes]
    );
    // Pan & zoom to the node
    const navigateTo = useCallback(
        (nodeId: string, personName: string) => {
            const node = getNode(nodeId);
            if (!node) return;
            const x = node.position.x + (node.measured?.width ?? 280) / 2;
            const y = node.position.y + (node.measured?.height ?? 90) / 2;
            setCenter(x, y, { zoom: 1.2, duration: 700 });
            setHighlightedId(nodeId);
            setIsOpen(false);
            setQuery(personName);
            // Remove highlight after animation
            setTimeout(() => setHighlightedId(null), 2500);
        },
        [getNode, setCenter]
    );
    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setHighlightedId(null);
        inputRef.current?.focus();
    };
    const isMale = (person: Person) => person.gender === 'male';
    return (
        <>
            {/* Highlighted node pulse overlay — rendered on top of ReactFlow */}
            {highlightedId && (
                <HighlightPulse nodeId={highlightedId} />
            )}
            <div
                ref={containerRef}
                className="absolute top-5 right-6 z-20"
                style={{ width: 300 }}
            >
                {/* Input */}
                <div className="relative group">
                    <Search
                        className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors pointer-events-none"
                        aria-hidden
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => results.length > 0 && setIsOpen(true)}
                        placeholder="חיפוש באילן..."
                        dir="rtl"
                        aria-label="חיפוש אדם באילן"
                        className="w-full pr-10 pl-10 py-3 bg-white/90 backdrop-blur-md border border-stone-200 rounded-2xl text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all hover:border-stone-300 text-right text-slate-800 placeholder:text-stone-400"
                    />
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                            aria-label="נקה חיפוש"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {/* Dropdown */}
                {isOpen && results.length > 0 && (
                    <div
                        className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
                        style={{ maxHeight: 320, overflowY: 'auto' }}
                        dir="rtl"
                    >
                        <div className="px-3 py-2 border-b border-stone-100">
                            <span className="text-xs text-stone-400 font-medium">
                                נמצאו {results.length} תוצאות
                            </span>
                        </div>
                        <ul>
                            {results.map(({ person, nodeId }) => {
                                const male = isMale(person);
                                const dateText = person.isAlive
                                    ? `נולד ${person.birthYear}`
                                    : `${person.birthYear} – ${person.deathYear ?? '?'}`;
                                const initials = person.fullName
                                    .split(' ')
                                    .filter((n) => n.length > 0)
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase();
                                return (
                                    <li key={nodeId}>
                                        <button
                                            onClick={() => navigateTo(nodeId, person.fullName)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-right group/item"
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm
                          ${male ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-rose-700'}`}
                                            >
                                                {person.photoUrl ? (
                                                    <img
                                                        src={person.photoUrl}
                                                        alt={person.fullName}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    initials
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm truncate leading-tight">
                                                    {person.fullName}
                                                </p>
                                                <p className="text-xs text-stone-400 mt-0.5 truncate">
                                                    {dateText}
                                                    {person.occupation && ` · ${person.occupation}`}
                                                </p>
                                            </div>
                                            {/* Arrow indicator */}
                                            <span className="text-stone-300 group-hover/item:text-amber-400 transition-colors text-lg leading-none flex-shrink-0">
                                                ◎
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {/* No results */}
                {isOpen && results.length === 0 && query.trim() && (
                    <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-100 px-4 py-4 text-center text-sm text-stone-400" dir="rtl">
                        לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;
                    </div>
                )}
            </div>
        </>
    );
}
// ── Pulse highlight overlay ──────────────────────────────────────────────────
function HighlightPulse({ nodeId }: { nodeId: string }) {
    const { getNode } = useReactFlow();
    const node = getNode(nodeId);
    if (!node) return null;
    return (
        <div
            style={{
                position: 'absolute',
                left: node.position.x - 8,
                top: node.position.y - 8,
                width: (node.measured?.width ?? 280) + 16,
                height: (node.measured?.height ?? 90) + 16,
                borderRadius: 20,
                border: '3px solid #f59e0b',
                boxShadow: '0 0 0 6px rgba(245,158,11,0.25)',
                animation: 'searchPulse 0.6s ease-in-out infinite alternate',
                pointerEvents: 'none',
                zIndex: 50,
            }}
        />
    );
}

