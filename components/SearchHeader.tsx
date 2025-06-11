// components/SearchHeader.tsx - Compact Version
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchHeaderProps {
    title: string;
    subtitle: string;
    onSearchPress: () => void;
    isSearchVisible: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
    title,
    subtitle,
    onSearchPress,
    isSearchVisible,
    searchQuery,
    onSearchChange,
}) => {
    const [fadeAnim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isSearchVisible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isSearchVisible, fadeAnim]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContent}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={onSearchPress}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isSearchVisible ? "close" : "search"}
                        size={18}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            </View>

            {isSearchVisible && (
                <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search cryptocurrencies..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={onSearchChange}
                            autoFocus={true}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => onSearchChange('')}
                                style={styles.clearButton}
                            >
                                <Ionicons name="close-circle" size={16} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    searchButton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12, 
        backgroundColor: '#F0F0F0',
    },
    searchContainer: {
        marginTop: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 2,
    },
});

export default SearchHeader;