Passo 3: Implementar a Exclusão Final (Server-Side com Firebase Cloud Functions)
Esta é a parte mais crítica e que não pode ser feita de forma confiável apenas no aplicativo. O aplicativo pode não estar aberto ou o usuário pode desinstalá-lo, impedindo que a lógica de exclusão de 15 dias seja executada.
Você precisará de uma Firebase Cloud Function que:
Monitore as Contas de Usuários: Use um cron job ou um trigger de agendamento (por exemplo, onSchedule) para rodar a função diariamente ou a cada poucas horas.
Busque Contas Pendentes: Consulte o Firestore por documentos de usuário onde isPendingDeletion é true e deletionScheduledDate é menor ou igual à data atual.
Exclua Dados Associados: Para cada usuário encontrado:
Exclua o documento do usuário no Firestore.
Exclua a pasta do usuário no Firebase Storage (users/{userId}/covers/).
Finalmente, exclua o usuário do Firebase Authentication. (Esta ação requer permissões de administrador e só pode ser feita de um ambiente seguro como Cloud Functions).
Lide com Erros: Implemente retry logic e logging para garantir que exclusões incompletas possam ser retomadas.
Exemplo BÁSICO de Cloud Function (arquivo functions/index.ts):

// functions/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Roda todo dia à meia-noite (hora do servidor)
export const scheduledAccountDeletion = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const now = new Date();
    // Busca usuários com exclusão pendente e data de agendamento <= hoje
    const usersToDeleteSnap = await db.collection('users')
        .where('isPendingDeletion', '==', true)
        .where('deletionScheduledDate', '<=', now.toISOString()) // Usamos toISOString para comparação de string
        .get();

    if (usersToDeleteSnap.empty) {
        console.log('Nenhum usuário para exclusão agendada.');
        return null;
    }

    const deletionPromises: Promise<any>[] = [];

    usersToDeleteSnap.forEach(userDoc => {
        const userData = userDoc.data();
        const userId = userDoc.id;
        console.log(`Processando exclusão para o usuário: ${userId}`);

        // 1. Excluir dados do Firestore
        deletionPromises.push(userDoc.ref.delete());

        // 2. Excluir pasta do Storage
        const bucket = storage.bucket();
        deletionPromises.push(
            bucket.deleteFiles({
                prefix: `users/${userId}/`, // Prefixo para a pasta do usuário
                force: true, // Força a exclusão mesmo se a pasta não estiver vazia
            }).then(() => console.log(`Arquivos do Storage para ${userId} excluídos.`))
            .catch(error => console.error(`Erro ao excluir arquivos do Storage para ${userId}:`, error))
        );


        // 3. Excluir o usuário do Firebase Authentication
        deletionPromises.push(
            admin.auth().deleteUser(userId)
                .then(() => console.log(`Usuário Auth ${userId} excluído.`))
                .catch(error => console.error(`Erro ao excluir usuário Auth ${userId}:`, error))
        );
    });

    await Promise.all(deletionPromises);
    console.log('Processo de exclusão agendada concluído.');
    return null;
});