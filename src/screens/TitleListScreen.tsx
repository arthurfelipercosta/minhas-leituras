// src/screens/TitleListScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'; // Importar Platform
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Importar tipos de navegação
import { Title } from '../types';
import { getTitles, updateTitle, deleteTitle } from '../services/storageService';
import { AntDesign } from '@expo/vector-icons'; // Instalar @expo/vector-icons
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/colors';
import Toast from 'react-native-toast-message';
import ConfirmationModal from '../components/ConfirmationModal';

type TitleListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TitleList'>;

// Instalar @expo/vector-icons: npx expo install @expo/vector-icons
// Instalar react-native-toast-message com npx expo install, npm install ou yarn add

const TitleListScreen: React.FC = () => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);
    const navigation = useNavigation<TitleListScreenNavigationProp>();
    const [titles, setTitles] = useState<Title[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [titleToDeleteId, setTitleToDeleteId] = useState<string | null>(null);

    const loadTitles = async () => {
        setLoading(true);
        const storedTitles = await getTitles();
        setTitles(storedTitles);
        setLoading(false);
    };

    // Função auxiliar para formatar o capítulo para exibição (sem .00 se for inteiro)
    const formatChapterForDisplay = (chapter: number): string => {
        return Math.floor(chapter).toString(); // Garante que seja um inteiro e converte para string
    };

    // Carrega os títulos toda vez que a tela foca
    useFocusEffect(
        useCallback(() => {
            loadTitles();
        }, [])
    );

    const handleChapterChange = async (title: Title, delta: number) => {
        // Garante que o delta seja sempre 1 ou -1 para capítulos inteiros
        const updatedChapter = Math.floor(title.currentChapter + delta);
        const updatedTitle = { ...title, currentChapter: updatedChapter >= 0 ? updatedChapter : 0 };
        await updateTitle(updatedTitle);
        await loadTitles(); // Recarrega a lista para refletir a mudança
    };

    // Função para confirmar a exclusão
    const confirmDelete = async () => {
        if (titleToDeleteId) {
            await deleteTitle(titleToDeleteId);
            await loadTitles();
            Toast.show({
                type: 'success',
                text1: 'Título Deletado!',
                text2: 'O título foi removido com sucesso.',
            });
            setTitleToDeleteId(null);
        }
        setIsDeleteModalVisible(false); // Fecha o modal após a ação
    };

    // Função para cancelar a exclusão
    const cancelDelete = () => {
        setIsDeleteModalVisible(false);
        setTitleToDeleteId(null);
    };

    // Função chamada quando o botão de exclusão é pressionado em um item
    const handleDeletePress = (id: string) => {
        setTitleToDeleteId(id);
        setIsDeleteModalVisible(true);
    };

    // Função para copiar o siteUrl para a área de transferência
    const handleCopySiteUrl = async (url: string | undefined) => {
        if (url) {
            Toast.show({
                type: 'success',
                text1: 'Link Copiado!',
                text2: 'O link foi copiado com sucesso para a área de transferência.',
            })
        } else {
            Toast.show({
                type: 'info',
                text1: 'Aviso!',
                text2: 'Nenhum link de site disponível para este título.',
            })
        }
    };

    const renderTitleItem = ({ item }: { item: Title }) => {
        const currentDay = new Date().getDay(); // 0 para Domingo, 1 para Segunda, etc.
        const isReleaseDayToday = item.releaseDay !== undefined && item.releaseDay === currentDay;
        return (
            <View style={[styles.titleItem, isReleaseDayToday && styles.releaseDayHighlight]}>
                <TouchableOpacity
                    onPress={() => {
                        item.siteUrl ? handleCopySiteUrl(item.siteUrl) : navigation.navigate('TitleDetail', { id: item.id });
                    }}
                    onLongPress={() => navigation.navigate('TitleDetail', { id: item.id }) // Navegar para a edição com um long press
                    }>
                    <Text style={styles.titleName}>{item.name}</Text>
                </TouchableOpacity>
                <View style={styles.chapterControl}>
                    <TouchableOpacity
                        onPress={() => handleChapterChange(item, -1)} // Alterado para -1
                        style={styles.chapterButton}
                    >
                        <AntDesign name="minus-circle" size={24} color="red" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('TitleDetail', { id: item.id })}>
                        <Text style={styles.chapterText}>{formatChapterForDisplay(item.currentChapter)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleChapterChange(item, 1)} // Alterado para +1
                        style={styles.chapterButton}
                    >
                        <AntDesign name="plus-circle" size={24} color="green" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleDeletePress(item.id)} style={styles.deleteButton}>
                    <AntDesign name="delete" size={24} color={themeColors.icon} />
                </TouchableOpacity>
                <ConfirmationModal
                    isVisible={isDeleteModalVisible}
                    title="Confirmar Exclusão"
                    message="Tem certeza que deseja excluir este título?"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    confirmButtonText="Deletar"
                    cancelButtonText="Cancelar"
                />
            </View >)
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <Text style={{ color: themeColors.text }}>Carregando títulos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {titles.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={{ color: themeColors.text }}>Nenhum título cadastrado ainda.</Text>
                    <Text style={{ color: themeColors.text }}>Toque no '+' para adicionar um novo título.</Text>
                </View>
            ) : (
                <FlatList
                    data={titles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTitleItem}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('TitleDetail', undefined)}
            >
                <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.background,
        },
        listContent: {
            paddingBottom: 80,
        },
        titleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        titleName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text,
        },
        chapterControl: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
            marginRight: 10,
        },
        chapterButton: {
            padding: 5,
        },
        chapterText: {
            fontSize: 18,
            marginHorizontal: 10,
            fontWeight: '600',
            color: themeColors.text,
        },
        deleteButton: {
            padding: 5,
            marginLeft: 10,
        },
        fab: {
            position: 'absolute',
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            right: 30,
            bottom: 50,
            backgroundColor: themeColors.primary,
            borderRadius: 30,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        releaseDayHighlight: {
            borderColor: 'green', // Ou themeColors.primary, se preferir
            borderWidth: 2,
        },
    });

export default TitleListScreen;