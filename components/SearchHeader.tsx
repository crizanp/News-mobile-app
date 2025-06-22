// components/SearchHeader.tsx - Updated to match NewsScreen header style with theme support
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SearchHeaderProps {
    title: string;
    subtitle?: string;
    onSearchPress: () => void;
    isSearchVisible: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearchClose?: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
    title,
    subtitle,
    onSearchPress,
    isSearchVisible,
    searchQuery,
    onSearchChange,
    onSearchClose,
}) => {
    const { theme, isDark } = useTheme();

    const handleSearchClose = () => {
        onSearchChange('');
        if (onSearchClose) {
            onSearchClose();
        } else {
            onSearchPress();
        }
    };

    return (
        <View style={[styles.header, { 
            backgroundColor: theme.colors.surface,
            shadowColor: isDark ? '#000' : '#000',
        }]}>
            <View style={styles.headerTop}>
                {!isSearchVisible ? (
                    <>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.searchButton, { 
                                backgroundColor: isDark ? '#333' : '#F0F0F0',
                            }]}
                            onPress={onSearchPress}
                        >
                            <Ionicons 
                                name="search-outline" 
                                size={24} 
                                color={isDark ? '#FFF' : '#333'} 
                            />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={[styles.searchContainer, { 
                        backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    }]}>
                        <Ionicons 
                            name="search-outline" 
                            size={20} 
                            color={theme.colors.textSecondary} 
                            style={styles.searchIcon} 
                        />
                        <TextInput
                            style={[styles.searchInput, { 
                                color: theme.colors.text,
                            }]}
                            placeholder="Search cryptocurrencies..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={onSearchChange}
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.closeSearchButton}
                            onPress={handleSearchClose}
                        >
                            <Ionicons 
                                name="close-outline" 
                                size={20} 
                                color={theme.colors.textSecondary} 
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 50,
        paddingBottom: 0,
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
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    searchButton: {
        padding: 8,
        borderRadius: 20,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    closeSearchButton: {
        padding: 5,
    },
});

export default SearchHeader;