// PASSO 7: Atualizar App.tsx
// Adicionar AuthProvider e a rota de Login:

// App.tsx

// ... imports existentes ...
import { AuthProvider } from '@/context/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import ChangePasswordScreen from '@/screens/ChangePasswordScreen';

export type RootStackParamList = {
    TitleList: undefined;
    TitleDetail: { id?: string } | undefined;
    Settings: undefined;
    Statistics: undefined;
    Login: undefined;
    ChangePassword: undefined;
};

// ... resto do código ...

function AppNavigator() {
    // ... código existente ...

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator initialRouteName='TitleList' id={undefined}>
                {/* ... telas existentes ... */}
                <Stack.Screen
                    name='Login'
                    component={LoginScreen}
                    options={{
                        title: 'Login',
                        presentation: 'modal', // Opcional: abre como modal
                    }}
                />
                <Stack.Screen
                    name='ChangePassword'
                    component={ChangePasswordScreen}
                    options={{
                        title: 'Trocar Senha',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppNavigator />
                <Toast />
            </AuthProvider>
        </ThemeProvider>
    );
}