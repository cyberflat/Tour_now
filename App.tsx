
import React, { useState, useEffect } from 'react';
import { Recommendation, TourState, KTOPlace, CompanionType } from './types';
import { getPlacesByLocation, getPlacesByKeyword, getPlaceDetail } from './services/ktoService';
import { generateRecommendationReason } from './services/geminiService';

// Components
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import PlaceCard from './components/PlaceCard';
import ErrorDisplay from './components/ErrorDisplay';

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
        () => console.warn("Geolocation denied.")
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!state.locationInput.trim() && !coords) {
      setState(prev => ({ ...prev, error: "지역명을 입력하거나 위치 권한을 허용해 주세요." }));
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
        throw new Error("검색 결과가 없습니다. 다른 지역명을 입력해 보세요.");
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-10">
        <SearchForm 
          locationInput={state.locationInput}
          setLocationInput={(val) => setState(prev => ({ ...prev, locationInput: val }))}
          companion={state.companion}
          setCompanion={(val) => setState(prev => ({ ...prev, companion: val }))}
          onSearch={handleSearch}
          isLoading={state.isLoading}
          hasCoords={!!coords}
        />

        {state.error && <ErrorDisplay error={state.error} />}

        {state.results.length > 0 && !state.isLoading && (
          <section className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 px-2">
              <span className="w-2 h-8 gradient-bg rounded-full"></span>
              AI 추천 여행 명소
            </h3>

            <div className="grid grid-cols-1 gap-8">
              {state.results.map((rec, idx) => (
                <PlaceCard key={rec.contentid} recommendation={rec} rank={idx + 1} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 text-center mt-12">
        <p className="text-slate-400 text-sm font-medium">© 2024 여기어때 투어 AI. 데이터 제공: 한국관광공사</p>
      </footer>
    </div>
  );
};

export default App;
