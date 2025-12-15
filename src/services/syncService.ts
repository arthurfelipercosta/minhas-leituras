// src/services/syncService.ts

// import de pacotes
import { doc, setDoc, getDoc } from 'firebase/firestore';

// import de arquivos
import { db, auth } from '@/config/firebaseConfig';
import { Title } from '@/types';
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
// Estratégia: para cada título (mesmo id), o mais recente (lastUpdate maior) ganha
export const syncTitlesFromFirebase = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  const userDocId = getUserDocId();
  const docRef = doc(db, COLLECTION_NAME, userDocId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Não há nada na nuvem ainda para esse usuário
    return;
  }

  const firebaseData = docSnap.data();
  const firebaseTitles: Title[] = firebaseData.titles || [];
  const localTitles = await getTitles();

  const titlesMap = new Map<string, Title>();

  // Começa com os títulos locais
  localTitles.forEach((local) => {
    titlesMap.set(local.id, local);
  });

  // Mescla com os remotos (o mais recente ganha)
  firebaseTitles.forEach((remote) => {
    const local = titlesMap.get(remote.id);

    if (!local) {
      // Só existe no remoto
      titlesMap.set(remote.id, remote);
      return;
    }

    const localDate = local.lastUpdate ? new Date(local.lastUpdate).getTime() : 0;
    const remoteDate = remote.lastUpdate ? new Date(remote.lastUpdate).getTime() : 0;

    if (remoteDate > localDate) {
      // Remoto mais recente
      titlesMap.set(remote.id, remote);
    } else {
      // Local mais recente (ou igual)
      titlesMap.set(local.id, local);
    }
  });

  const mergedTitles = Array.from(titlesMap.values());
  await saveTitles(mergedTitles);
};

// Sincronização bidirecional completa (se ainda quiser usar em outro lugar)
export const fullSync = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  // 1. Baixar do Firebase com merge por lastUpdate
  await syncTitlesFromFirebase();

  // 2. Subir de volta o resultado mesclado
  await syncTitlesToFirebase();
};