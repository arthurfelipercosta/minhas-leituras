// src/screens/TitleDetailScreen.tsx

// import de pacotes
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

//import de arquivos
import { RootStackParamList } from 'App';
import { addTitle, updateTitle, getTitles } from '@/services/storageServices';
import { Title } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';
import CoverImageInput from '@/components/CoverImageInput'; // Importar o componente da capa

type TitleDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TitleDetail'>;

const TitleDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    const navigation = useNavigation<TitleDetailScreenProps['navigation']>();
    const route = useRoute<TitleDetailScreenProps['route']>();
    const { id } = route.params || {}; // Pega o ID se estiver editando

    const [title, setTitle] = useState<Title | null>(null); // Estado para o título completo
    const [titleName, setTitleName] = useState('');
    const [currentChapter, setCurrentChapter] = useState('0');
    const [lastChapter, setLastChapter] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const [releaseDay, setReleaseDay] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [coverImageUri, setCoverImageUri] = useState<string | null>(null); // Estado para a URI da imagem de capa

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // Dias da semana para a UI

    useEffect(() => {
        if (id) {
            // Se tiver um ID, estamos editando um título existente
            setIsEditing(true);
            const loadTitleToEdit = async () => {
                const titles = await getTitles();
                const titleToEdit = titles.find((t) => t.id === id);
                if (titleToEdit) {
                    // Atualiza a data da última modificação sempre que o card for aberto para edição
                    const updatedTitle = { ...titleToEdit, lastUpdate: new Date().toISOString() };
                    await updateTitle(updatedTitle);

                    setTitle(updatedTitle);
                    setTitleName(updatedTitle.name);
                    setCurrentChapter(updatedTitle.currentChapter.toString());
                    setLastChapter(updatedTitle.lastChapter?.toString() || ''); // Carregar último capítulo
                    setSiteUrl(updatedTitle.siteUrl || '');
                    setReleaseDay(updatedTitle.releaseDay ?? null);
                    setCoverImageUri(updatedTitle.coverUri || null);
                    setIsFinished(updatedTitle.lastChapter !== undefined); // Definir o estado do Switch
                }
            };
            loadTitleToEdit();
        } else {
            setIsEditing(false);
            setTitle(null); // Limpa o título se não estiver editando
            setTitleName('');
            setCurrentChapter('0');
            setLastChapter('');
            setSiteUrl('');
            setReleaseDay(null);
            setIsFinished(false);
            setCoverImageUri(null); // Limpa a imagem também
        }
    }, [id]);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Permissão Necessária',
                text2: 'Precisamos de permissão para acessar sua galeria de fotos.',
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Forma correta para o ImagePicker atual
            allowsEditing: true,
            aspect: [2, 3], // Proporção de capa
            quality: 1,
        });

        if (!result.canceled) {
            setCoverImageUri(result.assets[0].uri);
        }
    };

    const handleClearSiteUrl = () => {
        setSiteUrl('');
        Toast.show({
            type: 'info',
            text1: 'Link limpo',
            text2: 'O campo do link do site foi limpo.',
        });
    };

    const handleSave = async () => {
        if (!titleName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'O nome do título não pode ser vazio.',
            });
            return;
        }

        const chapterNumber = parseFloat(currentChapter.replace(',', '.'));
        const lastChapterNumber = lastChapter ? parseFloat(lastChapter.replace(',', '.')) : undefined;
        if (isNaN(chapterNumber) || (lastChapter && isNaN(lastChapterNumber!))) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'O capítulo deve ser um número inteiro válido.',
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

        const titleData: Title = {
            id: isEditing && title?.id ? title.id : '', // O ID será preenchido por addTitle se for novo
            name: titleName,
            currentChapter: chapterNumber,
            lastChapter: isFinished ? lastChapterNumber : undefined,
            siteUrl: siteUrl.trim() || undefined,
            releaseDay: releaseDay ?? undefined,
            coverUri: coverImageUri || undefined, // Incluímos a URI da capa
            thumbnailUri: coverImageUri || undefined, // Por enquanto, usa a mesma da capa
            lastUpdate: new Date().toISOString(), // Sempre atualizar data ao salvar
        };

        if (isEditing && id) {
            titleData.id = id; // Garante que o ID do objeto seja o da rota para atualização
            await updateTitle(titleData); // Passamos o objeto titleData completo
            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Título atualizado!',
            });
        } else {
            await addTitle(titleData); // Agora passamos o objeto titleData completo
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
            <ScrollView
                contentContainerStyle={styles.formWrapper}
                scrollEnabled={true}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.form}>
                    <CoverImageInput imageUri={coverImageUri} onPress={handlePickImage} />

                    <Text style={styles.label}>Nome do Título:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: O Pequeno Príncipe"
                        placeholderTextColor={themeColors.textSecondary}
                        value={titleName}
                        onChangeText={setTitleName}
                    />

                    <Text style={styles.label}>Capítulo Atual:</Text>
                    <View style={styles.chapterInputContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                const num = parseInt(currentChapter, 10);
                                if (!isNaN(num)) {
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
                            placeholderTextColor={themeColors.textSecondary}
                            keyboardType="decimal-pad"
                            value={currentChapter}
                            onChangeText={(text) => {
                                // Permite dígitos e um único ponto ou vírgula (substituindo vírgula por ponto)
                                const cleanedText = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
                                // Garante que não haja múltiplos pontos decimais
                                const parts = cleanedText.split('.');
                                if (parts.length > 2) {
                                    setCurrentChapter(`${parts[0]}.${parts.slice(1).join('')}`);
                                } else {
                                    setCurrentChapter(cleanedText);
                                }
                            }}
                            onBlur={() => {
                                const num = parseFloat(currentChapter); // Usa parseFloat
                                if (isNaN(num)) {
                                    setCurrentChapter('0'); // Se inválido, define como 0
                                } else {
                                    setCurrentChapter(num.toString()); // Garante que seja um número em string
                                }
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                const num = parseInt(currentChapter);
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
                    <View style={styles.siteUrlInputContainer}>
                        <TextInput
                            style={[styles.input, styles.siteUrlInput]}
                            placeholder="Ex: https://mangadex.org/title/..."
                            placeholderTextColor={themeColors.textSecondary}
                            value={siteUrl}
                            onChangeText={setSiteUrl}
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                        {siteUrl ? ( // Mostra o ícone de lixeira apenas se houver um URL
                            <TouchableOpacity onPress={handleClearSiteUrl} style={styles.clearSiteUrlButton}>
                                <AntDesign name="delete" size={24} color="red" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <Text style={styles.label}>Dia de Lançamento (Opcional):</Text>
                    <View style={styles.weekDayContainer}>
                        {weekDays.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayButton,
                                    releaseDay === index && styles.selectedDayButton // Estilo condicional
                                ]}
                                onPress={() => setReleaseDay(releaseDay === index ? null : index)} // Permite selecionar e deselecionar
                            >
                                <Text style={[styles.dayButtonText, releaseDay === index && styles.selectedDayButtonText]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.finishedContainer}>
                        <Text style={styles.label}>Concluído?</Text>
                        <Switch
                            trackColor={{ false: themeColors.switchInactive, true: themeColors.switchActive }}
                            thumbColor={isFinished ? themeColors.switchActive : themeColors.switchTumb}
                            onValueChange={() => setIsFinished(previousState => !previousState)}
                            value={isFinished}
                        />
                    </View>
                    {isFinished && (
                        <>
                            <Text style={styles.label}>Último Capítulo:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 150"
                                placeholderTextColor={themeColors.textSecondary}
                                keyboardType="decimal-pad"
                                value={lastChapter}
                                onChangeText={setLastChapter}
                            />
                        </>
                    )}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>{isEditing ? 'Salvar' : 'Adicionar'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        formWrapper: { // Estilo para o contentContainerStyle do ScrollView
            padding: 20,
            paddingBottom: 60,
        },
        form: {
            backgroundColor: themeColors.card,
            padding: 20, // Padding do card interno
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
        finishedContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
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
            marginBottom: 0,
        },
        siteUrlInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        siteUrlInput: {
            flex: 1,
            marginRight: 10,
            marginBottom: 0,
        },
        clearSiteUrlButton: {
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
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
        weekDayContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        dayButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.background,
            borderWidth: 1,
            borderColor: themeColors.border,
        },
        selectedDayButton: {
            backgroundColor: themeColors.primary,
            borderColor: themeColors.primary,
        },
        dayButtonText: {
            color: themeColors.text,
            fontWeight: 'bold',
        },
        selectedDayButtonText: {
            color: '#FFFFFF',
        },
    });

export default TitleDetailScreen;