// src/screens/ChangePasswordScreen.tsx

// import de pacotes
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// improt de arquivos
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';

const ChangePasswordScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    const { changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Campos obrigatórios',
                text2: 'Preencha todos os campos.',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Senhas não coincidem',
                text2: 'As novas senhas devem ser iguais.',
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Senha muito curta',
                text2: 'A senha deve ter pelo menos 6 caracteres.',
            });
            return;
        }

        try {
            setIsLoading(true);
            await changePassword(currentPassword, newPassword);
            Toast.show({
                type: 'success',
                text1: 'Senha alterada!',
                text2: 'Sua senha foi alterada com sucesso.',
            });
            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro ao alterar senha',
                text2: error.message || 'Não foi possível alterar a senha.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Trocar Senha</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Senha Atual"
                        placeholderTextColor={themeColors.textSecondary}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nova Senha"
                        placeholderTextColor={themeColors.textSecondary}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar Nova Senha"
                        placeholderTextColor={themeColors.textSecondary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Alterar Senha</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
        },
        formContainer: {
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: themeColors.text,
            marginBottom: 30,
            textAlign: 'center',
        },
        input: {
            height: 50,
            backgroundColor: themeColors.card,
            color: themeColors.text,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: themeColors.border,
            fontSize: 16,
        },
        primaryButton: {
            backgroundColor: themeColors.primary,
            height: 50,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
        },
        primaryButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

export default ChangePasswordScreen;