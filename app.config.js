import 'dotenv/config'

const IS_PROD = process.env.EXPO_PUBLIC_ENV === 'prod';

export default ({ config }) => ({
    ...config,
    plugins: [
        [
            'react-native-google-mobile-ads',
            {
                androidAppId: IS_PROD
                ? process.env.ADMOB_APP_ID_PROD
                : process.env.BANNER_TEST
            }
        ],
        'expo-font'
    ],
    extra: {
        
    }
})