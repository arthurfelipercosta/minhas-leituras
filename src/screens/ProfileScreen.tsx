// src/screens/ProfileScreen.tsx

// import de pacotes
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

// import de arquivos
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';
import { RootStackParamList } from 'App';
import { fullSync } from '@/services/syncService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    const { user, logout, loading } = useAuth();
    const [isConnected, setIsConnected] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Verificar conexão
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false);
        });

        return () => unsubscribe();
    }, []);

    const handleSync = async () => {
        if (!isConnected) {
            Toast.show({
                type: 'error',
                text1: 'Sem conexão',
                text2: 'Verifique sua conexão com a internet.',
            });
            return;
        }

        try {
            setIsSyncing(true);
            await fullSync();
            Toast.show({
                type: 'success',
                text1: 'Sincronização concluída!',
                text2: 'Seus dados foram sincronizados com sucesso.',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro na sincronização',
                text2: error.message || 'Não foi possível sincronizar.',
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword' as any);
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirmar Logout',
            'Tem certeza que deseja sair?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            Toast.show({
                                type: 'success',
                                text1: 'Logout realizado!',
                                text2: 'Até logo!',
                            });
                            navigation.goBack();
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erro ao fazer logout',
                                text2: error.message || 'Não foi possível fazer logout.',
                            });
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        if (!user && !loading) {
            // Se não estiver logado, redireciona para login
            navigation.navigate('Login' as any);
        }
    }, [loading, user, navigation])

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

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
                        <MaterialIcons
                            name={isSyncing ? 'sync' : 'sync'}
                            size={24}
                            color={themeColors.text}
                        />
                        <Text style={styles.actionButtonText}>
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                        </Text>
                        {isSyncing && (
                            <ActivityIndicator
                                size="small"
                                color={themeColors.primary}
                                style={styles.syncIndicator}
                            />
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleChangePassword}
                >
                    <View style={styles.actionButtonContent}>
                        <MaterialIcons name="lock" size={24} color={themeColors.text} />
                        <Text style={styles.actionButtonText}>Trocar Senha</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <View style={styles.actionButtonContent}>
                        <MaterialIcons name="logout" size={24} color="#FF5252" />
                        <Text style={[styles.actionButtonText, styles.logoutText]}>Sair</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        content: {
            padding: 20,
        },
        profileSection: {
            alignItems: 'center',
            paddingVertical: 30,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
            marginBottom: 20,
        },
        avatarContainer: {
            marginBottom: 15,
        },
        email: {
            fontSize: 18,
            color: themeColors.text,
            fontWeight: '500',
        },
        actionsSection: {
            gap: 15,
        },
        actionButton: {
            backgroundColor: themeColors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: themeColors.border,
        },
        actionButtonDisabled: {
            opacity: 0.5,
        },
        actionButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
        },
        actionButtonText: {
            fontSize: 16,
            color: themeColors.text,
            flex: 1,
        },
        syncIndicator: {
            marginLeft: 'auto',
        },
        logoutButton: {
            marginTop: 10,
            borderColor: '#FF5252',
        },
        logoutText: {
            color: '#FF5252',
        },
    });

export default ProfileScreen;