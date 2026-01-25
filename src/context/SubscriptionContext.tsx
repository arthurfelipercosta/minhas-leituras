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

interface SubscriptionContextType {
    isPremium: boolean;
    setIsPremium: (value: boolean) => Promise<void>;
    loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isPremium, setIsPremiumState] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscriptionStatus();
    }, []);

    const loadSubscriptionStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
            setIsPremiumState(value === 'true');
        } catch (error) {
            console.error('Erro ao carregar status de assinatura:', error);
        } finally {
            setLoading(false);
        }
    };

    const setIsPremium = async (value: boolean) => {
        try {
            await AsyncStorage.setItem(SUBSCRIPTION_KEY, value.toString());
            setIsPremiumState(value);
        } catch (error) {
            console.error('Erro ao salvar status de assinatura:', error);
        }
    };

    return (
        <SubscriptionContext.Provider value={{ isPremium, setIsPremium, loading }}>
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