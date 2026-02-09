
import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const isKeyError = 
    error.includes("KTO_API_KEY") || 
    error.includes("API_KEY") || 
    error.includes("인증") || 
    error.includes("키");

  return (
    <div className="bg-rose-50 border border-rose-200 p-8 rounded-[2rem] text-rose-800 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h4 className="text-xl font-bold tracking-tight">서비스 연결 확인 필요</h4>
      </div>
      
      <p className="font-bold text-rose-600 mb-6 bg-white py-4 px-5 rounded-xl border border-rose-100 leading-relaxed shadow-sm">
        {error}
      </p>
      
      {isKeyError && (
        <div className="bg-white/50 p-6 rounded-2xl border border-rose-100 space-y-4 text-sm text-slate-600">
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-key text-amber-500"></i> 환경변수(Secrets) 설정이 필요합니다.
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 border-b text-xs font-bold text-slate-500 uppercase">Variable Name</th>
                  <th className="p-3 border-b text-xs font-bold text-slate-500 uppercase">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b font-mono text-emerald-600 font-bold">API_KEY</td>
                  <td className="p-3 border-b">Gemini AI (추천 가이드 생성용)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-blue-600 font-bold">KTO_API_KEY</td>
                  <td className="p-3">TourAPI (관광지 데이터 조회용)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">* 두 키를 모두 등록해야 AI 추천 결과가 정상적으로 표시됩니다.</p>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
