
import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const isKeyError = error.includes("KTO_API_KEY") || error.includes("인증") || error.includes("키");

  return (
    <div className="bg-rose-50 border border-rose-200 p-8 rounded-[2rem] text-rose-800 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h4 className="text-xl font-bold tracking-tight">잠시 확인해 주세요!</h4>
      </div>
      
      <p className="font-bold text-rose-600 mb-6 bg-white py-4 px-5 rounded-xl border border-rose-100 leading-relaxed shadow-sm">
        {error}
      </p>
      
      {isKeyError && (
        <div className="bg-white/50 p-6 rounded-2xl border border-rose-100 space-y-4 text-sm text-slate-600">
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-amber-500"></i> 해결 가이드
          </p>
          <ol className="list-decimal list-inside space-y-2 leading-relaxed">
            <li>에디터의 <b>Secrets</b> 또는 <b>Environment Variables</b> 설정을 엽니다.</li>
            <li>변수명을 <code>KTO_API_KEY</code>로 생성합니다.</li>
            <li>공공데이터포털에서 발급받은 <b>서비스키</b>를 값에 넣습니다.</li>
            <li>설정 후 페이지를 <b>새로고침</b>하여 다시 시도하세요.</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
