// src/screens/ProfileScreen.tsx

// import de pacotes
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Animated,
    Easing,
} from 'react-native';
// ... resto dos imports ...

const ProfileScreen: React.FC = () => {
    // ... código existente ...
    const { user, logout } = useAuth();
    const [isConnected, setIsConnected] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Animação de rotação
    const rotation = useRef(new Animated.Value(0)).current;

    // Verificar conexão
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false);
        });

        return () => unsubscribe();
    }, []);

    // Animação de rotação quando está sincronizando
    useEffect(() => {
        let animation: Animated.CompositeAnimation | null = null;

        if (isSyncing) {
            animation = Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            animation.start();
        } else {
            rotation.setValue(0);
            if (animation) {
                animation.stop();
            }
        }

        return () => {
            if (animation) {
                animation.stop();
            }
        };
    }, [isSyncing, rotation]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // ... resto do código (handleSync, handleChangePassword, handleLogout) ...

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <MaterialIcons name="account-circle" size={80} color={themeColors.primary} />
                </View>
                <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.actionsSection}>
                <TouchableOpacity
                    style={[styles.actionButton, !isConnected && styles.actionButtonDisabled]}
                    onPress={handleSync}
                    disabled={isSyncing || !isConnected}
                >
                    <View style={styles.actionButtonContent}>
                        <Animated.View
                            style={isSyncing ? { transform: [{ rotate: spin }] } : undefined}
                        >
                            <MaterialIcons
                                name="sync"
                                size={24}
                                color={themeColors.text}
                            />
                        </Animated.View>
                        <Text style={styles.actionButtonText}>
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* ... resto dos botões ... */}
            </View>
        </ScrollView>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        // ... estilos existentes ...
        // REMOVER o estilo syncIndicator, não é mais necessário
    });