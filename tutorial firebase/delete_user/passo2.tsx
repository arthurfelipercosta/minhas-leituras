Passo 2: Criar Funções no Aplicativo (Client-Side)
Você precisará de funções para solicitar a exclusão e, opcionalmente, para cancelar a exclusão.
2.1. Função requestAccountDeletion (no AuthContext.tsx ou um novo userService.ts)
Esta função será chamada quando o usuário clicar no botão "Deletar Conta". Ela deve:
Obter o UID do usuário atual (auth.currentUser.uid).
Calcular a data de agendamento da exclusão (data atual + 15 dias).
Atualizar o documento do usuário no Firestore com isPendingDeletion: true e deletionScheduledDate.
Realizar logout do usuário imediatamente.
Sugestão de código para src/services/userService.ts (ou adicionar ao AuthContext.tsx):

// src/services/userService.ts
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig'; // Assumindo que você exporta db e auth aqui

export async function requestAccountDeletionService(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Nenhum usuário logado para solicitar a exclusão.");
    }

    const userId = user.uid;
    const userRef = doc(db, 'users', userId); // Assumindo que você tem uma coleção 'users'

    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

    await updateDoc(userRef, {
        isPendingDeletion: true,
        deletionScheduledDate: fifteenDaysFromNow.toISOString(), // Salve como ISO string
    });

    // Opcional: fazer logout do usuário
    await auth.signOut();
}

export async function cancelAccountDeletionService(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Nenhum usuário logado para cancelar a exclusão.");
    }

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
        isPendingDeletion: false,
        deletionScheduledDate: null, // Limpa a data agendada
    });
}

2.2. Botão "Deletar Conta" na ProfileScreen.tsx
Adicione um botão na sua ProfileScreen que chame a função requestAccountDeletionService após uma confirmação do usuário (usando um Alert ou Modal).
Exemplo na ProfileScreen.tsx (após importar requestAccountDeletionService):

// ... imports existentes ...
import { requestAccountDeletionService, cancelAccountDeletionService } from '@/services/userService'; // Crie este arquivo

const ProfileScreen: React.FC = () => {
    // ... estados e lógicas existentes ...

    const handleRequestDeletion = async () => {
        Alert.alert(
            "Confirmar Exclusão de Conta",
            "Sua conta será marcada para exclusão e será permanentemente removida em 15 dias. Você pode cancelar a exclusão fazendo login novamente nesse período. Deseja continuar?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Deletar",
                    onPress: async () => {
                        try {
                            await requestAccountDeletionService();
                            Toast.show({
                                type: 'success',
                                text1: 'Exclusão Solicitada!',
                                text2: 'Sua conta será excluída em 15 dias. Você foi desconectado.',
                            });
                            navigation.navigate('Login' as any); // Ou para a tela inicial
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erro',
                                text2: error.message || 'Falha ao solicitar exclusão.',
                            });
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // ... renderização da tela ...
    return (
        <View style={styles.container}>
            {/* ... outros elementos do perfil ... */}

            <TouchableOpacity
                style={styles.deleteButton} // Crie esse estilo
                onPress={handleRequestDeletion}
            >
                <Text style={styles.deleteButtonText}>Deletar Conta</Text>
            </TouchableOpacity>
        </View>
    );
};

// ... estilos ...
const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) => StyleSheet.create({
    // ... seus estilos existentes ...
    deleteButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 30,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

2.3. Bloquear Login/Acesso para Contas Pendentes de Exclusão (e permitir cancelamento)
Quando o usuário tentar logar, você deve verificar o status isPendingDeletion.
Modifique seu AuthContext.tsx na função signIn:

// src/context/AuthContext.tsx

// ... imports e estados existentes ...
import { doc, getDoc } from 'firebase/firestore'; // Importe getDoc

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... estados e useEffects existentes ...

    const signIn = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    if (userData.isPendingDeletion) {
                        // Se a conta está pendente de exclusão, dê a opção de cancelar
                        const deletionDate = new Date(userData.deletionScheduledDate);
                        const now = new Date();

                        if (now < deletionDate) {
                            // Ainda está no período de 15 dias, perguntar se quer cancelar
                            Alert.alert(
                                "Conta Marcada para Exclusão",
                                `Sua conta está agendada para exclusão em ${deletionDate.toLocaleDateString()}. Deseja cancelar a exclusão e reativá-la?`,
                                [
                                    { text: "Não", style: "cancel", onPress: async () => {
                                        // Apenas fazer logout novamente para não dar acesso
                                        await auth.signOut();
                                        throw new Error("Conta agendada para exclusão.");
                                    }},
                                    { text: "Sim", onPress: async () => {
                                        await cancelAccountDeletionService(); // Chama a função para cancelar
                                        setUser(user); // Define o usuário logado
                                        Toast.show({
                                            type: 'success',
                                            text1: 'Exclusão Cancelada!',
                                            text2: 'Sua conta foi reativada.',
                                        });
                                    }},
                                ],
                                { cancelable: false }
                            );
                            // O ideal é não deixar o signIn completar aqui se o usuário não cancelar a exclusão
                            await auth.signOut(); // Garante que o usuário não fica logado automaticamente
                            throw new Error("Login bloqueado: conta pendente de exclusão.");
                        } else {
                            // Já passou o período de 15 dias, a conta deveria ter sido excluída
                            // Você pode alertar o usuário e impedir o login
                            await auth.signOut();
                            throw new Error("Esta conta deveria ter sido excluída. Entre em contato com o suporte.");
                        }
                    }
                }
                setUser(user);
            }
        } catch (error: any) {
            console.error("Erro no login:", error);
            throw error;
        }
    };
    // ... outras funções (signUp, logout, etc.) ...
};

Importante: Adicione cancelAccountDeletionService ao seu AuthContext.tsx se ela estiver lá, ou importe do userService.ts se a colocou separada.
