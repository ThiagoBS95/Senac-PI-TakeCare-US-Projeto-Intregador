/**
 * Botão de emergência alcançável de qualquer tela (eixo C, item C6).
 *
 * Fica flutuando sobre a navegação porque, na jornada do Antônio, o
 * acionamento acontece quando ele já está no chão: não pode depender de
 * encontrar o caminho de volta ao painel.
 */
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Tema } from '@/constants/tema';
import { useEstilos } from '@/hooks/use-estilos';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

/** Telas em que o botão atrapalharia em vez de ajudar. */
const OCULTO_EM = ['/emergencia', '/dose'];

export function BotaoSOS() {
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const caminho = usePathname();

  // No painel já existe o botão grande: dois seriam redundantes.
  if (OCULTO_EM.includes(caminho) || caminho === '/' || caminho === '/(tabs)') return null;

  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={() => router.push('/emergencia')}
      accessibilityRole="button"
      accessibilityLabel="Acionar alerta de emergência"
      accessibilityHint="Abre a tela de emergência com a localização e o contato do responsável">
      <Ionicons name="warning" size={22} color="#fff" />
      <Text style={styles.texto}>SOS</Text>
    </TouchableOpacity>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
  botao: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    minWidth: 64,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 16,
    backgroundColor: t.cor.perigo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    elevation: 10,
    shadowColor: t.cor.perigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  texto: {
    color: t.cor.texto,
    fontSize: t.fonte(12),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
