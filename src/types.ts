// src/types.ts

// Interface para os títulos presentes no aplicativo
export interface Title {
    id: string;             // Um ID único para cada título
    name: string;           // Nome do título (e.g., "O Senhor dos Anéis")
    currentChapter: number; // Número do capítulo atual, pode ser decimal
    lastChapter?: number;   // Número do último capítulo, pode ser decimal
    siteUrl?: string;       // Campo para a URL do site (opcional)
    releaseDay?: number;    // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    lastUpdate?: string;    // Última atualização
    thumbnailUri?: string;  // Imagem de thumbnail
    coverUri?: string;      // Imagem na tela de detalhes
}

// Interface para o modelo de dados do usuário no Firestore
export interface UserProfile {
    uid: string;                           // ID único do usuário
    email: string;                          // Email do usuário
    isPendingDeletion?: boolean;            // true se a exclusão foi solicitada, false caso contrário
    deletionScheduledDate?: string | null;  // Data agendada para exclusão (ISO string) ou null
}