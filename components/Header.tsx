
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
            <i className="fa-solid fa-plane-up"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
              여기어때 <span className="text-emerald-500">투어 AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Powered by Gemini & TourAPI</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
