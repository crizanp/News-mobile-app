// components/CategoryFilter.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface MarketCategory {
    id: string;
    name: string;
    icon: string;
}

interface CategoryItemProps {
    item: MarketCategory;
    selectedCategory: string;
    onSelect: (id: string) => void;
}

interface CategoryFilterProps {
    categories: MarketCategory[];
    selectedCategory: string;
    onCategorySelect: (categoryId: string) => void;
}

const CategoryItem = React.memo<CategoryItemProps>(({ item, selectedCategory, onSelect }) => {
    const { theme } = useTheme();
    
    const handlePress = useCallback(() => {
        onSelect(item.id);
    }, [item.id, onSelect]);
    
    const isSelected = selectedCategory === item.id;
    
    // Dynamic styles based on theme and selection state
    const itemStyle = [
        styles.categoryItem,
        {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        }
    ];
    
    const textStyle = [
        styles.categoryText,
        {
            color: isSelected ? '#FFF' : theme.colors.textSecondary,
        }
    ];
    
    const iconColor = isSelected ? '#FFF' : theme.colors.textSecondary;
    
    return (
        <TouchableOpacity
            style={itemStyle}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Ionicons
                name={item.icon as any}
                size={16}
                color={iconColor}
            />
            <Text style={textStyle}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );
});

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    selectedCategory,
    onCategorySelect,
}) => {
    const { theme } = useTheme();
    
    const renderCategoryItem = useCallback(({ item }: { item: MarketCategory }) => (
        <CategoryItem
            item={item}
            selectedCategory={selectedCategory}
            onSelect={onCategorySelect}
        />
    ), [selectedCategory, onCategorySelect]);
    
    const categoryKeyExtractor = useCallback((item: MarketCategory) => item.id, []);
    
    // Dynamic container style
    const containerStyle = [
        styles.categoriesContainer,
        { backgroundColor: theme.colors.background }
    ];
    
    return (
        <View style={containerStyle}>
            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={categoryKeyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
                removeClippedSubviews={false}
                initialNumToRender={categories.length}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    categoriesContainer: {
        paddingVertical: 20,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
    },
});

export default CategoryFilter;