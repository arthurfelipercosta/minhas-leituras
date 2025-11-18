// src/services/storageService.ts

// import de pacotes
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from 'uuid';

// import de arquivos
import { Title } from "@/types";

const STORAGE_KEY = '@mL:titles';

export const getTitles = async (): Promise<Title[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Erro ao buscar títulos:', e);
        return [];
    }
}

export const saveTitles = async (titles: Title[]) => {
    try {
        const jsonValue = JSON.stringify(titles);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error('Erro ao salvar títulos:', e);
    }
};

export const addTitle = async (newTitleData: Omit<Title, 'id'>): Promise<void> => {
    const existingTitles = await getTitles();
    const newTitle: Title = {
        id: uuidv4(), // Sempre gera um novo ID para um novo título
        name: newTitleData.name,
        currentChapter: newTitleData.currentChapter,
        siteUrl: newTitleData.siteUrl,
        releaseDay: newTitleData.releaseDay,
        coverUri: newTitleData.coverUri,     // Adicionado
        thumbnailUri: newTitleData.thumbnailUri, // Adicionado
    };
    const updatedTitles = [...existingTitles, newTitle];
    await saveTitles(updatedTitles);
};

export const updateTitle = async (updatedTitle: Title): Promise<void> => {
    const existingTitles = await getTitles();
    const updatedTitles = existingTitles.map((t) =>
        t.id === updatedTitle.id ? updatedTitle : t
    );
    await saveTitles(updatedTitles);
};

export const deleteTitle = async (id: string) => {
    const existingTitles = await getTitles();
    const filteredTitles = existingTitles.filter((title) => title.id !== id);
    await saveTitles(filteredTitles);
};

export const exportTitles = async (): Promise<string> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? jsonValue : '[]';
    } catch (error) {
        console.error('Erro ao exportar títulos: ', error);
        return '[]';
    }
}

export const importTitles = async (jsonString: string): Promise<void> => {
    try {
        const parsedTitles: Title[] = JSON.parse(jsonString);
        await saveTitles(parsedTitles);
    } catch (error) {
        console.error('Erro ao importar títulos: ', error);
        throw new Error('Formato JSON inválido para importação.');
    }
}