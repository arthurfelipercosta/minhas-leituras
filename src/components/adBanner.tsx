import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

export const AdBanner = () => {
    return (
        <View style={{ alignItems: 'center' }}>
            <BannerAd
                unitId={TEST_BANNER_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
};