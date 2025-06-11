// components/SortOptions.tsx - Compact Version
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
  const renderSortOption = ({ item }: { item: SortOption }) => {
    const isSelected = selectedSort === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.sortButton,
          isSelected && styles.sortButtonActive
        ]}
        onPress={() => onSortChange(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon as any}
          size={14}
          color={isSelected ? '#FFF' : '#666'}
          style={styles.sortIcon}
        />
        <Text style={[
          styles.sortButtonText,
          isSelected && styles.sortButtonTextActive
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortIcon: {
    marginRight: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
});

export default SortOptions;