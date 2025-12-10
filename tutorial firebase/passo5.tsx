// ASSO 5: Criar tela de Login
// Arquivo: src/screens/LoginScreen.tsx

// src/screens/LoginScreen.tsx

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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

// import de arquivos
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/colors';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createStyles(theme, themeColors);

    const { signIn, signUp, resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Campos obrigatórios',
                text2: 'Preencha email e senha.',
            });
            return;
        }

        try {
            setIsLoading(true);
            await signIn(email.trim(), password);
            Toast.show({
                type: 'success',
                text1: 'Login realizado!',
                text2: 'Bem-vindo de volta!',
            });
            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro no login',
                text2: error.message || 'Email ou senha incorretos.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Campos obrigatórios',
                text2: 'Preencha todos os campos.',
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Senhas não coincidem',
                text2: 'As senhas devem ser iguais.',
            });
            return;
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Senha muito curta',
                text2: 'A senha deve ter pelo menos 6 caracteres.',
            });
            return;
        }

        try {
            setIsLoading(true);
            await signUp(email.trim(), password);
            Toast.show({
                type: 'success',
                text1: 'Conta criada!',
                text2: 'Bem-vindo!',
            });
            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro ao criar conta',
                text2: error.message || 'Não foi possível criar a conta.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Email obrigatório',
                text2: 'Digite seu email para recuperar a senha.',
            });
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(email.trim());
            Toast.show({
                type: 'success',
                text1: 'Email enviado!',
                text2: 'Verifique sua caixa de entrada.',
            });
            setShowResetPassword(false);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro ao enviar email',
                text2: error.message || 'Não foi possível enviar o email.',
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
                    <Text style={styles.title}>
                        {showResetPassword
                            ? 'Recuperar Senha'
                            : isLoginMode
                                ? 'Login'
                                : 'Criar Conta'}
                    </Text>

                    {!showResetPassword && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={themeColors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor={themeColors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password"
                            />

                            {!isLoginMode && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmar Senha"
                                    placeholderTextColor={themeColors.textSecondary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            )}

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={isLoginMode ? handleLogin : handleSignUp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        {isLoginMode ? 'Entrar' : 'Criar Conta'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setIsLoginMode(!isLoginMode)}
                                disabled={isLoading}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    {isLoginMode
                                        ? 'Não tem conta? Criar conta'
                                        : 'Já tem conta? Fazer login'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => setShowResetPassword(true)}
                                disabled={isLoading}
                            >
                                <Text style={styles.linkText}>Esqueci minha senha</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {showResetPassword && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={themeColors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Enviar Email</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => setShowResetPassword(false)}
                                disabled={isLoading}
                            >
                                <Text style={styles.linkText}>Voltar ao login</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
            marginBottom: 15,
        },
        primaryButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
        secondaryButton: {
            height: 50,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            borderWidth: 1,
            borderColor: themeColors.border,
        },
        secondaryButtonText: {
            color: themeColors.text,
            fontSize: 16,
        },
        linkButton: {
            padding: 10,
            alignItems: 'center',
        },
        linkText: {
            color: themeColors.primary,
            fontSize: 14,
        },
    });

export default LoginScreen;