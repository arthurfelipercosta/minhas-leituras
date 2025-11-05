import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TitleListScreen from './src/screens/TitleListScreen';
import TitleDetailScreen from './src/screens/TitleDetailScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { colors } from './src/styles/colors';
import { ThemeToggleButton } from './src/components/ThemeToggleButton';
import Toast from 'react-native-toast-message';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import mobileAds, { AdsConsentStatus, AdsConsent } from 'react-native-google-mobile-ads';
import { AdBanner } from './src/components/adBanner';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
  TitleList: undefined;
  TitleDetail: { id?: string } | undefined;
  PrivacyPolicy: undefined;
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
          options={({ navigation }) => ({
            title: 'Minhas Leituras',
            headerRight: () => (<View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')} style={{ marginRight: 15 }}>
                <Ionicons name="information-circle-outline" size={24} color={themeColors.icon} />
              </TouchableOpacity>
              <ThemeToggleButton />
            </View>)
          })}
        />
        <Stack.Screen
          name="TitleDetail"
          component={TitleDetailScreen}
          options={({ route }) => ({
            title: route.params?.id ? 'Editar Título' : 'Novo Título',
          })}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'Política de Privacidade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [canShowAds, setCanShowAds] = useState(false);
  const [isConsentLoading, setIsConsentLoading] = useState(true);

  useEffect(() => {

    const checkConsentAndInitializeAds = async () => {
      try {
        await AdsConsent.requestInfoUpdate();
        await AdsConsent.loadAndShowConsentFormIfRequired();

        const consentInfo = await AdsConsent.getConsentInfo();

        const canRequestAds =
          consentInfo.status === AdsConsentStatus.OBTAINED ||
          consentInfo.status === AdsConsentStatus.NOT_REQUIRED;

        setCanShowAds(canRequestAds);

        if (canRequestAds) {
          await mobileAds().initialize();
        }
      } catch (error) {
        console.error("Erro no processo de consentimento de anúncios:", error);
        setCanShowAds(false);
      } finally {
        setIsConsentLoading(false);
      }
    };
    checkConsentAndInitializeAds();
  }, []);

  if (isConsentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
        <Text style={styles.loadingText}>Carregando configurações de privacidade...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          <AppNavigator />
        </View>
        {canShowAds &&
          <View style={styles.footer}>
            <AdBanner />
          </View>
        }
      </View>
      <Toast />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000020',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.light.text,
  },
});