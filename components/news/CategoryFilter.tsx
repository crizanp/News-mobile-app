// components/CategoryFilter.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    const handlePress = useCallback(() => {
        onSelect(item.id);
    }, [item.id, onSelect]);

    const isSelected = selectedCategory === item.id;

    return (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                isSelected && styles.categoryItemActive
            ]}
            onPress={handlePress}
        >
            <Ionicons
                name={item.icon as any}
                size={16}
                color={isSelected ? '#FFF' : '#666'}
            />
            <Text style={[
                styles.categoryText,
                isSelected && styles.categoryTextActive
            ]}>
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
    const renderCategoryItem = useCallback(({ item }: { item: MarketCategory }) => (
        <CategoryItem 
            item={item} 
            selectedCategory={selectedCategory} 
            onSelect={onCategorySelect} 
        />
    ), [selectedCategory, onCategorySelect]);

    const categoryKeyExtractor = useCallback((item: MarketCategory) => item.id, []);

    return (
        <View style={styles.categoriesContainer}>
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
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryItemActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
        marginLeft: 6,
    },
    categoryTextActive: {
        color: '#FFF',
    },
});

export default CategoryFilter;