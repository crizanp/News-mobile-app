
import { Coin, NewsItem, TrendingCoin } from '../types';

// CryptoCompare API (free tier available)
const CRYPTOCOMPARE_BASE_URL = 'https://min-api.cryptocompare.com/data';
const CRYPTOCOMPARE_NEWS_URL = 'https://min-api.cryptocompare.com/data/v2/news';

export const cryptoApi = {
  // Get top cryptocurrencies using CryptoCompare API
  getTopCoins: async (limit: number = 10): Promise<Coin[]> => {
    try {
      console.log('Fetching top coins from CryptoCompare API...');
      
      const response = await fetch(
        `${CRYPTOCOMPARE_BASE_URL}/top/mktcapfull?limit=${limit}&tsym=USD`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`CryptoCompare API error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('CryptoCompare API response received');
      
      // Transform CryptoCompare data to match our Coin interface
      const transformedCoins: Coin[] = result.Data.map((item: any, index: number) => ({
        id: item.CoinInfo.Name.toLowerCase(),
        symbol: item.CoinInfo.Name,
        name: item.CoinInfo.FullName,
        image: `https://www.cryptocompare.com${item.CoinInfo.ImageUrl}`,
        current_price: item.RAW?.USD?.PRICE || 0,
        market_cap: item.RAW?.USD?.MKTCAP || 0,
        market_cap_rank: index + 1,
        fully_diluted_valuation: item.RAW?.USD?.MKTCAP || 0,
        total_volume: item.RAW?.USD?.TOTALVOLUME24H || 0,
        high_24h: item.RAW?.USD?.HIGH24HOUR || 0,
        low_24h: item.RAW?.USD?.LOW24HOUR || 0,
        price_change_24h: item.RAW?.USD?.CHANGE24HOUR || 0,
        price_change_percentage_24h: item.RAW?.USD?.CHANGEPCT24HOUR || 0,
        market_cap_change_24h: item.RAW?.USD?.MKTCAPCHANGE24HOUR || 0,
        market_cap_change_percentage_24h: item.RAW?.USD?.MKTCAPCHANGEPCT24HOUR || 0,
        circulating_supply: item.RAW?.USD?.SUPPLY || 0,
        total_supply: item.RAW?.USD?.TOTALTOPLYTOSUPPLY || 0,
        max_supply: null,
        ath: item.RAW?.USD?.HIGHDAY || 0,
        ath_change_percentage: 0,
        ath_date: new Date().toISOString(),
        atl: item.RAW?.USD?.LOWDAY || 0,
        atl_change_percentage: 0,
        atl_date: new Date().toISOString(),
        roi: null,
        last_updated: new Date().toISOString(),
      }));
      
      return transformedCoins;
    } catch (error) {
      console.error('Error fetching top coins from CryptoCompare:', error);
      throw error;
    }
  },

  // Get trending coins using CryptoCompare's top gainers
  getTrendingCoins: async (): Promise<TrendingCoin[]> => {
    try {
      console.log('Fetching trending coins from CryptoCompare API...');
      
      // Use top gainers as trending coins
      const response = await fetch(
        `${CRYPTOCOMPARE_BASE_URL}/top/gainerslosers?limit=10&tsym=USD&sortby=gainers`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`CryptoCompare API error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('CryptoCompare trending coins response received');
      
      // Transform to TrendingCoin format
      const trendingCoins: TrendingCoin[] = result.Data.slice(0, 5).map((coin: any, index: number) => ({
        item: {
          id: coin.CoinInfo.Name.toLowerCase(),
          coin_id: index + 1,
          name: coin.CoinInfo.FullName,
          symbol: coin.CoinInfo.Name,
          market_cap_rank: index + 1,
          thumb: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
          small: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
          large: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
          slug: coin.CoinInfo.Name.toLowerCase(),
          price_btc: coin.RAW?.BTC?.PRICE || 0,
          score: index,
        },
      }));
      
      return trendingCoins;
    } catch (error) {
      console.error('Error fetching trending coins from CryptoCompare:', error);
      throw error;
    }
  },

  // Get crypto news using CryptoCompare News API
  getCryptoNews: async (): Promise<NewsItem[]> => {
    try {
      console.log('Fetching crypto news from CryptoCompare API...');
      
      const response = await fetch(
        `${CRYPTOCOMPARE_NEWS_URL}/?lang=EN&sortOrder=latest&lmt=20`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`CryptoCompare News API error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('CryptoCompare news response received');
      
      // Transform to NewsItem format - Fixed property names
      const newsItems: NewsItem[] = result.Data.map((article: any, index: number) => ({
        id: index + 1,
        title: article.title,
        description: article.body,
        url: article.url,
        publishedAt: new Date(article.published_on * 1000).toISOString(), // Changed to publishedAt
        source: { name: article.source_info.name },
        urlToImage: article.imageurl || 'https://via.placeholder.com/400x200/4169E1/FFFFFF?text=Crypto+News' // Changed to urlToImage
      }));
      
      return newsItems;
    } catch (error) {
      console.error('Error fetching crypto news from CryptoCompare:', error);
      throw error;
    }
  },

  // Get historical data for a specific coin
  getHistoricalData: async (coinSymbol: string, days: number = 7): Promise<any> => {
    try {
      console.log(`Fetching historical data for ${coinSymbol} from CryptoCompare API...`);
      
      const response = await fetch(
        `${CRYPTOCOMPARE_BASE_URL}/v2/histoday?fsym=${coinSymbol}&tsym=USD&limit=${days}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`CryptoCompare API error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('CryptoCompare historical data response received');
      
      return result.Data.Data;
    } catch (error) {
      console.error('Error fetching historical data from CryptoCompare:', error);
      throw error;
    }
  },

  // Get detailed coin information
  getCoinDetails: async (coinSymbol: string): Promise<any> => {
    try {
      console.log(`Fetching details for ${coinSymbol} from CryptoCompare API...`);
      
      const response = await fetch(
        `${CRYPTOCOMPARE_BASE_URL}/pricemultifull?fsyms=${coinSymbol}&tsyms=USD`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`CryptoCompare API error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('CryptoCompare coin details response received');
      
      return result.RAW[coinSymbol]?.USD || {};
    } catch (error) {
      console.error('Error fetching coin details from CryptoCompare:', error);
      throw error;
    }
  }
};
