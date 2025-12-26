import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Globe, Activity, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MarketIndex } from '../types';

// Helper to generate 1 year of mock data
const generateMockVixData = () => {
  const data = [];
  let baseValue = 18.0; // VKOSPI 기준 베이스 (미국보다 약간 높게 설정)
  const today = new Date();
  
  // Create data for the last 365 days
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (364 - i));
    
    // Random walk
    const change = (Math.random() - 0.5) * 2; 
    baseValue = baseValue + change;
    
    // Mean reversion
    baseValue += (19 - baseValue) * 0.05;
    
    // Hard limits
    baseValue = Math.max(10, Math.min(50, baseValue));
    
    data.push({
      timestamp: date.getTime(),
      dateStr: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      VIX: Number(baseValue.toFixed(2))
    });
  }
  return data;
};

// Calculate VIX/Risk insights based on the latest data (Korean Market Context)
const getVixInsight = (currentVix: number) => {
  if (currentVix >= 25) {
    return {
      sentiment: "위험 회피 (Risk Off)",
      desc: "글로벌 변동성이 확대되며 외국인 자금 이탈 가능성이 높습니다.",
      stance: "보수적 접근 (Defensive)",
      stanceDesc: "현금 비중을 확대하고 낙폭 과대 우량주를 선별적으로 관찰하세요.",
      icon: <AlertTriangle className="h-5 w-5 text-rose-200" />,
      color: "text-rose-200"
    };
  } else if (currentVix >= 17) {
    return {
      sentiment: "관망세 (Caution)",
      desc: "대외 불확실성으로 인해 코스피가 박스권 등락을 보일 수 있습니다.",
      stance: "중립 (Neutral)",
      stanceDesc: "수급 주체가 뚜렷한 섹터 위주로 짧은 호흡의 매매가 유리합니다.",
      icon: <ShieldCheck className="h-5 w-5 text-amber-200" />,
      color: "text-amber-200"
    };
  } else {
    return {
      sentiment: "위험 선호 (Risk On)",
      desc: "시장 심리가 안정적이며 외국인/기관의 순매수 유입이 기대됩니다.",
      stance: "비중 확대 (Bullish)",
      stanceDesc: "반도체, 자동차 등 수출 주도주 및 성장주 비중 확대를 고려하세요.",
      icon: <TrendingUp className="h-5 w-5 text-emerald-200" />,
      color: "text-emerald-200"
    };
  }
};

// Default mock data tailored for Korean Market context
const defaultIndices: MarketIndex[] = [
  { name: "KOSPI", value: "2,650.45", change: "+0.8%", isPositive: true },
  { name: "KOSDAQ", value: "870.12", change: "+1.2%", isPositive: true },
  { name: "USD/KRW", value: "1,345.50", change: "+0.3%", isPositive: true }, // 환율 상승은 통상 원화 약세
  { name: "S&P 500", value: "5,234.18", change: "+0.5%", isPositive: true },
  { name: "VIX", value: "15.50", change: "-1.2%", isPositive: true }, // VIX 하락은 긍정적
];

interface MarketDashboardProps {
  indices?: MarketIndex[];
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({ indices }) => {
  const displayIndices = indices && indices.length > 0 ? indices : defaultIndices;

  // Extract Real-time VIX value if available
  const realVixItem = displayIndices.find(i => i.name.toUpperCase().includes('VIX'));
  const realVixValue = realVixItem ? parseFloat(realVixItem.value.replace(/[^0-9.]/g, '')) : null;

  // Memoize chart data to adjust based on real VIX value
  const chartData = useMemo(() => {
    const data = generateMockVixData();
    
    if (realVixValue !== null && !isNaN(realVixValue)) {
      const lastMockVal = data[data.length - 1].VIX;
      const diff = realVixValue - lastMockVal;
      return data.map(d => ({
        ...d,
        VIX: Math.max(0, Number((d.VIX + diff).toFixed(2)))
      }));
    }
    
    return data;
  }, [realVixValue]);

  const latestVix = chartData[chartData.length - 1].VIX;
  const insight = getVixInsight(latestVix);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Key Indices Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {displayIndices.map((idx) => (
          <div key={idx.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-sm font-semibold truncate pr-2" title={idx.name}>{idx.name}</span>
              {idx.isPositive ? (
                <div className="bg-emerald-100 p-1 rounded-full shrink-0">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                </div>
              ) : (
                <div className="bg-rose-100 p-1 rounded-full shrink-0">
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                </div>
              )}
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 block truncate">{idx.value}</span>
              <span className={`text-sm font-medium ${idx.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {idx.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Chart Section */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            시장 변동성 (VIX / 리스크 지표)
          </h2>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900 block">{latestVix}</span>
            <span className="text-xs text-slate-400">실시간 리스크 수준</span>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVix" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="dateStr" 
                tick={{fontSize: 10}} 
                stroke="#94a3b8" 
                axisLine={false} 
                tickLine={false}
                interval={30} 
              />
              <YAxis 
                domain={['auto', 'auto']}
                hide={false}
                tick={{fontSize: 10}}
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip 
                labelStyle={{ color: '#64748b' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="VIX" 
                stroke="#ef4444" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVix)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Card - Global Economic Insight */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-800 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-300" />
            글로벌 경제 & 한국 시장
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              {insight.icon}
              <span className={`text-sm font-bold ${insight.color}`}>{insight.sentiment}</span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed opacity-90">
              {insight.desc} 한국 시장은 대외 변수에 민감합니다.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 bg-white/5 -mx-6 px-6 -mb-6 py-4 rounded-b-xl">
          <div className="flex items-start gap-3">
             <div className="bg-white/10 p-2 rounded-lg mt-0.5">
               <TrendingUp className="h-5 w-5 text-white" />
             </div>
             <div>
               <p className="text-xs text-blue-200 font-medium mb-0.5">투자 전략 제안</p>
               <p className="font-bold text-base mb-1">{insight.stance}</p>
               <p className="text-xs text-blue-200/70 leading-snug">
                 {insight.stanceDesc}
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};