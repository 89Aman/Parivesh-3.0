import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

const STATUS_META = {
  SUBMITTED:      { dot: 'bg-blue-500',    label: 'bg-blue-500/15 text-blue-400' },
  UNDER_SCRUTINY: { dot: 'bg-amber-500',   label: 'bg-amber-500/15 text-amber-400' },
  EDS:            { dot: 'bg-red-500',     label: 'bg-red-500/15 text-red-400' },
  REFERRED:       { dot: 'bg-indigo-500',  label: 'bg-indigo-500/15 text-indigo-400' },
  MOM_GENERATED:  { dot: 'bg-purple-500',  label: 'bg-purple-500/15 text-purple-400' },
  FINALIZED:      { dot: 'bg-emerald-500', label: 'bg-emerald-500/15 text-emerald-400' },
  DRAFT:          { dot: 'bg-gray-500',    label: 'bg-gray-500/15 text-gray-400' },
};

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setFocused(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const search = useCallback(async (q) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setIsLoading(true);
    try {
      const res = await api.get('/search', { params: { q } });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 280);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (result) => {
    setOpen(false);
    navigate(ROUTES.PP_APPLICATION_DETAIL.replace(':appId', result.id));
  };

  const handleKeyDown = (e) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused((f) => Math.min(f + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused((f) => Math.max(f - 1, -1)); }
    if (e.key === 'Enter' && focused >= 0) handleSelect(results[focused]);
  };

  if (!isAuthenticated || !open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-[#0b160b] shadow-2xl shadow-black/80 overflow-hidden">
        {/* Glow accent top bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4">
          <span className={`material-symbols-outlined text-xl transition-colors ${ query.length > 0 ? 'text-[#22c55e]' : 'text-white/30' }`}>search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, states, categories…"
            className="flex-1 bg-transparent text-white placeholder-white/30 text-base outline-none"
          />
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-[#22c55e] animate-spin" />
          ) : (
            <kbd className="text-[10px] text-white/25 border border-white/10 rounded-lg px-2 py-1 font-mono">ESC</kbd>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div ref={listRef} className="border-t border-white/[0.06] divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
            {results.map((r, i) => {
              const meta = STATUS_META[r.status] || STATUS_META.DRAFT;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${ focused === i ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]' }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate leading-snug">{r.project_name}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {r.category}
                      {r.state ? ` · ${r.state}` : ''}
                      {r.district ? ` · ${r.district}` : ''}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${meta.label}`}>
                    {r.status?.replaceAll('_', ' ')}
                  </span>
                  <span className="material-symbols-outlined text-white/20 text-base">arrow_forward</span>
                </button>
              );
            })}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="border-t border-white/[0.06] flex flex-col items-center gap-2 py-10">
            <span className="material-symbols-outlined text-3xl text-white/10">search_off</span>
            <p className="text-sm text-white/30">No results for <span className="text-white/50">&ldquo;{query}&rdquo;</span></p>
          </div>
        )}

        {/* Footer hints */}
        <div className="border-t border-white/[0.06] px-5 py-2.5 flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <kbd className="text-[9px] text-white/25 border border-white/10 rounded px-1.5 py-0.5 font-mono">↑↓</kbd>
            <span className="text-[10px] text-white/25">navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="text-[9px] text-white/25 border border-white/10 rounded px-1.5 py-0.5 font-mono">↵</kbd>
            <span className="text-[10px] text-white/25">open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="text-[9px] text-white/25 border border-white/10 rounded px-1.5 py-0.5 font-mono">Ctrl K</kbd>
            <span className="text-[10px] text-white/25">toggle</span>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] text-white/20">{results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
