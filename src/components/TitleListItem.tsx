// src/components/TitleListItem.tsx

// import de pacotes
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

// import de arquivos
import { Title } from '@/types';
import { colors } from '@/styles/colors';
import { useTheme } from '@/context/ThemeContext';

interface TitleListItemProps {
    item: Title;
    onDelete: (id: string) => void;
    onChapterChange: (item: Title, delta: number) => void;
    onNavigate: (id: string) => void;
    onCopyUrl: (url: string | undefined) => void;
}

const TitleListItem: React.FC<TitleListItemProps> = ({ item, onDelete, onChapterChange, onNavigate, onCopyUrl }) => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    const formatChapterForDisplay = (chapter: number | undefined | null): string => {
        if (chapter === undefined || chapter === null) {
            return '0';
        }
        const result = Number.isInteger(chapter) ? chapter.toString() : chapter.toFixed(1).toString();
        return result;
    };

    const currentDay = new Date().getDay();
    const isReleaseDayToday = item.releaseDay !== undefined && item.releaseDay === currentDay;

    return (
        <View style={[styles.titleItem, isReleaseDayToday && styles.releaseDayHighlight]}>
            {item.thumbnailUri ? (
                <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
            ) : (
                <View style={styles.thumbnailPlaceholder} /> 
            )}
            <TouchableOpacity
                onPress={() => item.siteUrl ? onCopyUrl(item.siteUrl) : onNavigate(item.id)}
                onLongPress={() => onNavigate(item.id)}
                style={styles.titleTextContainer}
            >
                <Text style={styles.titleName} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </Text>
            </TouchableOpacity>

            <View style={styles.chapterControl}>
                <TouchableOpacity onPress={() => onChapterChange(item, -1)} style={styles.chapterButton}>
                    <AntDesign name="minus-circle" size={24} color="red" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNavigate(item.id)}>
                    <Text style={styles.chapterText}>
                        {formatChapterForDisplay(item.currentChapter)}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChapterChange(item, 1)} style={styles.chapterButton}>
                    <AntDesign name="plus-circle" size={24} color="green" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
                <AntDesign name="delete" size={24} color={themeColors.icon} />
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        titleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: themeColors.card,
            padding: 15,
            marginVertical: 5,
            marginHorizontal: 10,
            borderRadius: 8,
            ...(theme === 'light'
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                    elevation: 2,
                }
                : {
                    borderWidth: 1,
                    borderColor: themeColors.border,
                }),
        },
        titleTextContainer: {
            flex: 1,
            marginRight: 10,
        },
        titleName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text,
        },
        chapterControl: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        chapterButton: {
            paddingHorizontal: 4,
        },
        chapterText: {
            fontSize: 18,
            marginHorizontal: 8,
            fontWeight: '600',
            color: themeColors.text,
            minWidth: 40,
            textAlign: 'center',
        },
        deleteButton: {
            padding: 5,
            marginLeft: 10,
        },
        releaseDayHighlight: {
            borderColor: 'green',
            borderWidth: 2,
        },
        thumbnail: {
            width: 40,
            height: 60,
            borderRadius: 4,
            marginRight: 15,
            backgroundColor: themeColors.border,
        },
        thumbnailPlaceholder: {
            width: 40,
            height: 60,
            marginRight: 15,
        },
    });

export default TitleListItem;