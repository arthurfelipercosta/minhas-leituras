// src/screens/TitleDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Title } from '../types';
import { addTitle, updateTitle, getTitles } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/colors';
import Toast from 'react-native-toast-message';

type TitleDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TitleDetail'>;

const TitleDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    const navigation = useNavigation<TitleDetailScreenProps['navigation']>();
    const route = useRoute<TitleDetailScreenProps['route']>();
    const { id } = route.params || {}; // Pega o ID se estiver editando

    const [titleName, setTitleName] = useState('');
    const [currentChapter, setCurrentChapter] = useState('0');
    const [siteUrl, setSiteUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            // Se tiver um ID, estamos editando um título existente
            setIsEditing(true);
            const loadTitleToEdit = async () => {
                const titles = await getTitles();
                const titleToEdit = titles.find((t) => t.id === id);
                if (titleToEdit) {
                    setTitleName(titleToEdit.name);
                    // Garante que seja um inteiro para exibição
                    setCurrentChapter(Math.floor(titleToEdit.currentChapter).toString());
                    setSiteUrl(titleToEdit.siteUrl || '') // Carrega o siteUrl para edição
                }
            };
            loadTitleToEdit();
        } else {
            setIsEditing(false);
            setTitleName('');
            setCurrentChapter('0');
            setSiteUrl('');
        }
    }, [id]);

    const handleSave = async () => {
        if (!titleName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'O nome do título não pode ser vazio.',
            });
            return;
        }

        const chapterNumber = parseInt(currentChapter, 10); // Usa parseInt para garantir um inteiro
        if (isNaN(chapterNumber) || chapterNumber < 0) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'O capítulo deve ser um número inteiro válido e não negativo.',
            });
            return;
        }

        if (siteUrl && !/^https?:\/\/.+\..+$/.test(siteUrl)) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Por favor, insira uma URL válida para o site (ex: https://example.com).',
            });
            return;
        }

        if (isEditing && id) {
            const updatedTitle: Title = {
                id: id,
                name: titleName,
                currentChapter: chapterNumber,
                siteUrl: siteUrl.trim() || undefined,
            };
            await updateTitle(updatedTitle);
            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Título atualizado!',
            });
        } else {
            await addTitle(titleName, chapterNumber);
            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Título adicionado!',
            });
        }
        navigation.goBack(); // Volta para a tela anterior (TitleListScreen)
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.form}>
                <Text style={styles.label}>Nome do Título:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: O Pequeno Príncipe"
                    value={titleName}
                    onChangeText={setTitleName}
                />

                <Text style={styles.label}>Capítulo Atual:</Text>
                <View style={styles.chapterInputContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            const num = parseInt(currentChapter, 10);
                            if (!isNaN(num) && num > 0) {
                                setCurrentChapter((num - 1).toString()); // Decrementa 1
                            } else if (isNaN(num)) {
                                setCurrentChapter('0'); // Se for NaN, define como 0
                            }
                        }}
                        style={styles.chapterAdjustButton}
                    >
                        <Text style={styles.chapterAdjustButtonText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, styles.chapterInput]}
                        placeholder="0" // Placeholder para inteiro
                        keyboardType="numeric"
                        value={currentChapter}
                        onChangeText={(text) =>
                            setCurrentChapter(text.replace(/[^0-9]/g, '')) // Permite apenas dígitos
                        }
                        onBlur={() => {
                            const num = parseInt(currentChapter, 10);
                            if (isNaN(num) || num < 0) {
                                setCurrentChapter('0'); // Se inválido, define como 0
                            } else {
                                setCurrentChapter(num.toString()); // Garante que seja um inteiro em string
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            const num = parseInt(currentChapter, 10);
                            if (!isNaN(num)) {
                                setCurrentChapter((num + 1).toString()); // Incrementa 1
                            } else {
                                setCurrentChapter('1'); // Se for NaN, define como 1
                            }
                        }}
                        style={styles.chapterAdjustButton}
                    >
                        <Text style={styles.chapterAdjustButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>URL do Site (Opcional):</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: https://mangadex.org/title/..."
                    value={siteUrl}
                    onChangeText={setSiteUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{isEditing ? 'Salvar Edições' : 'Adicionar Título'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: themeColors.background,
        },
        form: {
            backgroundColor: themeColors.card,
            padding: 20,
            borderRadius: 10,
            ...(theme === 'light'
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    elevation: 5,
                }
                : {
                    borderWidth: 1,
                    borderColor: themeColors.border,
                }),
        },
        label: {
            fontSize: 16,
            marginBottom: 5,
            fontWeight: 'bold',
            color: themeColors.text,
        },
        input: {
            borderWidth: 1,
            borderColor: themeColors.border,
            backgroundColor: themeColors.background,
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
            fontSize: 16,
            color: themeColors.text,
        },
        chapterInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        chapterInput: {
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 10,
        },
        chapterAdjustButton: {
            backgroundColor: themeColors.primary,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        chapterAdjustButtonText: {
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
        },
        saveButton: {
            backgroundColor: themeColors.primary,
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
        },
        saveButtonText: {
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
        },
    });

export default TitleDetailScreen;