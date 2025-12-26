
import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Loader2, Bot, TrendingUp, TrendingDown, Minus, Globe, Search } from 'lucide-react';
import { StockItem, GroundingChunk } from '../types';
import ReactMarkdown from 'react-markdown';
import { analyzeStockTrend } from '../services/geminiService';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
  trendType?: 'gainer' | 'loser' | 'neutral';
}

interface AnalysisData {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, trendType = 'neutral' }) => {
  const [analysis, setAnalysis] = useState<AnalysisData>({ text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stock) {
      setLoading(true);
      analyzeStockTrend(stock.ticker, stock.name)
        .then(res => setAnalysis({ text: res.text, groundingChunks: res.groundingChunks }))
        .catch(() => setAnalysis({ text: "분석에 실패했습니다.", groundingChunks: [] }))
        .finally(() => setLoading(false));
    } else {
      setAnalysis({ text: "" });
    }
  }, [stock]);

  // Generate simulated 1-month data based on current price and trend
  const chartData = useMemo(() => {
    if (!stock) return [];
    
    const priceStr = stock.price.replace(/[^0-9.]/g, '');
    const currentPrice = parseFloat(priceStr) || 10000;
    const data = [];
    let price = currentPrice;
    
    const today = new Date();
    
    // Bias for random walk
    let bias = 0;
    if (trendType === 'gainer') bias = -0.003; // If gainer today, past was likely lower (so we add negative bias when going back)
    else if (trendType === 'loser') bias = 0.003; // If loser today, past was likely higher
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.unshift({
        date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        price: Math.round(price)
      });
      
      // Random walk backwards
      const volatility = price * 0.02; // 2% daily volatility
      const change = (Math.random() - 0.5) * volatility;
      price = price - change + (price * bias);
      
      // Ensure price doesn't go below 0
      price = Math.max(price, 100);
    }
    return data;
  }, [stock, trendType]);

  if (!stock) return null;

  const isPositive = stock.change.startsWith('+') || trendType === 'gainer';
  const color = isPositive ? '#10b981' : (trendType === 'loser' ? '#ef4444' : '#6366f1');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {stock.name} 
              <span className="text-sm font-normal text-slate-500 font-mono">({stock.ticker})</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-800">{stock.price}원</span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stock.change}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Chart Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              최근 1개월 주가 추이 (시뮬레이션)
            </h4>
            <div className="h-[250px] w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10}} 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false}
                    interval={5}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    hide={false}
                    tick={{fontSize: 10}}
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString()}원`, '주가']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={color} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">* 과거 데이터 API 부재로 인한 시뮬레이션 차트입니다.</p>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 mb-6">
            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              AI 애널리스트 분석 요약
            </h4>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-indigo-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">최신 뉴스와 이슈를 분석하고 있습니다...</span>
              </div>
            ) : (
              <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                 <ReactMarkdown>{analysis.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Grounding Sources */}
          {!loading && analysis.groundingChunks && analysis.groundingChunks.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Search className="h-3 w-3" />
                분석 소스 (Google Search)
              </h4>
              <div className="flex flex-col gap-2">
                {analysis.groundingChunks.map((chunk, idx) => chunk.web && (
                  <a 
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-2 truncate"
                  >
                    <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                    {chunk.web.title || chunk.web.uri}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
