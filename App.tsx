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
import TitleListScreen from '@/screens/TitleListScreen';
import TitleDetailScreen from '@/screens/TitleDetailScreen';
import StatisticsScreen from '@/screens/StatisticsScreen';
import NotificationSettingsScreen from '@/screens/NotificationSettingsScreen';


export type RootStackParamList = {
  TitleList: undefined;
  TitleDetail: { id?: string } | undefined;
  Notification: undefined;
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
          name='Notification'
          component={NotificationSettingsScreen}
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
      <Toast />
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
