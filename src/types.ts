// src/types.ts
export interface Title {
    id: string; // Um ID único para cada título
    name: string; // Nome do título (e.g., "O Senhor dos Anéis")
    currentChapter: number; // Número do capítulo atual, pode ser decimal
}