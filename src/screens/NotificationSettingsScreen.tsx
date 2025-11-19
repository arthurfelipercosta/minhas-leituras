// src/screens/NotificationSettingsScreen.tsx

// import de pacotes
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native'; // TextInput removido
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

// import de arquivos
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/colors';
// getTitles não é mais importado diretamente aqui.

// --- Importe TUDO do seu novo serviço de notificação ---
import {
    NotificationPreferences,
    saveNotificationPreferences,
    getNotificationPreferences,
    scheduleAllReleaseNotifications,
    requestNotificationPermissions
} from '@/services/notificationService';


// --- Componente da tela de configurações ---
const NotificationSettingsScreen: React.FC = () => {
    const { theme } = useTheme();
    const themeColors = colors[theme];
    const styles = createSettingsStyles(theme, themeColors);
    const navigation = useNavigation();

    // Estados para as preferências ATUAIS (salvas)
    const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);

    // Estados para as preferências TEMPORÁRIAS (em edição)
    const [tempIsEnabled, setTempIsEnabled] = useState(false);
    const [tempDate, setTempDate] = useState(new Date(2000, 0, 1, 8, 0)); // Data arbitrária, importa apenas hora/minuto
    const [showPicker, setShowPicker] = useState(false);

    // Carrega as preferências salvas ao montar a tela
    useEffect(() => {
        async function loadPreferences() {
            const prefs = await getNotificationPreferences();
            setOriginalPreferences(prefs); // Salva as preferências originais
            setTempIsEnabled(prefs.enabled);
            const newDate = new Date(2000, 0, 1, prefs.hour, prefs.minute);
            setTempDate(newDate);
        }
        loadPreferences();
    }, []);

    // UseFocusEffect para pedir permissões e agendar ao focar na tela (garante que está atualizado)
    useFocusEffect(
        useCallback(() => {
            async function setupNotifications() {
                const prefs = await getNotificationPreferences();
                if (prefs.enabled) {
                    await requestNotificationPermissions();
                }
                // Aqui também agendamos/reagendamos em caso de mudanças externas
                await scheduleAllReleaseNotifications();
            }
            setupNotifications();
        }, [])
    );

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false); // Sempre fecha o picker após interação

        // Apenas atualiza a data/hora se o usuário de fato selecionou algo (e não cancelou)
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
                    // O Toast de permissão negada já é mostrado dentro de requestNotificationPermissions
                }
            } else {
                await Notifications.cancelAllScheduledNotificationsAsync();
                Toast.show({ type: 'info', text1: 'Notificações desativadas' });
            }
        } catch (error) {
            console.error("Erro ao salvar/agendar notificações:", error);
            Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: 'Houve um problema ao salvar as configurações.' });
        } finally {
            navigation.goBack(); // Volta para a tela anterior sempre, independentemente de erro
        }
    };


    const handleCancel = () => {
        // Reverter para as preferências originais (se existirem)
        if (originalPreferences) {
            setTempIsEnabled(originalPreferences.enabled);
            const newDate = new Date(2000, 0, 1, originalPreferences.hour, originalPreferences.minute);
            setTempDate(newDate);
        }
        navigation.goBack(); // Volta para a tela anterior
    };

    // Formata o horário para exibição
    const displayHour = tempDate.getHours().toString().padStart(2, '0');
    const displayMinute = tempDate.getMinutes().toString().padStart(2, '0');


    return (
        <View style={styles.container}>
            {/* Visual do Relógio (representado pelo picker, que pode ser invocado por um toque) */}
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
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' no iOS é mais visual
                        onChange={onTimeChange}
                    />
                )}
            </View>

            {/* Switch para Ativar/Desativar */}
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Receber Avisos Diários</Text>
                <Switch
                    onValueChange={setTempIsEnabled}
                    value={tempIsEnabled}
                    trackColor={{ false: themeColors.border, true: themeColors.primary }}
                    thumbColor={tempIsEnabled ? themeColors.primary : themeColors.text}
                />
            </View>

            {/* Botões de Confirmar e Cancelar */}
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
        </View>
    );
};

const createSettingsStyles = (theme: 'light' | 'dark', themeColors: typeof colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
            padding: 20,
        },
        clockPlaceholder: {
            height: 200, // Altura para o visual do relógio
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.card,
            borderRadius: 10,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: themeColors.border,
            overflow: 'hidden',
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

export default NotificationSettingsScreen;