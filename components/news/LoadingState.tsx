// components/LoadingState.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LoadingStateProps {
    message?: string;
    icon?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
    message = 'Loading Market News...', 
    icon = 'trending-up-outline' 
}) => {
    return (
        <View style={styles.loadingContainer}>
            <Ionicons name={icon as any} size={64} color="#007AFF" />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
});

export default LoadingState;