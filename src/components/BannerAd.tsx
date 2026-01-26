// src/components/BannerAd.tsx

// import de pacotes
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// import de arquivos
import { useSubscription } from '@/context/SubscriptionContext';

export const BannerAd = () => {
	const { subscriptionPlan } = useSubscription();

	// Só mostrar para usuários free
	if (subscriptionPlan !== 'free') {
		return null;
	}

	// IDs de teste
	const bannerAdUnitId = __DEV__
		? TestIds.BANNER                            // ID de teste
		: 'ca-app-pub-7065910212630758/3056454502'; // ID de produção

	return (
		<View style={styles.container}>
			<GoogleBannerAd
				unitId={bannerAdUnitId}
				size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
				requestOptions={{
					requestNonPersonalizedAdsOnly: true,
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 5,
	},
});