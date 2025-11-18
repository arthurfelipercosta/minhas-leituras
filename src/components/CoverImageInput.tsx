// src/components/CoverImageInput.tsx

// import de pacotes
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// import de arquivos
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';

interface CoverImageInputProps {
    imageUri: string | null | undefined;
    onPress: () => void;
}

const CoverImageInput: React.FC<CoverImageInputProps> = ({ imageUri, onPress }) => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
                <View style={styles.placeholder}>
                    <MaterialIcons name="add-a-photo" size={48} color={themeColors.text} />
                    <Text style={styles.placeholderText}>Adicionar Imagem de Capa</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            height: 200,
            backgroundColor: themeColors.card,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 10,
            borderWidth: 1,
            borderColor: themeColors.border,
            overflow: 'hidden',
        },
        image: {
            width: '100%',
            height: '100%',
        },
        placeholder: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        placeholderText: {
            marginTop: 8,
            color: themeColors.text,
            fontSize: 16,
        },
    });

export default CoverImageInput;