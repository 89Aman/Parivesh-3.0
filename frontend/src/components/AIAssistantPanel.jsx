import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const QUICK_ACTIONS = [
  { label: 'Summarize', icon: 'summarize', q: 'Give a concise summary of this application.' },
  { label: 'Flag Issues', icon: 'flag', q: 'What are the key risks or missing information in this application?' },
  { label: 'Checklist', icon: 'checklist', q: 'Suggest a document checklist to scrutinize this application.' },
];

const TypingDots = () => (
  <div className="flex items-end gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/60"
        style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
      />
    ))}
  </div>
);

const AIAssistantPanel = ({ appId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (question) => {
    if (!question.trim() || isLoading) return;
    const q = question.trim();
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await api.post(`/ai/assist/${appId}`, { question: q });
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      const detail = err?.response?.data?.detail || 'AI error. Please try again.';
      setMessages((prev) => [...prev, { role: 'error', text: detail }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#22c55e]/20 bg-[#070f07] overflow-hidden w-full shadow-lg shadow-black/40">
      {/* Header */}
      <button
        className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] cursor-pointer select-none bg-gradient-to-r from-[#22c55e]/10 to-transparent hover:from-[#22c55e]/15 transition-all"
        onClick={() => setCollapsed((c) => !c)}
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#22c55e]/30 blur-sm" />
            <span className="relative material-symbols-outlined text-[#22c55e] text-base">smart_toy</span>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white leading-none">AI Scrutiny Assistant</p>
            <p className="text-[10px] text-white/40 mt-0.5">Powered by Gemini</p>
          </div>
          {isLoading && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping ml-1" />
          )}
        </div>
        <span className="material-symbols-outlined text-white/30 text-sm">
          {collapsed ? 'expand_more' : 'expand_less'}
        </span>
      </button>

      {!collapsed && (
        <>
          {/* Quick actions */}
          <div className="flex gap-1.5 px-3 pt-3 flex-wrap">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.q)}
                disabled={isLoading}
                type="button"
                className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#22c55e]/80 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all disabled:opacity-40 bg-[#22c55e]/5"
              >
                <span className="material-symbols-outlined text-[12px]">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>

          {/* Chat messages */}
          <div className="overflow-y-auto px-3 py-3 space-y-3 max-h-72 min-h-[80px] scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <span className="material-symbols-outlined text-2xl text-white/10">chat</span>
                <p className="text-[11px] text-white/25 text-center">Ask anything about this application</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex items-end gap-2 ${ m.role === 'user' ? 'flex-row-reverse' : '' }`}>
                  {/* Avatar */}
                  {m.role !== 'user' && (
                    <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center flex-shrink-0 mb-0.5">
                      <span className="material-symbols-outlined text-[#22c55e] text-[10px]">smart_toy</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#22c55e]/20 text-white rounded-br-sm'
                        : m.role === 'error'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-bl-sm'
                        : 'bg-white/[0.06] text-white/90 border border-white/5 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#22c55e] text-[10px]">smart_toy</span>
                </div>
                <div className="bg-white/[0.06] border border-white/5 rounded-2xl rounded-bl-sm px-3 py-2">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 pb-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this application…"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-[11px] text-white placeholder-white/25 outline-none focus:border-[#22c55e]/30 focus:bg-white/[0.07] disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#22c55e]/20 hover:bg-[#22c55e]/30 disabled:opacity-30 transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-[#22c55e] text-sm">send</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIAssistantPanel;
