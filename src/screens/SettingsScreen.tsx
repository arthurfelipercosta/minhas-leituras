// src/screens/SettingsScreen.tsx

// import de pacotes
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import SwitchSelector from 'react-native-switch-selector';

// import de arquivos
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';
import { getSettings, saveSettings, TapAction, UserSettings } from '@/services/storageServices';

import {
    NotificationPreferences,
    saveNotificationPreferences,
    getNotificationPreferences,
    scheduleAllReleaseNotifications,
    requestNotificationPermissions
} from '@/services/notificationService';


const SettingsScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    
    const themeColors = colors[theme];
    const styles = createSettingsStyles(theme, themeColors);

    const [configs, setConfigs] = useState<UserSettings | null>(null);
    const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);
    const [tempIsEnabled, setTempIsEnabled] = useState(false);
    const [tempDate, setTempDate] = useState(new Date(2000, 0, 1, 8, 0));
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        getSettings().then(setConfigs);
    }, []);

    useEffect(() => {
        async function loadPreferences() {
            const prefs = await getNotificationPreferences();
            setOriginalPreferences(prefs);
            setTempIsEnabled(prefs.enabled);
            const newDate = new Date(2000, 0, 1, prefs.hour, prefs.minute);
            setTempDate(newDate);
        }
        loadPreferences();
    }, []);

    useFocusEffect(
        useCallback(() => {
            async function setupNotifications() {
                const prefs = await getNotificationPreferences();
                if (prefs.enabled) {
                    await requestNotificationPermissions();
                }
                await scheduleAllReleaseNotifications();
            }
            setupNotifications();
        }, [])
    );

    if (!configs) {
        return <View style={styles.container} />;
    }

    const tapOptions = [
        { label: 'Abrir Página', value: 'edit' },
        { label: 'Abrir Link', value: 'open_url' },
        { label: 'Copiar Link', value: 'copy_url' },
    ];

    const handleSettingsChange = (key: keyof UserSettings, value: TapAction) => {
        const newConfigs = { ...configs, [key]: value };
        setConfigs(newConfigs);
        saveSettings(newConfigs);
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleConfirm = async () => {
        try {
            const hourToSave = tempDate.getHours();
            const minuteToSave = tempDate.getMinutes();

            const newPreferences: NotificationPreferences = {
                enabled: tempIsEnabled,
                hour: hourToSave,
                minute: minuteToSave,
            };

            await saveNotificationPreferences(newPreferences);
            setOriginalPreferences(newPreferences);

            if (newPreferences.enabled) {
                const granted = await requestNotificationPermissions();
                if (granted) {
                    await scheduleAllReleaseNotifications();
                    Toast.show({ type: 'success', text1: 'Configurações salvas!', text2: 'Suas notificações estão prontas.' });
                } else {
                    setTempIsEnabled(false);
                    await saveNotificationPreferences({ ...newPreferences, enabled: false });
                    await scheduleAllReleaseNotifications();
                }
            } else {
                await Notifications.cancelAllScheduledNotificationsAsync();
                Toast.show({ type: 'info', text1: 'Notificações desativadas' });
            }
        } catch (error) {
            console.error("Erro ao salvar/agendar notificações:", error);
            Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: 'Houve um problema ao salvar as configurações.' });
        } finally {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        if (originalPreferences) {
            setTempIsEnabled(originalPreferences.enabled);
            const newDate = new Date(2000, 0, 1, originalPreferences.hour, originalPreferences.minute);
            setTempDate(newDate);
        }
        navigation.goBack();
    };

    const displayHour = tempDate.getHours().toString().padStart(2, '0');
    const displayMinute = tempDate.getMinutes().toString().padStart(2, '0');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.card}>
                <Text style={styles.title}>Interação com Títulos</Text>

                <Text style={styles.label}>Toque Curto</Text>
                <SwitchSelector
                    options={tapOptions}
                    initial={tapOptions.findIndex(opt => opt.value === configs.shortTapAction)}
                    onPress={(value) => handleSettingsChange('shortTapAction', value as TapAction)}
                    buttonColor={themeColors.primary}
                    backgroundColor={themeColors.background}
                    textColor={themeColors.text}
                    style={{ marginBottom: 20 }}
                />

                <Text style={styles.label}>Toque Longo (Segurar)</Text>
                <SwitchSelector
                    options={tapOptions}
                    initial={tapOptions.findIndex(opt => opt.value === configs.longPressAction)}
                    onPress={(value) => handleSettingsChange('longPressAction', value as TapAction)}
                    buttonColor={themeColors.primary}
                    backgroundColor={themeColors.background}
                    textColor={themeColors.text}
                />
            </View>

            <View style={styles.clockPlaceholder}>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeDisplayWrapper}>
                    <Text style={styles.timeDisplayText}>{displayHour}</Text>
                    <Text style={styles.timeDisplayText}>:</Text>
                    <Text style={styles.timeDisplayText}>{displayMinute}</Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        testID="timePicker"
                        value={tempDate}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                    />
                )}
            </View>

            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Receber Avisos Diários</Text>
                <Switch
                    onValueChange={setTempIsEnabled}
                    value={tempIsEnabled}
                    trackColor={{ false: themeColors.border, true: themeColors.primary }}
                    thumbColor={tempIsEnabled ? themeColors.primary : themeColors.text}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                    <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.infoText}>
                Você receberá uma notificação consolidada nos dias de lançamento, no horário selecionado.
            </Text>
        </ScrollView>
    );
};

const createSettingsStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
            padding: 20,
        },
        contentContainer: {
            padding: 15,
        },
        card: {
            backgroundColor: themeColors.card,
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: themeColors.text,
            marginBottom: 20,
        },
        clockPlaceholder: {
            height: 200,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.card,
            borderRadius: 10,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: themeColors.border,
            overflow: 'hidden',
        },
        label: {
            fontSize: 16,
            color: themeColors.textSecondary,
            marginBottom: 10,
        },
        timeDisplayWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
        },
        timeDisplayText: {
            fontSize: 60,
            fontWeight: 'bold',
            color: themeColors.primary,
        },
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
        },
        settingLabel: {
            fontSize: 18,
            color: themeColors.text,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 30,
            marginBottom: 20,
        },
        button: {
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 25,
            minWidth: 120,
            alignItems: 'center',
        },
        confirmButton: {
            backgroundColor: themeColors.primary,
        },
        cancelButton: {
            backgroundColor: themeColors.border,
        },
        buttonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
        infoText: {
            fontSize: 14,
            color: themeColors.textSecondary,
            textAlign: 'center',
            marginTop: 20,
        },
    });

export default SettingsScreen;