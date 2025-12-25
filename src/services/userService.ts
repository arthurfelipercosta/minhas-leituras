// src/services/userService.ts

// import de pacotes
import { doc, updateDoc } from 'firebase/firestore';

// import de arquivos
import { db, auth } from '@/config/firebaseConfig';

export async function requestAccountDeletionService(): Promise<void> {
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error("Nenhum usuário logado para solicitar a exclusão!");
    }

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);

    const fifteenDays = new Date();
    fifteenDays.setDate(fifteenDays.getDate() + 15);

    await updateDoc(userRef, {
        isPendingDeletion: true,
        deletionScheduledDate: fifteenDays.toISOString(),
    });
    
    // Faz o logout depois de pedir para apagar a conta
    await auth.signOut();
}

export async function cancelAccountDeletionService(): Promise<void> {
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error("Nenhum usuário logado para solicitar a exclusão!");
    }
    
    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
        isPendingDeletion: false,
        deletionScheduledDate: null,    // Data agendada é limpa
    });
}