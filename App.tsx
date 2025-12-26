
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketDashboard } from './components/MarketDashboard';
import { ReportView } from './components/ReportView';
import { SchedulerModal } from './components/SchedulerModal';
import { Report, ScheduleConfig } from './types';
import { generateMarketReport } from './services/geminiService';
import { ShieldCheck, ChevronRight, Lock, Key as KeyIcon, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  
  // Track if user has completed the key selection process for this session
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    const saved = localStorage.getItem('marketMorning_schedule');
    return saved ? JSON.parse(saved) : {
      isEnabled: false,
      time: "08:30",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    };
  });

  useEffect(() => {
    const checkInitialKey = async () => {
      // 1. Check if we already verified the key in this session
      const sessionVerified = sessionStorage.getItem('gemini_key_selected') === 'true';
      
      if (sessionVerified) {
        setIsKeySelected(true);
        return;
      }

      // 2. Otherwise check the bridge status
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
        if (hasKey) sessionStorage.setItem('gemini_key_selected', 'true');
      } else {
        // Fallback for standalone/local dev if env key exists
        const envKey = !!process.env.API_KEY;
        setIsKeySelected(envKey);
      }
    };
    checkInitialKey();
  }, []);

  const handleApiKeySelect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // Immediately treat as success to proceed (as per guidelines)
        sessionStorage.setItem('gemini_key_selected', 'true');
        setIsKeySelected(true);
      } catch (e) {
        console.error("API Key selection failed", e);
      }
    } else {
      alert("이 환경에서는 보안 API Key 선택 도구를 지원하지 않습니다.");
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await generateMarketReport();
      setReport(data);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.toString();
      
      // If error indicates key issue specifically tracked by bridge
      if (errorMsg.includes("Requested entity was not found")) {
        sessionStorage.removeItem('gemini_key_selected');
        setIsKeySelected(false);
        handleApiKeySelect();
        return;
      }
      
      // Updated detailed error message for user guidance
      alert("API 키가 유효하지 않거나 접근 권한이 없습니다. Google Cloud 콘솔에서 API 키를 확인하고, 필요한 경우 재발급 받아주세요.");
    } finally {
      setLoading(false);
    }
  };

  // Fix: Added missing handleSaveSchedule function
  const handleSaveSchedule = (config: ScheduleConfig) => {
    setScheduleConfig(config);
    localStorage.setItem('marketMorning_schedule', JSON.stringify(config));
  };

  if (isKeySelected === null) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Exact Match to User Provided Design Image
  if (!isKeySelected) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
        <div className="max-w-[400px] w-full bg-white rounded-[24px] shadow-2xl overflow-hidden">
          {/* Dark Header */}
          <div className="bg-[#0f172a] pt-12 pb-10 px-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-900/30 rounded-[20px] flex items-center justify-center border border-blue-500/20">
               <KeyIcon className="h-10 w-10 text-blue-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">API Key 설정</h1>
            <p className="text-slate-400 text-[15px] leading-snug">
              서비스 이용을 위해 Google Gemini API Key가 필요합니다.
            </p>
          </div>
          
          <div className="p-8 space-y-7">
            {/* Input Mockup Box */}
            <div className="space-y-3">
              <label className="text-[14px] font-semibold text-slate-700 ml-1">Gemini API Key</label>
              <div 
                onClick={handleApiKeySelect}
                className="group cursor-pointer flex items-center bg-[#f8fafc] border border-slate-200 rounded-[14px] p-4 transition-all hover:border-blue-400 hover:bg-white ring-0 hover:ring-4 hover:ring-blue-50"
              >
                <Lock className="h-5 w-5 text-slate-400 mr-3 group-hover:text-blue-500 transition-colors" />
                <span className="text-slate-400 text-[15px] select-none">AI Studio에서 발급받은 키 입력</span>
              </div>
            </div>

            {/* Info Notice Box */}
            <div className="bg-[#eff6ff] rounded-[14px] p-5 flex items-start gap-3 border border-[#dbeafe]">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[13px] leading-[1.6] text-[#1e40af]">
                <span className="font-bold">안전한 로컬 저장:</span> 입력하신 API Key는 서버로 전송되지 않으며, 사용자의 브라우저(Local Storage)에만 안전하게 저장됩니다.
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleApiKeySelect}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-[18px] rounded-[14px] shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <span className="text-[17px]">시작하기</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Link Footer */}
            <div className="text-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[13px] text-slate-400 underline underline-offset-4 hover:text-blue-600 transition-colors"
              >
                API Key가 없으신가요? 여기서 발급받으세요.
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header 
        onOpenScheduler={() => setIsSchedulerOpen(true)} 
        onOpenApiKey={handleApiKeySelect}
        isScheduled={scheduleConfig.isEnabled}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
           <h2 className="text-3xl font-bold text-slate-900">오늘의 국내 증시 대시보드</h2>
           <p className="text-slate-500 mt-2">KOSPI, KOSDAQ 실시간 스냅샷 및 인사이트</p>
        </div>

        <MarketDashboard indices={report?.marketIndices} />
        
        <div id="report-section" className="mt-8">
          <ReportView 
            report={report} 
            loading={loading} 
            onGenerate={handleGenerateReport}
            hasApiKey={true}
          />
        </div>
      </main>

      <SchedulerModal 
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSave={handleSaveSchedule}
        currentConfig={scheduleConfig}
      />
    </div>
  );
};

export default App;
