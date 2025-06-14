import AsyncStorage from '@react-native-async-storage/async-storage';
import { XMLParser } from 'fast-xml-parser';
import { NewsItem } from '../types';

interface RSSFeed {
    url: string;
    name: string;
    category?: string;
}

interface CachedNewsData {
    news: NewsItem[];
    lastFetch: number;
    lastRefresh: number;
}

class RSSNewsService {
    private readonly CACHE_KEY = 'crypto_news_cache';
    private readonly LAST_USAGE_KEY = 'last_service_usage';
    private readonly CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
    private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    private isLoading = false;
    private cachedData: CachedNewsData | null = null;
    private xmlParser: XMLParser;
    private lastServiceUsage: number = 0;

    constructor() {
        this.xmlParser = new XMLParser({
            ignoreAttributes: false,
            parseAttributeValue: true,
            parseTagValue: true,
            trimValues: true,
            processEntities: true,
            htmlEntities: true
        });
        // Initialize last usage from storage
        this.initializeLastUsage();
    }

    private async initializeLastUsage(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(this.LAST_USAGE_KEY);
            this.lastServiceUsage = stored ? parseInt(stored, 10) : 0;
        } catch (error) {
            console.error('Error loading last usage:', error);
            this.lastServiceUsage = 0;
        }
    }

    private async saveLastUsage(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.LAST_USAGE_KEY, this.lastServiceUsage.toString());
        } catch (error) {
            console.error('Error saving last usage:', error);
        }
    }

    // Direct RSS feed URLs
    private readonly RSS_FEEDS: RSSFeed[] = [
        {
            url: 'https://cryptews.com/rss.xml',
            name: 'Cryptews',
            category: 'general'
        },
        {
            url: 'https://en.bitcoinhaber.net/feed',
            name: 'Bitcoin Haber',
            category: 'general'
        },
        {
            url: 'https://cryptonewsland.com/feed/',
            name: 'CryptoNewsLand',
            category: 'general'
        },
        {
            url: 'https://coinpedia.org/feed/',
            name: 'Coinpedia',
            category: 'general'
        },
        {
            url: 'https://www.newsbtc.com/feed/',
            name: 'NewsBTC',
            category: 'general'
        },
        {
            url: 'https://finbold.com/category/cryptocurrency-news/feed/',
            name: 'Finbold',
            category: 'general'
        },
        {
            url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
            name: 'CoindDesk',
            category: 'general'
        },
        {
            url: 'https://cryptoslate.com/feed/',
            name: 'CryptoSlate',
            category: 'general'
        },
        {
            url: 'https://www.cryptopolitan.com/feed/',
            name: 'Cryptopolitan',
            category: 'general'
        },
        {
            url: 'https://coingape.com/feed/',
            name: 'CoinGape',
            category: 'general'
        },
        {
            url: 'https://cointelegraph.com/rss',
            name: 'Cointelegraph',
            category: 'general'
        },
        {
            url: 'https://cryptotale.org/feed/',
            name: 'CryptoTale',
            category: 'general'
        },
        {
            url: 'https://decrypt.co/feed',
            name: 'Decrypt',
            category: 'general'
        },
        {
            url: 'https://bitcoinmagazine.com/.rss/full/',
            name: 'Bitcoin Magazine',
            category: 'bitcoin'
        },
        {
            url: 'https://thedefiant.io/feed/',
            name: 'The Defiant',
            category: 'defi'
        },
        {
            url: 'https://cryptopotato.com/feed/',
            name: 'CryptoPotato',
            category: 'general'
        }
    ];

    /**
     * FIXED: Get crypto news with proper app reopen detection and full fetch logic
     */
    async getCryptoNews(limit: number = 0): Promise<NewsItem[]> {
        try {
            console.log('🔄 Getting crypto news...');
            
            const now = Date.now();
            
            // Load cached data if not already loaded
            if (!this.cachedData) {
                await this.loadCachedData();
            }

            // FIXED: Detect if app was reopened (gap in service usage > 30 seconds)
            const timeSinceLastUsage = now - this.lastServiceUsage;
            const appWasReopened = this.lastServiceUsage > 0 && timeSinceLastUsage > 30000; // 30 seconds gap
            
            // Update last usage time and save it
            this.lastServiceUsage = now;
            await this.saveLastUsage();

            // Check refresh conditions
            const shouldRefresh = this.shouldRefreshNews(now);
            const shouldFetch = this.shouldFetchNews(now);
            const hasValidCache = this.hasValidCachedData();

            console.log('📊 Cache status:', {
                shouldRefresh,
                shouldFetch,
                hasValidCache,
                appWasReopened,
                timeSinceLastUsage,
                cacheExists: !!this.cachedData,
                cacheSize: this.cachedData?.news?.length || 0,
                lastFetch: this.cachedData?.lastFetch || 0,
                lastRefresh: this.cachedData?.lastRefresh || 0,
                now
            });

            // ✅ FIXED: Force full fetch when app reopens AND it's been > 5 min since last refresh
            const forceFullFetchOnReopen = appWasReopened && shouldRefresh;

            // ✅ FIXED: Determine if we need full fetch vs refresh
            const needsFullFetch = !hasValidCache || shouldFetch || forceFullFetchOnReopen;
            const needsRefresh = shouldRefresh && !needsFullFetch;

            // Trigger fetch/refresh if needed
            if (needsFullFetch || needsRefresh) {
                console.log('🚀 Triggering fetch/refresh...', {
                    reason: !hasValidCache ? 'no cache' : 
                           shouldFetch ? 'cache expired' : 
                           forceFullFetchOnReopen ? 'app reopened + full refresh needed' : 
                           'regular refresh',
                    fullFetch: needsFullFetch
                });
                
                // ✅ FIXED: Pass the correct fullFetch parameter
                await this.fetchAndCacheNews(needsFullFetch);
            }

            // Return cached data or empty array
            const news = this.cachedData?.news || [];
            console.log('✅ Returning news items:', news.length);
            
            return limit > 0 ? news.slice(0, limit) : news;

        } catch (error) {
            console.error('❌ Error getting crypto news:', error);
            
            // Return cached data if available, even if expired
            if (this.cachedData?.news && this.cachedData.news.length > 0) {
                console.log('🔄 Returning cached data due to error');
                const news = this.cachedData.news;
                return limit > 0 ? news.slice(0, limit) : news;
            }
            
            return this.getMockNews();
        }
    }

    /**
     * Check if we have valid cached data
     */
    private hasValidCachedData(): boolean {
        return !!(this.cachedData?.news && this.cachedData.news.length > 0);
    }

    /**
     * Get mock news data for testing
     */
    private getMockNews(): NewsItem[] {
        return [
            {
                id: 1,
                title: "Bitcoin Reaches New All-Time High as Institutional Adoption Grows",
                description: "Bitcoin has surged to unprecedented levels amid increasing institutional investment and regulatory clarity in major markets.",
                url: "https://example.com/bitcoin-ath",
                urlToImage: "https://picsum.photos/400/200?random=1",
                publishedAt: new Date().toISOString(),
                source: { name: "Crypto News" }
            },
            {
                id: 2,
                title: "Ethereum 2.0 Staking Rewards Attract Major Validators",
                description: "The Ethereum network sees massive growth in staking participation as validators earn attractive rewards.",
                url: "https://example.com/ethereum-staking",
                urlToImage: "https://picsum.photos/400/200?random=2",
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                source: { name: "DeFi Today" }
            }
        ];
    }

    /**
     * Force refresh news from RSS feeds
     */
    async forceRefresh(): Promise<NewsItem[]> {
        try {
            console.log('🔄 Force refreshing news...');
            this.cachedData = null;
            this.lastServiceUsage = 0;
            await AsyncStorage.removeItem(this.CACHE_KEY);
            await AsyncStorage.removeItem(this.LAST_USAGE_KEY);
            return await this.getCryptoNews();
        } catch (error) {
            console.error('❌ Error force refreshing news:', error);
            return this.getMockNews();
        }
    }

    /**
     * Check if we should refresh news (every 5 minutes)
     */
    private shouldRefreshNews(now: number): boolean {
        if (!this.cachedData || !this.hasValidCachedData()) return false;
        return (now - this.cachedData.lastRefresh) >= this.REFRESH_INTERVAL;
    }

    /**
     * Check if we should fetch news (cache expired after 12 hours or no valid cache)
     */
    private shouldFetchNews(now: number): boolean {
        if (!this.cachedData || !this.hasValidCachedData()) return true;
        return (now - this.cachedData.lastFetch) >= this.CACHE_DURATION;
    }

    /**
     * Load cached data from AsyncStorage
     */
    private async loadCachedData(): Promise<void> {
        try {
            const cached = await AsyncStorage.getItem(this.CACHE_KEY);
            if (cached) {
                const parsedData = JSON.parse(cached);
                if (parsedData && Array.isArray(parsedData.news) && 
                    typeof parsedData.lastFetch === 'number' && 
                    typeof parsedData.lastRefresh === 'number') {
                    this.cachedData = parsedData;
                    console.log('📦 Loaded cached data:', this.cachedData?.news?.length || 0, 'items');
                } else {
                    console.log('⚠️ Invalid cached data structure, clearing cache');
                    await AsyncStorage.removeItem(this.CACHE_KEY);
                    this.cachedData = null;
                }
            } else {
                console.log('📦 No cached data found');
                this.cachedData = null;
            }
        } catch (error) {
            console.error('❌ Error loading cached data:', error);
            this.cachedData = null;
        }
    }

    /**
     * FIXED: Enhanced fetchAndCacheNews with better error handling and logging
     */
    private async fetchAndCacheNews(fullFetch: boolean): Promise<void> {
        if (this.isLoading) {
            console.log('⏳ Already loading, skipping...');
            return;
        }
        
        this.isLoading = true;
        console.log('🚀 Starting to fetch news... Full fetch:', fullFetch);
        
        try {
            const now = Date.now();
            let allNews: NewsItem[] = [];

            if (fullFetch) {
                // ✅ FIXED: Always do full fetch from all RSS feeds when requested
                console.log('📡 Full fetch: Fetching from all RSS feeds...');
                allNews = await this.fetchFromAllFeeds();
            } else {
                // Refresh: fetch only recent news and merge with existing
                console.log('📡 Refresh: Fetching recent news only...');
                const recentNews = await this.fetchRecentNews();
                const existingNews = this.cachedData?.news || [];
                allNews = this.mergeAndDeduplicateNews(recentNews, existingNews);
            }

            console.log('📊 Fetched news count:', allNews.length);

            // ✅ FIXED: Better handling when no news is fetched
            if (allNews.length === 0) {
                if (fullFetch) {
                    console.log('⚠️ No news fetched from feeds during full fetch, using mock data');
                    allNews = this.getMockNews();
                } else {
                    console.log('⚠️ No recent news found, keeping existing cache');
                    // For refresh, if no new items, keep existing cache unchanged
                    return;
                }
            }

            // Sort by date (newest first)
            allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

            // ✅ FIXED: Update cache with proper timestamp logic
            this.cachedData = {
                news: allNews,
                lastFetch: fullFetch ? now : (this.cachedData?.lastFetch || now),
                lastRefresh: now // Always update lastRefresh when fetching new data
            };

            console.log('💾 Caching news:', allNews.length, 'items');
            console.log('📊 Cache timestamps:', {
                lastFetch: this.cachedData.lastFetch,
                lastRefresh: this.cachedData.lastRefresh,
                fullFetch
            });

            // Save to AsyncStorage
            await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cachedData));

        } catch (error) {
            console.error('❌ Error fetching and caching news:', error);
            
            // If error and no valid cached data, use mock data
            if (!this.hasValidCachedData()) {
                console.log('🧪 Using mock data due to fetch error');
                this.cachedData = {
                    news: this.getMockNews(),
                    lastFetch: Date.now(),
                    lastRefresh: Date.now()
                };
                
                // Save mock data to cache
                try {
                    await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cachedData));
                } catch (saveError) {
                    console.error('❌ Error saving mock data to cache:', saveError);
                }
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * FIXED: Enhanced fetchFromAllFeeds with better error handling
     */
    private async fetchFromAllFeeds(): Promise<NewsItem[]> {
    console.log('📡 Fetching from all feeds...');
    
    // ✅ FIXED: Add timeout and better promise handling
    const fetchPromises = this.RSS_FEEDS.map(async (feed) => {
        try {
            console.log(`🔗 Starting fetch from ${feed.name}...`);
            const items = await this.fetchRSSFeed(feed);
            console.log(`✅ Successfully fetched from ${feed.name}: ${items.length} items`);
            return items;
        } catch (error) {
            console.error(`❌ Failed to fetch from ${feed.name}:`, error);
            return [];
        }
    });
    
    // ✅ FIXED: Use Promise.allSettled with timeout
    const timeoutPromise = new Promise<PromiseSettledResult<NewsItem[]>[]>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch timeout')), 60000); // 60 second timeout
    });
    
    try {
        const results = await Promise.race([
            Promise.allSettled(fetchPromises),
            timeoutPromise
        ]);
        
        const allNews: NewsItem[] = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allNews.push(...result.value);
            } else {
                console.error(`❌ Feed ${this.RSS_FEEDS[index].name} failed:`, result.reason);
            }
        });
        
        console.log(`📊 Total items fetched from all feeds: ${allNews.length}`);
        return this.deduplicateNews(allNews);
        
    } catch (error) {
        console.error('❌ Error in fetchFromAllFeeds:', error);
        return [];
    }
}

    /**
     * Fetch only recent news (for refresh)
     */
    private async fetchRecentNews(): Promise<NewsItem[]> {
        console.log('📡 Fetching recent news...');
        const cutoffTime = Date.now() - this.REFRESH_INTERVAL;
        const promises = this.RSS_FEEDS.map(feed => 
            this.fetchRSSFeed(feed, new Date(cutoffTime))
        );
        
        const results = await Promise.allSettled(promises);
        const recentNews: NewsItem[] = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                recentNews.push(...result.value);
            } else {
                console.error(`❌ Failed to fetch recent from ${this.RSS_FEEDS[index].name}:`, result.reason);
            }
        });

        return this.deduplicateNews(recentNews);
    }

    /**
     * FIXED: Enhanced RSS feed fetching with better error handling and debugging
     */
    private async fetchRSSFeed(feed: RSSFeed, since?: Date): Promise<NewsItem[]> {
        try {
            console.log(`🔗 Fetching XML from ${feed.name}...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout
            
            const response = await fetch(feed.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml',
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsApp/1.0)',
                    'Cache-Control': 'no-cache',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xmlText = await response.text();
            console.log(`📄 Received XML data from ${feed.name}, length: ${xmlText.length}`);
            
            // ✅ FIXED: Add XML validation before parsing
            if (!xmlText || xmlText.length < 100) {
                throw new Error('Invalid or empty XML response');
            }
            
            // Parse XML using fast-xml-parser
            const result = this.xmlParser.parse(xmlText);
            
            // ✅ FIXED: Add result validation
            if (!result) {
                throw new Error('Failed to parse XML');
            }
            
            const newsItems = this.parseRSSResult(result, feed, since);
            console.log(`✅ Parsed ${newsItems.length} items from ${feed.name}`);
            
            // ✅ FIXED: Add warning if no items parsed but XML was received
            if (newsItems.length === 0 && xmlText.length > 100) {
                console.warn(`⚠️ No items parsed from ${feed.name} despite receiving XML data`);
                console.log('📊 XML structure sample:', JSON.stringify(result, null, 2).substring(0, 500));
            }
            
            return newsItems;

        } catch (error) {
            console.error(`❌ Error fetching RSS feed ${feed.name}:`, error);
            return [];
        }
    }

    /**
     * FIXED: Enhanced RSS result parsing with better debugging
     */
    private parseRSSResult(result: any, feed: RSSFeed, since?: Date): NewsItem[] {
        try {
            const newsItems: NewsItem[] = [];
            
            // ✅ FIXED: Handle different RSS structures with better debugging
            let items: any[] = [];
            
            if (result.rss?.channel?.item) {
                items = Array.isArray(result.rss.channel.item) 
                    ? result.rss.channel.item 
                    : [result.rss.channel.item];
                console.log(`🔍 Found ${items.length} items in RSS from ${feed.name}`);
            } else if (result.feed?.entry) {
                items = Array.isArray(result.feed.entry) 
                    ? result.feed.entry 
                    : [result.feed.entry];
                console.log(`🔍 Found ${items.length} items in Atom feed from ${feed.name}`);
            } else {
                // ✅ FIXED: Better debugging for unknown structures
                console.warn(`⚠️ Unknown RSS structure from ${feed.name}:`);
                console.log('Available keys:', Object.keys(result));
                if (result.rss) {
                    console.log('RSS keys:', Object.keys(result.rss));
                    if (result.rss.channel) {
                        console.log('Channel keys:', Object.keys(result.rss.channel));
                    }
                }
                return [];
            }

            // ✅ FIXED: Filter by date first, then parse (more efficient)
            const cutoffTime = since ? since.getTime() : 0;
            
            items.forEach((item, index) => {
                try {
                    // Quick date check before full parsing
                    if (since) {
                        const itemDate = this.getItemValue(item, ['pubDate', 'pubdate', 'published', 'date', 'updated']);
                        if (itemDate) {
                            const parsedDate = new Date(itemDate);
                            if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() < cutoffTime) {
                                return; // Skip old items
                            }
                        }
                    }
                    
                    const newsItem = this.parseRSSItem(item, feed);
                    
                    // Final date filter after full parsing
                    if (since && new Date(newsItem.publishedAt) < since) {
                        return;
                    }
                    
                    newsItems.push(newsItem);
                } catch (error) {
                    console.warn(`⚠️ Error parsing RSS item ${index} from ${feed.name}:`, error);
                    // ✅ FIXED: Log problematic item for debugging
                    console.log('Problematic item:', JSON.stringify(item, null, 2).substring(0, 300));
                }
            });

            return newsItems;

        } catch (error) {
            console.error(`❌ Error parsing RSS result from ${feed.name}:`, error);
            return [];
        }
    }

    /**
     * Parse individual RSS item to NewsItem
     */
    private parseRSSItem(item: any, feed: RSSFeed): NewsItem {
        // Extract basic fields with fallbacks
        const title = this.getItemValue(item, ['title']) || 'Untitled';
        const description = this.getItemValue(item, ['description', 'summary', 'content']) || '';
        const link = this.getItemValue(item, ['link', 'guid']) || '';
        const pubDate = this.getItemValue(item, ['pubDate', 'pubdate', 'published', 'date', 'updated']) || new Date().toISOString();
        const guid = this.getItemValue(item, ['guid', 'id']) || link || title;

        // Extract image URL
        let imageUrl = this.extractImageUrl(item, description);
        
        // Use placeholder if no image found
        if (!imageUrl) {
            imageUrl = `https://foxbeep.com/logo.png`;
        }

        // Clean description
        const cleanDescription = this.cleanHtmlContent(description);

        // Extract categories
        const categories: string[] = [];
        if (item.category) {
            const cats = Array.isArray(item.category) ? item.category : [item.category];
            cats.forEach((cat: any) => {
                const catText = typeof cat === 'string' ? cat : cat._ || cat.$?.term;
                if (catText) categories.push(catText);
            });
        }

        return {
            id: this.generateId(guid),
            title: this.cleanHtmlContent(title).trim(),
            description: cleanDescription.substring(0, 300),
            url: link,
            urlToImage: imageUrl,
            publishedAt: this.parseDate(pubDate),
            source: {
                name: feed.name
            },
            ...(categories.length > 0 && { categories }),
            ...(feed.category && { feedCategory: feed.category })
        };
    }

    /**
     * Get value from item with multiple possible keys
     */
    private getItemValue(item: any, keys: string[]): string {
        for (const key of keys) {
            const value = item[key];
            if (value) {
                if (typeof value === 'string') return value;
                if (value._ || value.$t) return value._ || value.$t;
                if (value.href) return value.href;
                if (Array.isArray(value) && value.length > 0) {
                    return typeof value[0] === 'string' ? value[0] : value[0]._ || value[0].$t;
                }
            }
        }
        return '';
    }

    /**
     * Extract image URL from various sources
     */
    private extractImageUrl(item: any, description: string): string {
        // Try enclosure first
        if (item.enclosure) {
            const enclosure = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
            if (enclosure?.['@_url'] && enclosure?.['@_type']?.startsWith('image')) {
                return enclosure['@_url'];
            }
            // Fallback for different attribute formats
            if (enclosure?.url && enclosure?.type?.startsWith('image')) {
                return enclosure.url;
            }
        }

        // Try media:content with different possible formats
        const mediaContentKeys = ['media:content', 'mediacontent', 'content'];
        for (const key of mediaContentKeys) {
            if (item[key]) {
                const mediaContent = Array.isArray(item[key]) ? item[key][0] : item[key];
                
                // Check for @_url attribute (fast-xml-parser format)
                if (mediaContent?.['@_url']) {
                    return mediaContent['@_url'];
                }
                
                // Check for url attribute
                if (mediaContent?.url) {
                    return mediaContent.url;
                }
                
                // Check for $ attribute format
                if (mediaContent?.$ && mediaContent.$.url) {
                    return mediaContent.$.url;
                }
            }
        }

        // Try media:thumbnail with different possible formats  
        const mediaThumbnailKeys = ['media:thumbnail', 'mediathumbnail', 'thumbnail'];
        for (const key of mediaThumbnailKeys) {
            if (item[key]) {
                const thumbnail = Array.isArray(item[key]) ? item[key][0] : item[key];
                
                // Check for @_url attribute (fast-xml-parser format)
                if (thumbnail?.['@_url']) {
                    return thumbnail['@_url'];
                }
                
                // Check for url attribute
                if (thumbnail?.url) {
                    return thumbnail.url;
                }
                
                // Check for $ attribute format
                if (thumbnail?.$ && thumbnail.$.url) {
                    return thumbnail.$.url;
                }
            }
        }

        // Try content:encoded for WordPress feeds
        if (item['content:encoded'] || item.contentencoded) {
            const content = item['content:encoded'] || item.contentencoded;
            const imgMatch = content.match(/<img[^>]+src=['"](https?:\/\/[^'"]+)['"]/i);
            if (imgMatch) {
                return imgMatch[1];
            }
        }

        // Try to extract from description
        if (description) {
            const imgMatch = description.match(/<img[^>]+src=['"](https?:\/\/[^'"]+)['"]/i);
            if (imgMatch) {
                return imgMatch[1];
            }
        }

        return '';
    }

    /**
     * Clean HTML content and decode entities
     */
    private cleanHtmlContent(content: string): string {
        if (!content) return '';
        
        return content
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }


    /**
     * Parse date string to ISO format
     */
    private parseDate(dateString: string): string {
        try {
            // Handle empty or undefined dates
            if (!dateString || dateString.trim() === '') {
                return new Date().toISOString();
            }
            
            // Try parsing the date directly
            let date = new Date(dateString);
            
            // If invalid, try cleaning common RSS date formats
            if (isNaN(date.getTime())) {
                // Remove timezone abbreviations that JS can't parse
                const cleanedDate = dateString
                    .replace(/\s+(GMT|UTC|EST|PST|CST|MST|EDT|PDT|CDT|MDT)\s*$/i, '')
                    .replace(/\s+\+\d{4}$/, '') // Remove +0000 format
                    .trim();
                
                date = new Date(cleanedDate);
            }
            
            // If still invalid, return current date
            if (isNaN(date.getTime())) {
                console.warn(`Invalid date format: ${dateString}`);
                return new Date().toISOString();
            }
            
            return date.toISOString();
        } catch (error) {
            console.warn(`Error parsing date: ${dateString}`, error);
            return new Date().toISOString();
        }
    }

    /**
     * Generate unique ID from content
     */
    private generateId(content: string): number {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Remove duplicate news items
     */
    private deduplicateNews(news: NewsItem[]): NewsItem[] {
        const seen = new Set<string>();
        return news.filter(item => {
            const key = `${item.title.toLowerCase()}_${item.url}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Merge new news with existing and remove duplicates
     */
    private mergeAndDeduplicateNews(newNews: NewsItem[], existingNews: NewsItem[]): NewsItem[] {
        const combined = [...newNews, ...existingNews];
        return this.deduplicateNews(combined);
    }

    /**
     * Clear all cached data
     */
    async clearCache(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.CACHE_KEY);
            await AsyncStorage.removeItem(this.LAST_USAGE_KEY); // NEW: Clear usage tracking
            this.cachedData = null;
            this.lastServiceUsage = 0;
            console.log('🗑️ Cache cleared');
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
        }
    }

    /**
     * Get cache info for debugging
     */
    getCacheInfo(): { lastFetch: number | null; lastRefresh: number | null; newsCount: number } {
        return {
            lastFetch: this.cachedData?.lastFetch || null,
            lastRefresh: this.cachedData?.lastRefresh || null,
            newsCount: this.cachedData?.news?.length || 0
        };
    }

    /**
     * Get all news feeds info
     */
    getFeedsInfo(): RSSFeed[] {
        return [...this.RSS_FEEDS];
    }
}

// Export singleton instance
export const rssNewsService = new RSSNewsService();