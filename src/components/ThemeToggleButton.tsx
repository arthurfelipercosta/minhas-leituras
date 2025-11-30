// src/components/ThemeToggleButton.tsx

// import de pacotes
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// import de arquivos
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/colors';

export const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();
    const themeColors = colors[theme];

    return (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons
                name={theme === 'light' ? 'moon' : 'sunny'}
                size={24}
                color={themeColors.icon}
            />
        </TouchableOpacity>
    );
};