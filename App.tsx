// App.tsx

// import de pacotes
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

// import de arquivos
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { AuthProvider } from '@/context/AuthContext';

// import de páginas
import TitleListScreen from '@/screens/TitleListScreen';
import TitleDetailScreen from '@/screens/TitleDetailScreen';
import StatisticsScreen from '@/screens/StatisticsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
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

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: themeColors.background,
      text: themeColors.text,
      card: themeColors.card,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName='TitleList' id={undefined}>
        <Stack.Screen
          name='TitleList'
          component={TitleListScreen}
          options={{
            title: 'Minhas Leituras'
          }}
        />
        <Stack.Screen
          name='TitleDetail'
          component={TitleDetailScreen}
          options={{
            title: 'Detalhes do título',
            headerRight: () => <ThemeToggleButton />,
          }}
        />
        <Stack.Screen
          name='Settings'
          component={SettingsScreen}
          options={{
            title: 'Configurações',
            headerRight: () => <ThemeToggleButton />,
          }}
        />
        <Stack.Screen
          name='Statistics'
          component={StatisticsScreen}
          options={{
            title: 'Estatísticas',
            headerRight: () => <ThemeToggleButton />,
          }}
        />
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name='ChangePassword'
          component={ChangePasswordScreen}
          options={{
            title: 'Trocar Senha'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
