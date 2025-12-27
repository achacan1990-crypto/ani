
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-lg shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">Motion<span className="gradient-text">Flow</span> <span className="text-xs font-light text-slate-500 uppercase tracking-widest">AI</span></span>
      </div>
      <div className="flex items-center gap-6">
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">Billing Docs</a>
        <div className="h-4 w-px bg-white/10"></div>
        <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</button>
      </div>
    </header>
  );
};

export default Header;
