// src/screens/TitleListScreen.tsx

// import de pacotes
import React, { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

// import de arquivos
import { RootStackParamList } from 'App';
import { getTitles, updateTitle, deleteTitle, saveTitles } from '@/services/storageServices';
import { Title } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';
import ConfirmationModal from '../components/ConfirmationModal';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { importTitlesFromTXTFile, exportTitlesToTXTFile } from '@/services/jsonService';
import TitleListItem from '@/components/TitleListItem';

type TitleListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TitleList'>;

const TitleListScreen: React.FC = () => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);
    const navigation = useNavigation<TitleListScreenNavigationProp>();
    const [titles, setTitles] = useState<Title[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'alpha-asc' | 'alpha-desc' | 'release-day'>('alpha-asc');

    const [titleToDeleteId, setTitleToDeleteId] = useState<string | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    const loadTitles = async () => {
        setLoading(true);
        const storedTitles = await getTitles();
        setTitles(storedTitles);
        setLoading(false);
    };

    const confirmExport = useCallback(async () => {
        const sucess = await exportTitlesToTXTFile();
        if (sucess) {
            await loadTitles();
            Toast.show({
                type: 'success',
                text1: 'Exportação concluída!',
                text2: 'Arquivo exportado com sucesso.'
            });
        }
        setIsExportModalVisible(false);
    }, []);

    const cancelExport = useCallback(() => {
        setIsExportModalVisible(false);
    }, []);
    const handleExportFile = useCallback(() => {
        setIsExportModalVisible(true);
    }, []);

    const confirmImport = useCallback(async () => {
        const sucess = await importTitlesFromTXTFile();
        if (sucess) {
            await loadTitles();
            Toast.show({
                type: 'success',
                text1: 'Importação concluída!',
                text2: 'Título(s) importado(s) com sucesso.'
            });
        }
        setIsImportModalVisible(false);
    }, []);

    const cancelImport = useCallback(() => {
        setIsImportModalVisible(false);
    }, []);

    const handleImportFile = useCallback(() => {
        setIsImportModalVisible(true);
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Botão de Exportar */}
                    <TouchableOpacity onPress={handleExportFile} style={{ marginRight: 15 }}>
                        <FontAwesome6 name="upload" size={24} color={themeColors.icon} />
                    </TouchableOpacity>
                    {/* Botão de Importar */}
                    <TouchableOpacity onPress={handleImportFile} style={{ marginRight: 15 }}>
                        <FontAwesome6 name="download" size={24} color={themeColors.icon} />
                    </TouchableOpacity>
                    <ThemeToggleButton />
                </View>
            ),
        });
    }, [navigation, themeColors, handleExportFile, handleImportFile]);

    // Função auxiliar para formatar o capítulo para exibição (sem .00 se for inteiro)
    const formatChapterForDisplay = (chapter: number): string => {
        return Number.isInteger(chapter) ? chapter.toString() : chapter.toFixed(1); // Garante que seja um inteiro e converte para string
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
        setTitles(prevTitles => prevTitles.map(t => t.id === updatedTitle.id ? updatedTitle : t));
    };

    // Função para alternar a ordem de ordenação
    const handleSortChange = () => {
        if (sortOrder === 'alpha-asc') {
            setSortOrder('alpha-desc');
        } else if (sortOrder === 'alpha-desc') {
            setSortOrder('release-day');
        } else { setSortOrder('alpha-asc'); }
    }

    const displayedTitles = useMemo(() => {
        const filteredTitles = titles.filter(title => title.name.toLowerCase().includes(searchQuery.toLowerCase()));

        switch (sortOrder) {
            case 'alpha-asc':
                return filteredTitles.sort((a, b) => a.name.localeCompare(b.name));
            case 'alpha-desc':
                return filteredTitles.sort((a, b) => b.name.localeCompare(a.name));
            case 'release-day':
                return filteredTitles.sort((a, b) => (a.releaseDay ?? 8) - (b.releaseDay ?? 8));
            default:
                return filteredTitles;
        }
    }, [titles, searchQuery, sortOrder])

    const getSortButtonText = () => {
        if (sortOrder === 'alpha-asc') return 'A-Z';
        if (sortOrder === 'alpha-desc') return 'Z-A';
        return 'DIA';
    }
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
            await Clipboard.setStringAsync(url);
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

    const renderTitleItem = ({ item }: { item: Title }) => (
        <TitleListItem
            item={item}
            onDelete={handleDeletePress}
            onChapterChange={handleChapterChange}
            onNavigate={(id) => navigation.navigate('TitleDetail', { id })}
            onCopyUrl={handleCopySiteUrl}
        />
    );

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <Text style={{ color: themeColors.text }}>Carregando títulos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.controlsContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar Títulos..."
                    placeholderTextColor={themeColors.text}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.sortButton} onPress={handleSortChange}>
                    <Text style={styles.sortButtonText}>{getSortButtonText()}</Text>
                </TouchableOpacity>
            </View>
            {displayedTitles.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={{ color: themeColors.text }}>{searchQuery ? 'Nenhum título encontrado.' : 'Nenhum título cadastrado ainda.'}</Text>
                    {!searchQuery && <Text style={{ color: themeColors.text }}>Toque no '+' para adicionar um novo título.</Text>}
                </View>
            ) : (
                <FlatList
                    data={displayedTitles}
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

            <ConfirmationModal
                isVisible={isDeleteModalVisible}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este título?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                confirmButtonText="Deletar"
                cancelButtonText="Cancelar"
            />

            <ConfirmationModal
                isVisible={isExportModalVisible}
                title="Confirmar Exportação"
                message="Deseja exportar todos os títulos para um arquivo TXT?"
                onConfirm={confirmExport}
                onCancel={cancelExport}
                confirmButtonText="Exportar"
                cancelButtonText="Cancelar"
            />

            <ConfirmationModal
                isVisible={isImportModalVisible}
                title="Confirmar Importação"
                message="Deseja importar todos os títulos? Os existentes não serão deletados."
                onConfirm={confirmImport}
                onCancel={cancelImport}
                confirmButtonText="Importar"
                cancelButtonText="Cancelar"
            />
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
        controlsContainer: {
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingTop: 10,
            alignItems: 'center',
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
        searchInput: {
            flex: 1,
            height: 40,
            backgroundColor: themeColors.card,
            color: themeColors.text,
            borderRadius: 8,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: themeColors.border,
            marginRight: 10,
        },
        sortButton: {
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: themeColors.primary,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sortButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });

export default TitleListScreen;