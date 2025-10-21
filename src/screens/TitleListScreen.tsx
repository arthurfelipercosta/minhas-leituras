// src/screens/TitleListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Importar tipos de navegação
import { Title } from '../types';
import { getTitles, updateTitle, deleteTitle } from '../services/storageService';
import { AntDesign } from '@expo/vector-icons'; // Instalar @expo/vector-icons

type TitleListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TitleList'>;

// Instalar @expo/vector-icons: npx expo install @expo/vector-icons

const TitleListScreen: React.FC = () => {
    const navigation = useNavigation<TitleListScreenNavigationProp>();
    const [titles, setTitles] = useState<Title[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja deletar este título?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTitle(id);
                        await loadTitles();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderTitleItem = ({ item }: { item: Title }) => (
        <View style={styles.titleItem}>
            <TouchableOpacity onPress={() => navigation.navigate('TitleDetail', { id: item.id })}>
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
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <AntDesign name="delete" size={24} color="gray" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Carregando títulos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {titles.length === 0 ? (
                <View style={styles.centered}>
                    <Text>Nenhum título cadastrado ainda.</Text>
                    <Text>Toque no '+' para adicionar um novo título.</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 80, // Espaço para o FAB
    },
    titleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    titleName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1, // Permite que o texto ocupe o espaço disponível
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
        bottom: 30,
        backgroundColor: '#007AFF', // Cor azul padrão do iOS
        borderRadius: 30,
        elevation: 4, // Sombra no Android
        shadowColor: '#000', // Sombra no iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default TitleListScreen;