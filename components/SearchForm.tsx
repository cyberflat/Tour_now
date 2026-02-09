
import React from 'react';
import { CompanionType } from '../types';

interface SearchFormProps {
  locationInput: string;
  setLocationInput: (val: string) => void;
  companion: CompanionType;
  setCompanion: (val: CompanionType) => void;
  onSearch: () => void;
  isLoading: boolean;
  hasCoords: boolean;
}

const COMPANIONS: { type: CompanionType; icon: string; label: string }[] = [
  { type: '가족', icon: 'fa-face-smile', label: '가족' },
  { type: '커플', icon: 'fa-heart', label: '커플' },
  { type: '나홀로', icon: 'fa-user', label: '나홀로' },
  { type: '친구', icon: 'fa-users', label: '친구' },
];

const SearchForm: React.FC<SearchFormProps> = ({
  locationInput,
  setLocationInput,
  companion,
  setCompanion,
  onSearch,
  isLoading,
  hasCoords
}) => {
  return (
    <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 md:p-10 border border-slate-100">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">어디로 떠나볼까요?</h2>
          <p className="text-slate-500">동행인에게 딱 맞는 명소를 추천해 드릴게요.</p>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <input
              type="text"
              placeholder={hasCoords ? "현재 위치 주변 검색 (또는 지역 입력)" : "도시명 또는 관광지명을 입력해 주세요"}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg focus:border-emerald-400 focus:bg-white transition-all outline-none text-slate-700"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
              <i className="fa-solid fa-magnifying-glass group-focus-within:text-emerald-500"></i>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {COMPANIONS.map((item) => (
              <button
                key={item.type}
                onClick={() => setCompanion(item.type)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                  companion === item.type
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm'
                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-lg`}></i>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onSearch}
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all shadow-lg ${
              isLoading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'gradient-bg text-white hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <><i className="fa-solid fa-circle-notch animate-spin"></i> 분석 중...</>
            ) : (
              <><i className="fa-solid fa-sparkles"></i> AI 추천 결과 보기</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchForm;
