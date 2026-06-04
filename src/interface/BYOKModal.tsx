import { Eye, EyeOff, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useUiStore } from '../integration/store/uiStore';
import { DEFAULT_MODELS } from '../core/llm/constants';

interface BYOKModalProps {
  onClose: () => void;
}

const STORAGE_KEY = 'byok-config';

const KeyField: React.FC<{
  label: string;
  hint: string;
  href: string;
  hrefLabel: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}> = ({ label, hint, href, hrefLabel, value, onChange, placeholder, optional }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 ml-1">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300">{label}</label>
        {optional && (
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-200 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
            Optional
          </span>
        )}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-full transition-all mb-2"
      >
        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">{hrefLabel}</span>
        <svg className="text-emerald-500" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
        </svg>
      </a>
      <p className="text-zinc-400 text-xs mb-3 leading-relaxed">{hint}</p>
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Paste your API key here'}
          className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-5 py-3.5 pr-12 text-sm text-darkDelegation font-mono placeholder:text-zinc-300 placeholder:font-sans focus:outline-none focus:border-zinc-200 transition-all shadow-sm group-hover:shadow-md"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
        >
          {show ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};

const BYOKModal: React.FC<BYOKModalProps> = ({ onClose }) => {
  const { llmConfig, setLlmConfig, byokError } = useUiStore();
  const [claudeKey, setClaudeKey] = useState(llmConfig.claudeApiKey || '');
  const [geminiKey, setGeminiKey] = useState(llmConfig.geminiApiKey || '');
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  const handleSave = () => {
    const config = {
      claudeApiKey: claudeKey.trim(),
      geminiApiKey: geminiKey.trim(),
      model: llmConfig.model || DEFAULT_MODELS.text,
    };
    setLlmConfig(config);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { }
    onClose();
  };

  const handleClear = () => {
    const empty = { claudeApiKey: '', geminiApiKey: '', model: llmConfig.model || DEFAULT_MODELS.text };
    setClaudeKey('');
    setGeminiKey('');
    setLlmConfig(empty);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(empty)); } catch { }
  };

  const hasAnyKey = !!(claudeKey || geminiKey);
  const isSaved = !!(llmConfig.claudeApiKey || llmConfig.geminiApiKey);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 pointer-events-auto overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-white/60 backdrop-blur-xl" />
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-zinc-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-600 transition-colors cursor-pointer">
          <X size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-black text-darkDelegation tracking-tight mb-1">API Keys</h2>
          <p className="text-zinc-400 text-sm font-medium">Keys are stored locally and never leave your browser.</p>
        </div>

        {/* Error */}
        {byokError && (() => {
          const isLong = byokError.length > 120;
          const display = isErrorExpanded || !isLong ? byokError : byokError.slice(0, 110) + '...';
          return (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2">
              <div className="mt-0.5 text-red-500 shrink-0"><X size={14} strokeWidth={3} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-0.5">API Error</p>
                <p className="text-[11px] font-medium text-red-600 leading-tight break-words whitespace-pre-wrap">{display}</p>
                {isLong && (
                  <button onClick={() => setIsErrorExpanded(v => !v)} className="mt-1 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 cursor-pointer">
                    {isErrorExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Claude key — primary */}
        <KeyField
          label="Claude API Key"
          hint="Used for all text generation and agent reasoning."
          href="https://console.anthropic.com/settings/keys"
          hrefLabel="Get Claude API Key"
          value={claudeKey}
          onChange={setClaudeKey}
          placeholder="sk-ant-..."
        />

        {/* Gemini key — optional, for media */}
        <KeyField
          label="Gemini API Key"
          hint="Required only for image, music, and video generation."
          href="https://aistudio.google.com/app/apikey"
          hrefLabel="Get Gemini API Key"
          value={geminiKey}
          onChange={setGeminiKey}
          placeholder="AIza..."
          optional
        />

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={handleClear}
            disabled={!isSaved && !hasAnyKey}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <div className="p-2 rounded-xl group-hover:bg-red-50 transition-colors">
              <Trash2 size={16} strokeWidth={2.5} />
            </div>
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!hasAnyKey}
            className="px-12 py-4 bg-darkDelegation text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-black/10"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BYOKModal;
