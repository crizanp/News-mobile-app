// components/EmptyState.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
    title?: string;
    message?: string;
    buttonText?: string;
    onButtonPress?: () => void;
    icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No News Available',
    message = 'Pull down to load latest market news',
    buttonText = 'Load Market News',
    onButtonPress,
    icon = 'newspaper-outline'
}) => {
    return (
        <View style={styles.emptyStateContainer}>
            <Ionicons name={icon as any} size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>{title}</Text>
            <Text style={styles.emptyStateText}>{message}</Text>
            {onButtonPress && (
                <TouchableOpacity style={styles.loadButton} onPress={onButtonPress}>
                    <Text style={styles.loadButtonText}>{buttonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    loadButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    loadButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EmptyState;