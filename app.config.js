import 'dotenv/config'

export default ({ config }) => ({
    ...config,
    plugins: [
        [
            'react-native-google-mobile-ads',
            {
                // androidAppId: 'ca-app-pub-3940256099942544~3347511713'      //Test
                androidAppId: 'ca-app-pub-7065910212630758~6660657596'   //Prod
            }
        ],
        'expo-font'
    ],
    extra: {
        // admobBannerUnitId: 'ca-app-pub-3940256099942544/6300978111'     //Test
        admobBannerUnitId: 'ca-app-pub-7065910212630758/3056454502'  //Prod
    }
})