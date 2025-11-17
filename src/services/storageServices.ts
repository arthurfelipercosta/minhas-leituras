// src/services/storageService.ts

// import de pacotes
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';

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

export const addTitle = async (name: string, initialChapter: number = 0, siteUrl?: string, releaseDay?: number): Promise<Title> => {
    const newTitle: Title = {
        id: uuid.v4().toString(), // Gera um ID único
        name,
        currentChapter: initialChapter,
        ...(siteUrl ? { siteUrl } : {}),
        releaseDay,
    };
    const existingTitles = await getTitles();
    await saveTitles([...existingTitles, newTitle]);
    return newTitle;
};

export const updateTitle = async (updatedTitle: Title) => {
    const existingTitles = await getTitles();
    const updatedTitles = existingTitles.map((title) =>
        title.id === updatedTitle.id ? updatedTitle : title
    );
    await saveTitles(updatedTitles);
};

export const deleteTitle = async (id: string) => {
    const existingTitles = await getTitles();
    const filteredTitles = existingTitles.filter((title) => title.id !== id);
    await saveTitles(filteredTitles);
};