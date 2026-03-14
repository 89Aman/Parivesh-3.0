const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Open global search' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['N'], description: 'New application' },
  { keys: ['Esc'], description: 'Close modal / search' },
  { keys: ['G', 'D'], description: 'Go to Dashboard (PP)' },
  { keys: ['G', 'A'], description: 'Go to Admin Dashboard' },
];

const Key = ({ k }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[11px] font-mono text-white/80">
    {k}
  </kbd>
);

const KeyboardShortcutsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0f1f0f] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white/70">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <Key k={k} />
                    {j < s.keys.length - 1 && <span className="text-white/30 text-xs">then</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-white/30 text-center">Press <Key k="?" /> anywhere to toggle this guide</p>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
