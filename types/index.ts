// types/index.ts - Updated with consistent property names
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: any;
  last_updated: string;
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

// Updated NewsItem interface with consistent property names
export interface NewsItem {
  id: number;
  title: string;
  description: string;
  content?: string; // Add this field for full content
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  urlToImage?: string;
}


export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}
