
import React from 'react';
import { Recommendation } from '../types';

interface PlaceCardProps {
  recommendation: Recommendation;
  rank: number;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ recommendation: rec, rank }) => {
  const getNaverMapLink = (title: string, addr: string) => {
    const query = `${addr} ${title}`.trim();
    return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-white shadow-lg card-hover flex flex-col md:flex-row">
      <div className="md:w-72 h-56 md:h-auto overflow-hidden bg-slate-100 relative">
        {rec.firstimage ? (
          <img src={rec.firstimage} alt={rec.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-sm">이미지 없음</div>
        )}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">
          RANK #{rank}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h4 className="text-2xl font-bold text-slate-800">{rec.title}</h4>
            <a 
              href={getNaverMapLink(rec.title, rec.addr1)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#03C75A] text-white rounded-xl text-sm font-bold hover:brightness-95 transition-all shadow-md"
            >
              <i className="fa-solid fa-location-dot"></i>
              네이버 지도
            </a>
          </div>
          <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
            <i className="fa-solid fa-map-pin text-emerald-400"></i> {rec.addr1}
          </p>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 italic text-slate-700 leading-relaxed font-medium">
            <i className="fa-solid fa-quote-left text-emerald-300 mb-2 block text-xl"></i>
            {rec.aiReason}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
