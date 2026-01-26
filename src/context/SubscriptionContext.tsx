// src/context/SubscriptionContext.tsx

// import de pacotes
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@MinhasLeituras:subscription';

type SubscriptionPlan = 'free' | 'monthly' | 'yearly'; // Novo tipo para os planos

interface SubscriptionContextType {
    subscriptionPlan: SubscriptionPlan; // Alterado de isPremium para subscriptionPlan
    setSubscriptionPlan: (plan: SubscriptionPlan) => Promise<void>; // Função para definir o plano
    loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [subscriptionPlan, setSubscriptionPlanState] = useState<SubscriptionPlan>('free'); // Estado inicial como 'free'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscriptionStatus();
    }, []);

    const loadSubscriptionStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
            // Garante que o valor lido seja um dos planos válidos, caso contrário, default para 'free'
            if (value === 'monthly' || value === 'yearly') {
                setSubscriptionPlanState(value);
            } else {
                setSubscriptionPlanState('free'); // Valor padrão se não for encontrado ou for inválido
            }
        } catch (error) {
            console.error('Erro ao carregar status de assinatura:', error);
        } finally {
            setLoading(false);
        }
    };

    const setSubscriptionPlan = async (plan: SubscriptionPlan) => { // Renomeado e tipo atualizado
        try {
            await AsyncStorage.setItem(SUBSCRIPTION_KEY, plan); // Armazena a string do plano
            setSubscriptionPlanState(plan);
        } catch (error) {
            console.error('Erro ao salvar status de assinatura:', error);
        }
    };

    return (
        <SubscriptionContext.Provider value={{ subscriptionPlan, setSubscriptionPlan, loading }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription deve ser usado dentro de SubscriptionProvider');
    }
    return context;
};