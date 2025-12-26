import React from 'react';
import { TrendingUp, Bell, Key } from 'lucide-react';

interface HeaderProps {
  onOpenScheduler: () => void;
  onOpenApiKey: () => void;
  isScheduled: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScheduler, onOpenApiKey, isScheduled }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Korea Market Watch AI</h1>
            <p className="text-xs text-slate-500 font-medium">한국 증시 & 글로벌 경제 인사이트</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenApiKey}
            className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
            title="API Key 설정"
          >
            <Key className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">API 설정</span>
          </button>

          <button
            onClick={onOpenScheduler}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              isScheduled 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bell className={`h-4 w-4 ${isScheduled ? 'fill-emerald-700' : ''}`} />
            <span className="hidden sm:inline">{isScheduled ? '브리핑 예약됨' : '브리핑 설정'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};