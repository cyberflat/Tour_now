
import React, { useState, useEffect } from 'react';
import { CompanionType, Recommendation, TourState, KTOPlace } from './types';
import { getPlacesByLocation, getPlacesByKeyword, getPlaceDetail } from './services/ktoService';
import { generateRecommendationReason } from './services/geminiService';

const COMPANIONS: { type: CompanionType; icon: string; label: string }[] = [
  { type: '가족', icon: 'fa-face-smile', label: '가족' },
  { type: '커플', icon: 'fa-heart', label: '커플' },
  { type: '나홀로', icon: 'fa-user', label: '나홀로' },
  { type: '친구', icon: 'fa-users', label: '친구' },
];

const App: React.FC = () => {
  const [state, setState] = useState<TourState>({
    locationInput: '',
    companion: '커플',
    isLoading: false,
    error: null,
    results: [],
  });

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation denied.");
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!state.locationInput.trim() && !coords) {
      setState(prev => ({ ...prev, error: "지역명을 입력하거나 현재 위치 권한을 허용해 주세요." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, results: [] }));
    
    try {
      let rawPlaces: KTOPlace[] = [];
      
      if (state.locationInput.trim()) {
        rawPlaces = await getPlacesByKeyword(state.locationInput);
      } else if (coords) {
        rawPlaces = await getPlacesByLocation(coords.latitude, coords.longitude);
      }

      if (!rawPlaces || rawPlaces.length === 0) {
        throw new Error("해당 지역의 관광 정보를 찾을 수 없습니다.");
      }

      const topPlaces = rawPlaces.slice(0, 3);

      const analyzedResults: Recommendation[] = await Promise.all(
        topPlaces.map(async (place) => {
          const overview = await getPlaceDetail(place.contentid);
          const aiReason = await generateRecommendationReason(place.title, overview, state.companion);
          return { ...place, overview, aiReason };
        })
      );

      setState(prev => ({ ...prev, results: analyzedResults, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const getNaverMapLink = (title: string, addr: string) => {
    const query = `${addr} ${title}`.trim();
    return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-10">
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 md:p-10 border border-slate-100">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">어디로 떠나볼까요?</h2>
              <p className="text-slate-500">원하시는 지역을 입력해 주세요.</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={coords ? "현재 위치 주변 검색 (또는 지역 입력)" : "도시명 또는 관광지명을 입력해 주세요"}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg focus:border-emerald-400 focus:bg-white transition-all outline-none text-slate-700"
                  value={state.locationInput}
                  onChange={(e) => setState(prev => ({ ...prev, locationInput: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {COMPANIONS.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setState(prev => ({ ...prev, companion: item.type }))}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                      state.companion === item.type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : 'border-slate-50 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSearch}
                disabled={state.isLoading}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                  state.isLoading ? 'bg-slate-100 text-slate-400' : 'gradient-bg text-white hover:opacity-90'
                }`}
              >
                {state.isLoading ? '분석 중...' : 'AI 추천 받기'}
              </button>
            </div>
          </div>
        </section>

        {state.error && (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-[2rem] text-rose-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <i className="fa-solid fa-circle-exclamation text-rose-500 text-2xl"></i>
              <h4 className="text-xl font-bold tracking-tight">잠시 확인해 주세요!</h4>
            </div>
            <p className="font-bold text-rose-600 mb-6 bg-white py-3 px-4 rounded-xl border border-rose-100">
              {state.error}
            </p>
            
            {(state.error.includes("KTO_API_KEY") || state.error.includes("인증")) && (
              <div className="bg-white/50 p-6 rounded-2xl border border-rose-100 space-y-3 text-sm text-slate-600">
                <p className="font-bold text-slate-800">✅ 해결 방법:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>에디터 좌측 하단 또는 설정 메뉴에서 <b>Secrets</b> 혹은 <b>Environment Variables</b>를 찾으세요.</li>
                  <li>새로운 변수를 추가합니다: 이름은 <code>KTO_API_KEY</code>로 하세요.</li>
                  <li>값에는 공공데이터포털에서 발급받은 <b>서비스키</b>를 붙여넣으세요.</li>
                  <li>저장 후 페이지를 새로고침하여 다시 시도해 보세요.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {state.results.length > 0 && !state.isLoading && (
          <div className="grid grid-cols-1 gap-8">
            {state.results.map((rec, idx) => (
              <div key={rec.contentid} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 flex flex-col md:flex-row">
                <div className="md:w-72 h-48 md:h-auto">
                  <img src={rec.firstimage || 'https://via.placeholder.com/400x300?text=No+Image'} alt={rec.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-2xl font-bold">{rec.title}</h4>
                    <a href={getNaverMapLink(rec.title, rec.addr1)} target="_blank" className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-bold">지도 보기</a>
                  </div>
                  <p className="text-slate-400 text-sm mb-4"><i className="fa-solid fa-map-pin"></i> {rec.addr1}</p>
                  <div className="bg-slate-50 p-5 rounded-2xl text-slate-700 italic border-l-4 border-emerald-400">
                    "{rec.aiReason}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
