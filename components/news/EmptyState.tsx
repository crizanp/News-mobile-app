// components/EmptyState.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
    title?: string;
    message?: string;
    buttonText?: string;
    onButtonPress?: () => void;
    icon?: string;
    showButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No News Available',
    message = 'Pull down to load latest market news',
    buttonText = 'Load Market News',
    onButtonPress,
    icon = 'newspaper-outline',
    showButton = true
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.emptyStateContainer}>
            <Ionicons 
                name={icon as any} 
                size={64} 
                color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                {title}
            </Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                {message}
            </Text>
            {showButton && onButtonPress && (
                <TouchableOpacity 
                    style={[styles.loadButton, { backgroundColor: theme.colors.primary }]} 
                    onPress={onButtonPress}
                    activeOpacity={0.8}
                >
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
        flex: 1,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    loadButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loadButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EmptyState;