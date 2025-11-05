// src/screens/PrivacyPolicyScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal, Button } from 'react-native';
import { AdsConsent } from 'react-native-google-mobile-ads';
import Toast from 'react-native-toast-message';

export const PrivacyPolicyScreen = () => {
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const handleRevokeConsent = async () => {
        try {
            // Abre o formulário de opções de privacidade para o usuário alterar o consentimento
            await AdsConsent.showPrivacyOptionsForm();
            Toast.show({
                type: 'success',
                text1: 'Consentimento',
                text2: 'Suas opções de privacidade foram atualizadas.'
            });
        } catch (error: any) {
            // Verifica se o erro é o específico de "formulário não requerido"
            if (error.message.includes('Privacy options form is not required.')) {
                // Não loga este erro no console, pois ele é tratado pelo modal
                setIsInfoModalVisible(true);
            } else {
                // Loga outros erros no console
                console.error("Erro ao mostrar formulário de opções de privacidade:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Erro',
                    text2: 'Não foi possível abrir o formulário de privacidade. Tente novamente mais tarde.'
                });
            }
        }
    };
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Política de Privacidade</Text>
                <Text style={styles.paragraph}>
                    Sua privacidade é importante para nós. Esta política de privacidade descreve como coletamos, usamos e protegemos suas informações.
                </Text>
                <Text style={styles.heading}>1. Coleta e Uso de Informações</Text>
                <Text style={styles.paragraph}>
                    Não coletamos informações de identificação pessoal diretamente de você enquanto usa este aplicativo.
                </Text>
                <Text style={styles.paragraph}>
                    Para fins de publicidade, este aplicativo utiliza o Google AdMob. O AdMob pode coletar e usar dados, incluindo o identificador de publicidade do seu dispositivo, para exibir anúncios relevantes. Para mais informações sobre como o Google coleta e usa dados em serviços de publicidade, visite a Política de Privacidade e Termos do Google.
                </Text>
                <Text style={styles.heading}>2. Cookies e Tecnologias Semelhantes</Text>
                <Text style={styles.paragraph}>
                    O Google AdMob pode usar cookies e tecnologias de rastreamento para coletar dados sobre o uso do aplicativo e exibir anúncios
                    personalizados. Você pode gerenciar suas preferências de anúncios através das configurações do seu dispositivo ou visitando [link para sua página de gerenciamento de consentimento AdMob, se tiver].
                </Text>
                <Text style={styles.heading}>3. Links para Terceiros</Text>
                <Text style={styles.paragraph}>
                    Nosso aplicativo pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade desses sites.
                </Text>
                <Text style={styles.heading}>4. Alterações a Esta Política</Text>
                <Text style={styles.paragraph}>
                    Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.
                </Text>
                {/* NOVO: Seção para Gerenciar Consentimento */}
                <Text style={styles.heading}>Gerenciar Consentimento</Text>
                <Text style={styles.paragraph}>
                    Você pode alterar suas preferências de consentimento a qualquer momento clicando no botão abaixo.
                </Text>
                <TouchableOpacity style={styles.revokeButton} onPress={handleRevokeConsent}>
                    <Text style={styles.revokeButtonText}>Revisar opções de privacidade</Text>
                </TouchableOpacity>

                <Text style={styles.paragraph}>
                    Última atualização: 03/11/2025
                </Text>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isInfoModalVisible}
                onRequestClose={() => setIsInfoModalVisible(false)} // Para Android, permite fechar com o botão voltar
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Informação de Privacidade</Text>
                        <Text style={styles.modalText}>
                            No momento, não é necessário exibir um formulário de opções de privacidade para sua localização atual, de acordo com as regulamentações do Google. Se você estiver em uma área como a Europa ou Califórnia, o formulário seria exibido.
                        </Text>
                        <TouchableOpacity
                            style={styles.revokeButton}
                            onPress={() => setIsInfoModalVisible(false)}>
                            <Text style={styles.revokeButtonText}>Entendi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 80,
        backgroundColor: '#fff', // Ou a cor de fundo do seu tema
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 24,
    },
    revokeButton: {
        backgroundColor: '#007AFF', // Cor azul padrão
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    revokeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escuro semi-transparente
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
    },
});

export default PrivacyPolicyScreen;