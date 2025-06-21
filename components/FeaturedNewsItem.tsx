import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { NewsItem as NewsItemType } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface FeaturedNewsItemProps {
    item: NewsItemType;
}

const FeaturedNewsItem: React.FC<FeaturedNewsItemProps> = ({ item }) => {
    const handlePress = () => {
    // Use template literal with proper typing
    router.push(`/news/${item.id}` as any);
  };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) {
            return 'Just now';
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <ImageBackground
                source={{ uri: item.urlToImage }}
                style={styles.backgroundImage}
                imageStyle={styles.image}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <View style={styles.sourceContainer}>
                            <Text style={styles.source}>{item.source?.name || 'Unknown'}</Text>
                            <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
                        </View>
                        <Text style={styles.title} numberOfLines={3}>
                            {item.title}
                        </Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 200,
        marginRight: 15,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    image: {
        borderRadius: 16,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        padding: 20,
    },
    sourceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    source: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '600',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    date: {
        fontSize: 12,
        color: '#FFF',
        opacity: 0.8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        lineHeight: 22,
    },
});

export default FeaturedNewsItem;