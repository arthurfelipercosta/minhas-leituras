import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const BANNER_ID = 'ca-app-pub-7065910212630758/3056454502'

export const AdBanner = () => {
    return (
        <View style={{ alignItems: 'center' }}>
            <BannerAd
                unitId={BANNER_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
};