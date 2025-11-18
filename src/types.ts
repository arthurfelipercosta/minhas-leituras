// src/types.ts
export interface Title {
    id: string;             // Um ID único para cada título
    name: string;           // Nome do título (e.g., "O Senhor dos Anéis")
    currentChapter: number; // Número do capítulo atual, pode ser decimal
    siteUrl?: string;       // Campo para a URL do site (opcional)
    releaseDay?: number;    // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    thumbnailUri?: string;  // Imagem de thumbnail
    coverUri?: string;      // Imagem na tela de detalhes
}