// components/ads/ArticleAdComponent.tsx
import Constants from 'expo-constants';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useTheme } from '../../contexts/ThemeContext';

interface ArticleAdComponentProps {
    placement: 'header' | 'content' | 'footer' | 'related';
    style?: any;
}

// Ad Unit IDs configuration for different placements
const getAdUnitId = (placement: string) => {
    const isDev = __DEV__ || Constants.expoConfig?.extra?.environment === 'development';
    
    if (isDev) {
        return TestIds.BANNER;
    }
    
    // Different ad units for different placements (you can use same ID or different ones)
    const productionAdUnits = {
        android: {
            header: 'ca-app-pub-5565400586025993/5002544033',
            content: 'ca-app-pub-5565400586025993/5002544033', 
            footer: 'ca-app-pub-5565400586025993/5002544033',
            related: 'ca-app-pub-5565400586025993/5002544033',
        },
        ios: {
            header: 'ca-app-pub-5565400586025993/6693818080',
            content: 'ca-app-pub-5565400586025993/6693818080',
            footer: 'ca-app-pub-5565400586025993/6693818080',
            related: 'ca-app-pub-5565400586025993/6693818080',
        }
    };
    
    const platformAds = Platform.OS === 'android' 
        ? productionAdUnits.android 
        : productionAdUnits.ios;
    
    return platformAds[placement as keyof typeof platformAds] || platformAds.content;
};

// Get appropriate banner size based on placement
const getBannerSize = (placement: string) => {
    switch (placement) {
        case 'header':
            return BannerAdSize.LARGE_BANNER; // 320x100
        case 'content':
            return BannerAdSize.MEDIUM_RECTANGLE; // 300x250 - best for content
        case 'footer':
            return BannerAdSize.BANNER; // 320x50
        case 'related':
            return BannerAdSize.BANNER; // 320x50
        default:
            return BannerAdSize.BANNER;
    }
};

const ArticleAdComponent: React.FC<ArticleAdComponentProps> = ({ 
    placement, 
    style 
}) => {
    const { theme } = useTheme();
    const [adLoaded, setAdLoaded] = useState(false);
    const [adError, setAdError] = useState(false);
    
    const adUnitId = getAdUnitId(placement);
    const bannerSize = getBannerSize(placement);
    
    const handleAdLoaded = useCallback(() => {
        console.log(`${placement} ad loaded successfully`);
        setAdLoaded(true);
        setAdError(false);
    }, [placement]);
    
    const handleAdError = useCallback((error: any) => {
        console.warn(`${placement} ad failed to load:`, error);
        setAdError(true);
        setAdLoaded(false);
    }, [placement]);
    
    // Don't render if there was an error
    if (adError) {
        return null;
    }
    
    // For related/banner ads in news feed, use news card styling
    if (placement === 'related') {
        const newsCardStyle = [
            styles.newsCardContainer,
            { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadowColor,
            },
            style
        ];
        
        const adLabelStyle = [
            styles.newsCardAdLabel,
            { color: theme.colors.textSecondary }
        ];
        
        return (
            <View style={newsCardStyle}>
                <View style={styles.newsCardHeader}>
                    {/* <Text style={adLabelStyle}>Sponsored</Text> */}
                </View>
                <View style={styles.newsCardAdContent}>
                    <BannerAd
                        unitId={adUnitId}
                        size={bannerSize}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: false,
                            keywords: [
                                'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 
                                'news', 'market', 'finance', 'investing', 'blockchain',
                                'trading', 'altcoin', 'defi', 'nft'
                            ],
                        }}
                        onAdLoaded={handleAdLoaded}
                        onAdFailedToLoad={handleAdError}
                    />
                </View>
            </View>
        );
    }
    
    // Default styling for other placements
    const containerStyle = [
        styles.adContainer,
        styles[`${placement}Container` as keyof typeof styles],
        { backgroundColor: theme.colors.background },
        style
    ];
    
    const labelStyle = [
        styles.adLabel,
        { color: theme.colors.textSecondary }
    ];
    
    return (
        <View style={containerStyle}>
            {/* Optional ad label for transparency */}
            {placement === 'content' && (
                <Text style={labelStyle}>Advertisement</Text>
            )}
            
            <BannerAd
                unitId={adUnitId}
                size={bannerSize}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                    keywords: [
                        'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 
                        'news', 'market', 'finance', 'investing', 'blockchain',
                        'trading', 'altcoin', 'defi', 'nft'
                    ],
                }}
                onAdLoaded={handleAdLoaded}
                onAdFailedToLoad={handleAdError}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    headerContainer: {
        marginVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    contentContainer: {
        marginVertical: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    footerContainer: {
        marginVertical: 15,
        paddingHorizontal: 16,
    },
    relatedContainer: {
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    adLabel: {
        fontSize: 11,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 5,
        opacity: 0.6,
    },
    // News card styles for native ad appearance
    newsCardContainer: {
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
    },
    newsCardHeader: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 4,
    },
    newsCardAdLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.7,
    },
    newsCardAdContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
});

export default ArticleAdComponent;