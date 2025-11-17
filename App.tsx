// App.tsx

// import de pacotes
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { StyleSheet, Text, View } from 'react-native';

// import de arquivos
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import TitleListScreen from '@/screens/TitleListScreen';
import TitleDetailScreen from '@/screens/TitleDetailScreen';
import { colors } from '@/styles/colors';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';


export type RootStackParamList = {
  TitleList: undefined;
  TitleDetail: { id?: string } | undefined;
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
      <Stack.Navigator initialRouteName='TitleList'>
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
