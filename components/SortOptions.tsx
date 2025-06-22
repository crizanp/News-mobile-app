// components/SortOptions.tsx - Enhanced Version with Theme Support
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SortOption {
  id: string;
  name: string;
  icon: string;
}

interface SortOptionsProps {
  options: SortOption[];
  selectedSort: string;
  onSortChange: (sortId: string) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({
  options,
  selectedSort,
  onSortChange,
}) => {
  const { theme, isDark } = useTheme();

  const renderSortOption = ({ item }: { item: SortOption }) => {
    const isSelected = selectedSort === item.id;
        
    return (
      <TouchableOpacity
        style={[
          styles.sortButton,
          { 
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          }
        ]}
        onPress={() => onSortChange(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon as any}
          size={14}
          color={isSelected ? '#FFF' : theme.colors.textSecondary}
          style={styles.sortIcon}
        />
        <Text style={[
          styles.sortButtonText,
          { 
            color: isSelected ? '#FFF' : theme.colors.textSecondary 
          }
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border,
      }
    ]}>
      <FlatList
        data={options}
        renderItem={renderSortOption}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  sortList: {
    paddingRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sortIcon: {
    marginRight: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SortOptions;