// PASSO 8: Adicionar SyncButton ao header
// Atualizar TitleListScreen.tsx para incluir o SyncButton no header:

// No useLayoutEffect do TitleListScreen.tsx, atualizar:

useLayoutEffect(() => {
    navigation.setOptions({
      title: ` Minhas leituras (${titles.length})`,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SyncButton />
          <ThemeToggleButton />
          <TouchableOpacity onPress={() => setMenu(true)} style={{ marginLeft: 15 }}>
            <Entypo name="dots-three-vertical" size={24} color={themeColors.icon} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, themeColors, titles.length]);

//   E adicionar o import:

  import { SyncButton } from '@/components/SyncButton';