// PASSO 3: Criar serviço de sincronização com Firebase
// Arquivo: src / services / syncService.ts
// src/services/syncService.ts
// import de pacotes// src/services/syncService.ts

// import de pacotes
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { auth } from '../config/firebaseConfig';
import { Title } from '../types';
import { getTitles, saveTitles } from './storageServices';

const COLLECTION_NAME = 'userTitles';

// Função para obter o ID do documento do usuário
const getUserDocId = (): string => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    return user.uid;
};

// Upload: Enviar títulos locais para o Firebase
export const syncTitlesToFirebase = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const localTitles = await getTitles();
    const userDocId = getUserDocId();

    await setDoc(doc(db, COLLECTION_NAME, userDocId), {
        titles: localTitles,
        lastSync: new Date().toISOString(),
        userId: user.uid,
    });
};

// Download: Baixar títulos do Firebase e mesclar com locais
export const syncTitlesFromFirebase = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const userDocId = getUserDocId();
    const docRef = doc(db, COLLECTION_NAME, userDocId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const firebaseData = docSnap.data();
        const firebaseTitles: Title[] = firebaseData.titles || [];
        const localTitles = await getTitles();

        // Estratégia de merge: combinar títulos únicos por ID
        const titlesMap = new Map<string, Title>();

        // Adicionar títulos locais primeiro
        localTitles.forEach(title => titlesMap.set(title.id, title));

        // Adicionar/atualizar com títulos do Firebase (Firebase tem prioridade)
        firebaseTitles.forEach(title => titlesMap.set(title.id, title));

        const mergedTitles = Array.from(titlesMap.values());
        await saveTitles(mergedTitles);
    }
};

// Sincronização bidirecional completa
export const fullSync = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // 1. Baixar do Firebase primeiro
    await syncTitlesFromFirebase();

    // 2. Enviar de volta (com dados locais mesclados)
    await syncTitlesToFirebase();
};