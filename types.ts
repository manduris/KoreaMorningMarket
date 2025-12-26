
export interface StockItem {
  ticker: string;
  name: string;
  price: string; // Added current price field
  change: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface AiTrend {
  rising: StockItem[];
  falling: StockItem[];
  summary: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Report {
  id: string;
  date: string;
  reportTitle: string;
  marketOverview: string;
  marketIndices: MarketIndex[];
  gainers: StockItem[];
  losers: StockItem[];
  aiTrend: AiTrend;
  economicContext: string;
  conclusion: string;
  groundingChunks?: GroundingChunk[];
}

export interface ScheduleConfig {
  isEnabled: boolean;
  time: string; // "09:00"
  days: string[]; // ["Mon", "Tue", ...]
}
