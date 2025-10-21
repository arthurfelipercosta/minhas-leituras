// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TitleListScreen from './src/screens/TitleListScreen';
import TitleDetailScreen from './src/screens/TitleDetailScreen'; // Vamos criar este arquivo em breve

// Definir os tipos para as rotas e seus parâmetros
export type RootStackParamList = {
  TitleList: undefined; // A tela de lista não receberá parâmetros inicialmente
  TitleDetail: { id?: string } | undefined; // A tela de detalhes pode receber um ID para edição
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TitleList">
        <Stack.Screen
          name="TitleList"
          component={TitleListScreen}
          options={{ title: 'Minhas Leituras' }}
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