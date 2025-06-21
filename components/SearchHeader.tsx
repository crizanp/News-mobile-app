// components/SearchHeader.tsx - Updated to match NewsScreen header style
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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
    const handleSearchClose = () => {
        onSearchChange('');
        if (onSearchClose) {
            onSearchClose();
        } else {
            onSearchPress();
        }
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                {!isSearchVisible ? (
                    <>
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>{title}</Text>
                            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        </View>
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={onSearchPress}
                        >
                            <Ionicons name="search-outline" size={24} color="#333" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search cryptocurrencies..."
                            value={searchQuery}
                            onChangeText={onSearchChange}
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.closeSearchButton}
                            onPress={handleSearchClose}
                        >
                            <Ionicons name="close-outline" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        marginTop: 2,
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
});

export default SearchHeader;