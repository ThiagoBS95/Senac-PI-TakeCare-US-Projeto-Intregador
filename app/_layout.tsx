import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { BotaoSOS } from '@/components/botao-sos';
import { OuvinteNotificacoes } from '@/components/ouvinte-notificacoes';
import { ProvedorDados } from '@/data/contexto';
import { ProvedorPreferencias } from '@/data/preferencias';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProvedorPreferencias>
      <ProvedorDados>
      <OuvinteNotificacoes />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Cada tela traz o próprio cabeçalho: sem isso o nome da rota aparece duplicado. */}
          <Stack.Screen name="cadastro-idoso" options={{ headerShown: false }} />
          <Stack.Screen name="cadastro-medicamento" options={{ headerShown: false }} />
          <Stack.Screen name="idosos" options={{ headerShown: false }} />
          <Stack.Screen name="medicamentos" options={{ headerShown: false }} />
          <Stack.Screen name="historico" options={{ headerShown: false }} />
          <Stack.Screen name="dose" options={{ headerShown: false }} />
          <Stack.Screen name="ajustes" options={{ headerShown: false }} />
          <Stack.Screen name="emergencia" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
        <BotaoSOS />
        <StatusBar style="light" />
      </ThemeProvider>
      </ProvedorDados>
    </ProvedorPreferencias>
  );
}
