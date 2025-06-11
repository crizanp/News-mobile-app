import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import FeaturedNewsItem from '../../components/FeaturedNewsItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import NewsItem from '../../components/NewsItem';
import { cryptoApi } from '../../services/cryptoApi';
import { NewsItem as NewsItemType } from '../../types';

const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'bitcoin', name: 'Bitcoin', icon: 'logo-bitcoin' },
    { id: 'ethereum', name: 'Ethereum', icon: 'diamond-outline' },
    { id: 'defi', name: 'DeFi', icon: 'swap-horizontal-outline' },
    { id: 'nft', name: 'NFT', icon: 'image-outline' },
];

export default function NewsScreen() {
    const [news, setNews] = useState<NewsItemType[]>([]);
    const [featuredNews, setFeaturedNews] = useState<NewsItemType[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Changed from true
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const hasInitialData = useRef<boolean>(false);

    const fetchNews = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await cryptoApi.getCryptoNews();
            setNews(data.slice(3)); // Regular news (excluding first 3 for featured)
            setFeaturedNews(data.slice(0, 3)); // First 3 as featured news
            hasInitialData.current = true;
        } catch (error) {
            console.error('Error fetching news:', error);
            Alert.alert(
                'Error',
                'Failed to fetch crypto news. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = (): void => {
        setRefreshing(true);
        fetchNews();
    };

    // Only fetch data on first focus, not on every navigation
    useFocusEffect(
        useCallback(() => {
            if (!hasInitialData.current) {
                fetchNews();
            }
        }, [])
    );

    // Filter news by category
    const filterNewsByCategory = (newsItems: NewsItemType[], category: string): NewsItemType[] => {
        if (category === 'all') return newsItems;
        
        return newsItems.filter(item => {
            const title = item.title.toLowerCase();
            const description = item.description.toLowerCase();
            
            switch (category) {
                case 'bitcoin':
                    return title.includes('bitcoin') || title.includes('btc') || 
                           description.includes('bitcoin') || description.includes('btc');
                case 'ethereum':
                    return title.includes('ethereum') || title.includes('eth') || 
                           description.includes('ethereum') || description.includes('eth');
                case 'defi':
                    return title.includes('defi') || title.includes('decentralized finance') || 
                           title.includes('yield') || title.includes('lending') || 
                           description.includes('defi') || description.includes('decentralized finance');
                case 'nft':
                    return title.includes('nft') || title.includes('non-fungible') || 
                           title.includes('opensea') || title.includes('collectible') ||
                           description.includes('nft') || description.includes('non-fungible');
                default:
                    return true;
            }
        });
    };

    // Apply category filter first, then search filter
    const categoryFilteredNews = filterNewsByCategory(news, selectedCategory);
    const categoryFilteredFeatured = filterNewsByCategory(featuredNews, selectedCategory);
    
    const finalFilteredNews = showSearch && searchQuery 
        ? categoryFilteredNews.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categoryFilteredNews;

    const finalFilteredFeatured = showSearch && searchQuery
        ? categoryFilteredFeatured.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categoryFilteredFeatured;

    // Get category display name
    const getCategoryDisplayName = (categoryId: string): string => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'All';
    };

    // Get header title based on current state
    const getHeaderTitle = (): string => {
        if (showSearch && searchQuery) {
            return `Search Results (${finalFilteredNews.length})`;
        }
        
        if (selectedCategory === 'all') {
            return 'All News';
        }
        
        return `${getCategoryDisplayName(selectedCategory)} News`;
    };

    const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory === item.id && styles.categoryItemActive
            ]}
            onPress={() => {
                setSelectedCategory(item.id);
                // Reset search when changing category
                setSearchQuery('');
                setShowSearch(false);
            }}
        >
            <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedCategory === item.id ? '#FFF' : '#666'}
            />
            <Text style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderFeaturedItem = ({ item }: { item: NewsItemType }) => (
        <FeaturedNewsItem item={item} />
    );

    const renderNewsItem = ({ item }: { item: NewsItemType }) => (
        <NewsItem item={item} />
    );

    // Show loading spinner only during initial load (not refresh)
    if (loading && !refreshing && !hasInitialData.current) {
        return <LoadingSpinner message="Loading latest news..." />;
    }

    // Show empty state when no data and not loading
    if (!hasInitialData.current && !loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Crypto News</Text>
                    </View>
                </View>
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                >
                    <View style={styles.noDataContainer}>
                        <Ionicons name="newspaper-outline" size={64} color="#ccc" />
                        <Text style={styles.noDataText}>Pull down to load latest crypto news</Text>
                        <TouchableOpacity style={styles.loadButton} onPress={onRefresh}>
                            <Text style={styles.loadButtonText}>Load News</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {!showSearch ? (
                        <>
                            <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={() => setShowSearch(true)}
                            >
                                <Ionicons name="search-outline" size={24} color="#333" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search news..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.closeSearchButton}
                                onPress={() => {
                                    setShowSearch(false);
                                    setSearchQuery('');
                                }}
                            >
                                <Ionicons name="close-outline" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                {/* Featured News Section */}
                {!showSearch && finalFilteredFeatured.length > 0 && (
                    <View style={styles.featuredSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Featured</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={finalFilteredFeatured}
                            renderItem={renderFeaturedItem}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredList}
                        />
                    </View>
                )}

                {/* Regular News Section */}
                <View style={styles.newsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {selectedCategory === 'all' ? 'Recent News' : `Recent ${getCategoryDisplayName(selectedCategory)} News`}
                        </Text>
                    </View>
                    {finalFilteredNews.length > 0 ? (
                        finalFilteredNews.map((item) => (
                            <NewsItem key={item.id} item={item} />
                        ))
                    ) : (
                        <View style={styles.noResultsContainer}>
                            <Ionicons name="newspaper-outline" size={48} color="#ccc" />
                            <Text style={styles.noResultsText}>
                                {showSearch && searchQuery 
                                    ? 'No news found matching your search'
                                    : `No ${getCategoryDisplayName(selectedCategory).toLowerCase()} news available`
                                }
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#FFF',
        paddingTop: 40,
        paddingBottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    searchButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    closeSearchButton: {
        padding: 5,
    },
    content: {
        flex: 1,
    },
    categoriesContainer: {
        paddingVertical: 20,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryItemActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginLeft: 6,
    },
    categoryTextActive: {
        color: '#FFF',
    },
    featuredSection: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    seeAllText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    featuredList: {
        paddingLeft: 20,
    },
    newsSection: {
        paddingBottom: 20,
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    noResultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 20,
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
        lineHeight: 24,
    },
    loadButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    loadButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});