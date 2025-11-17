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

export const importTitlesFromJsonFile = async (): Promise<boolean> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled === false && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            const file = new File([], uri);
            const fileContent = await file.text();

            const importedTitles: Title[] = JSON.parse(fileContent);

            if (!Array.isArray(importedTitles) || importedTitles.some(t => !t.id || !t.name || typeof t.currentChapter !== 'number')) {
                throw new Error('Formato de arquivo JSON inválido para importação de títulos. Verifique se o arquivo contém um array de títulos com as propriedades id, name e currentChapter.');
            }

            await saveTitles(importedTitles);

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
                text2: 'Nenhum arquivo JSON selecionado.',
            });
            return false;
        }
    } catch (error) {
        console.error('Erro ao importar backup:', error);
        Toast.show({
            type: 'error',
            text1: 'Erro ao Importar',
            text2: error.message || 'Não foi possível importar o backup. Certifique-se de que é um arquivo JSON válido.',
        });
        return false;
    }
}

/**
 * Exporta todos os títulos para um arquivo JSON e permite ao usuário compartilhá-lo.
 * Exibe mensagens de Toast para sucesso ou erro.
 * @returns {Promise<boolean>} Retorna true se a exportação foi bem-sucedida, false caso contrário.
 */

export const exportTitlesToJsonFile = async (): Promise<boolean> => {
    try {
        const allTitles = await getTitles();
        const jsonString = JSON.stringify(allTitles, null, 2); // Formata para leitura fácil
        const fileName = `minhas-leituras-backup-${new Date().toISOString().split('T')[0]}.json`;

        
        const baseDirectory = (FileSystem as any).documentDirectory;
        
        if (!baseDirectory) {
            Toast.show({
                type: 'error',
                text1: 'Erro ao Exportar',
                text2: 'Diretório de documentos não disponível para exportação neste ambiente.',
            });
            return false;
        }
        
        const fileUri = `${baseDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, jsonString);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, { mimeType: 'application/json', UTI: 'public.json' });
            Toast.show({
                type: 'success',
                text1: 'Backup Exportado!',
                text2: 'Selecione onde salvar seu arquivo JSON.',
            });
            return true; // Sucesso na exportação
        } else {
            Toast.show({
                type: 'error',
                text1: 'Erro ao Exportar',
                text2: 'Compartilhamento de arquivo não disponível neste dispositivo.',
            });
            return false; // Compartilhamento não disponível
        }
    } catch (error) {
        console.error('Erro ao exportar backup:', error);
        Toast.show({
            type: 'error',
            text1: 'Erro ao Exportar',
            text2: 'Não foi possível exportar o backup. Tente novamente.',
        });
        return false; // Erro na exportação
    }
}