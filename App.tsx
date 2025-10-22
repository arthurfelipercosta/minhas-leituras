import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TitleListScreen from './src/screens/TitleListScreen';
import TitleDetailScreen from './src/screens/TitleDetailScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { colors } from './src/styles/colors';
import { ThemeToggleButton } from './src/components/ThemeToggleButton';

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
      <Stack.Navigator initialRouteName="TitleList">
        <Stack.Screen
          name="TitleList"
          component={TitleListScreen}
          options={{
            title: 'Minhas Leituras',
            headerRight: () => <ThemeToggleButton />,
          }}
        />
        <Stack.Screen
          name="TitleDetail"
          component={TitleDetailScreen}
          options={({ route }) => ({
            title: route.params?.id ? 'Editar Título' : 'Novo Título',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}