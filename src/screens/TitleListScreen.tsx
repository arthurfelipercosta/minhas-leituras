// src/screens/TitleListScreen.tsx

// import de pacotes
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// import de arquivos
import { RootStackParamList } from 'App';

type TitleListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TitleList'>

const TitleListScreen: React.FC = () => {
    return (
        <View />
    )
}

export default TitleListScreen;