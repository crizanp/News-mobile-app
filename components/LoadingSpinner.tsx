// components/LoadingSpinner.tsx
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'large';
    color?: string;
    backgroundColor?: string;
    overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Loading...',
    size = 'large',
    color,
    backgroundColor,
    overlay = false,
}) => {
    const { theme } = useTheme();
    
    // Use provided color or fallback to theme primary color
    const spinnerColor = color || theme.colors.primary;
    const bgColor = backgroundColor || theme.colors.background;
    
    const containerStyle = overlay 
        ? [styles.overlayContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]
        : [styles.container, { backgroundColor: bgColor }];
    
    const spinnerContainerStyle = overlay
        ? [styles.overlaySpinnerContainer, { backgroundColor: theme.colors.surface }]
        : styles.spinnerContainer;

    return (
        <View style={containerStyle}>
            <View style={spinnerContainerStyle}>
                <ActivityIndicator size={size} color={spinnerColor} />
                {message && (
                    <Text style={[
                        styles.message, 
                        { color: theme.colors.text }
                    ]}>
                        {message}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    spinnerContainer: {
        alignItems: 'center',
        padding: 20,
    },
    overlaySpinnerContainer: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 120,
    },
    message: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default LoadingSpinner;