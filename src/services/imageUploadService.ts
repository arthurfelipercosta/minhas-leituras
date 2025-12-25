// src/services/imageUploadeService.ts

// import de pacotes
import { auth } from '@/config/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImageToFirebase(localUri: string, fileName: string): Promise<string> {
    const userId = auth.currentUser?.uid;
    const storage = getStorage(); // Já é inicializado pelo seu firebaseConfig
    const storageRef = ref(storage, `users/${userId}/covers/${fileName}`);

    // Busca o blob da imagem (React Native)
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Faz o upload do blob pro storage
    await uploadBytes(storageRef, blob);

    // Busca a url pública
    return await getDownloadURL(storageRef);
}