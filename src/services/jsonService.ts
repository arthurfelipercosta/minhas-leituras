// src/services/jsonService.ts

// import de pacotes
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

// import de arquivos
import { Title } from '@/types';
import { getTitles, saveTitles } from './storageServices';

/**
 * Importa títulos de um arquivo JSON selecionado pelo usuário.
 * Exibe mensagens de Toast para sucesso, cancelamento ou erro.
 * @returns {Promise<boolean>} Retorna true se a importação foi bem-sucedida, false caso contrário.
 */

export const importTitlesFromTXTFile = async (): Promise<boolean> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'text/plain',
            copyToCacheDirectory: true,
        });

        if (result.canceled === false && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;

            const response = await fetch(uri);
            const fileContent = await response.text();

            const importedTitles: Title[] = JSON.parse(fileContent);

            if (!Array.isArray(importedTitles) || importedTitles.some(t => !t.id || !t.name || typeof t.currentChapter !== 'number')) {
                throw new Error('Formato de arquivo JSON inválido para importação de títulos. Verifique se o arquivo contém um array de títulos com as propriedades id, name e currentChapter.');
            }

            await saveTitles(importedTitles);

            Toast.show({
                type: 'success',
                text1: 'Backup Importado!',
                text2: 'Os títulos foram importados com sucesso.',
            });
            return true;
        }
        else {
            Toast.show({
                type: 'info',
                text1: 'Importação Cancelada',
                text2: 'Nenhum arquivo TXT selecionado.',
            });
            return false;
        }
    } catch (error) {
        console.error('Erro ao importar backup:', error);
        Toast.show({
            type: 'error',
            text1: 'Erro ao Importar',
            text2: error.message || 'Não foi possível importar o backup. Certifique-se de que é um arquivo válido.',
        });
        return false;
    }
}

/**
 * Exporta todos os títulos para um arquivo JSON e permite ao usuário compartilhá-lo.
 * Exibe mensagens de Toast para sucesso ou erro.
 * @returns {Promise<boolean>} Retorna true se a exportação foi bem-sucedida, false caso contrário.
 */

export const exportTitlesToTXTFile = async (): Promise<boolean> => {
    try {
        const allTitles = await getTitles();
        const jsonString = JSON.stringify(allTitles, null, 2); // Formata para leitura fácil
        const fileName = `ml-backup-${new Date().toISOString().split('T')[0]}.txt`;

        const blob = new Blob([jsonString], { type: 'text/plain' });
        const reader = new FileReader();

        return new Promise((resolve) => {
            reader.onload = async () => {
                try {
                    const base64 = (reader.result as string).split(',')[1];
                    const dataUri = `data:text/plain;base64,${base64}`;

                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(dataUri, {
                            mimeType: 'text/plain',
                            dialogTitle: 'Salvar Backup',
                            UTI: 'public.txt',
                        });

                        Toast.show({
                            type: 'success',
                            text1: 'Backup Exportado!',
                            text2: 'Selecione onde salvar seu arquivo TXT.',
                        });
                        resolve(true);
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Erro ao Exportar',
                            text2: 'Compartilhamento de arquivo não disponível neste dispositivo.',
                        });
                        resolve(false);
                    }
                } catch (error) {
                    console.error('Erro ao exportar backup:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Erro ao Exportar',
                        text2: 'Não foi possível exportar o backup. Tente novamente.',
                    });
                    resolve(false);
                }
            };

            reader.onerror = () => {
                Toast.show({
                    type: 'error',
                    text1: 'Erro ao Exportar',
                    text2: 'Não foi possível processar o arquivo.',
                });
                resolve(false);
            };

            reader.readAsDataURL(blob);
        });
    } catch (error: any) {
        console.error('Erro ao exportar backup:', error);
        Toast.show({
            type: 'error',
            text1: 'Erro ao Exportar',
            text2: error.message || 'Não foi possível exportar o backup. Tente novamente.',
        });
        return false;
    }
};