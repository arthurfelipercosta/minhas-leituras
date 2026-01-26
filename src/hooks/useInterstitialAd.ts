// src/hooks/useInterstitialAd.ts

// import de pacotes
import { useState, useEffect } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// import de arquivos
import { useSubscription } from '@/context/SubscriptionContext';

export const useInterstitialAd = () => {
    const { subscriptionPlan } = useSubscription();
    const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // IDs de teste do arquivo meus_ads.txt
    const interstitialAdUnitId = __DEV__
        ? TestIds.INTERSTITIAL  // ID de teste em desenvolvimento
        : 'ca-app-pub-7065910212630758/2921314718'; // ID real de produção

    useEffect(() => {
        // Só carrega anúncio se for usuário free
        if (subscriptionPlan === 'free') {
            const ad = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
                requestNonPersonalizedAdsOnly: true,
            });

            const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
                setIsLoaded(true);
            });

            const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
                setIsLoaded(false);
                // Recarrega o anúncio após fechar
                ad.load();
            });

            ad.load();
            setInterstitialAd(ad);

            return () => {
                unsubscribeLoaded();
                unsubscribeClosed();
            };
        } else {
            // Limpa anúncio se não for mais free
            setInterstitialAd(null);
            setIsLoaded(false);
        }
    }, [subscriptionPlan]);

    const showAd = () => {
        if (subscriptionPlan === 'free' && interstitialAd && isLoaded) {
            interstitialAd.show();
            return true; // Anúncio foi mostrado
        }
        return false; // Anúncio não foi mostrado (usuário premium ou não carregado)
    };

    return { showAd, isLoaded };
};