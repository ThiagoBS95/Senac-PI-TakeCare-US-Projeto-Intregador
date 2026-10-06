import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ALVO_MINIMO, Tema } from '@/constants/tema';
import { useEstilos } from '@/hooks/use-estilos';
import { useDados } from '@/data/contexto';
import { useTema } from '@/data/preferencias';

export default function HomeScreen() {
  const styles = useEstilos(criarEstilos);
  const tema = useTema();
  const router = useRouter();
  const { idosos, medicamentos, doses, carregando, lembretesAtivos, ativarLembretes } = useDados();

  const totalDoses = medicamentos.reduce((soma, m) => soma + m.horarios.length, 0);

  const handleAlertaSOS = () => {
    router.push('/emergencia');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>TakeCare</Text>
          <Text style={styles.subtitle}>Seu bem-estar em primeiro lugar</Text>
          <TouchableOpacity
            style={styles.ajustes}
            onPress={() => router.push('/ajustes')}
            accessibilityRole="button"
            accessibilityLabel="Acessibilidade: tamanho do texto e contraste">
            <Ionicons name="text" size={18} color={tema.cor.destaque} />
            <Text style={styles.ajustesTexto}>Acessibilidade</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resumo}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNumero}>{carregando ? '—' : idosos.length}</Text>
            <Text style={styles.resumoRotulo}>
              {idosos.length === 1 ? 'idoso' : 'idosos'}
            </Text>
          </View>
          <View style={styles.resumoDivisor} />
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNumero}>{carregando ? '—' : medicamentos.length}</Text>
            <Text style={styles.resumoRotulo}>
              {medicamentos.length === 1 ? 'medicamento' : 'medicamentos'}
            </Text>
          </View>
          <View style={styles.resumoDivisor} />
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNumero}>{carregando ? '—' : totalDoses}</Text>
            <Text style={styles.resumoRotulo}>doses por dia</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.modernButton}
            onPress={() => router.push('/idosos')}
            accessibilityRole="button">
            <View style={styles.buttonIcon}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Idosos</Text>
              <Text style={styles.buttonDescription}>
                {idosos.length === 0 ? 'Cadastrar o primeiro perfil' : 'Ver, editar e cadastrar'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modernButton}
            onPress={() => router.push('/medicamentos')}
            accessibilityRole="button">
            <View style={styles.buttonIcon}>
              <Ionicons name="medkit" size={24} color="#fff" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Medicamentos</Text>
              <Text style={styles.buttonDescription}>Horários, dosagem e lembretes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modernButton}
            onPress={() => router.push('/historico')}
            accessibilityRole="button">
            <View style={styles.buttonIcon}>
              <Ionicons name="document-text" size={24} color="#fff" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Histórico</Text>
              <Text style={styles.buttonDescription}>
                {doses.length === 0 ? 'Nenhuma dose registrada' : `${doses.length} dose(s) registradas`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {lembretesAtivos === false && medicamentos.length > 0 && (
            <TouchableOpacity
              style={styles.aviso}
              onPress={ativarLembretes}
              accessibilityRole="button">
              <Ionicons name="notifications-off" size={22} color="#FCD34D" />
              <View style={styles.buttonContent}>
                <Text style={styles.avisoTitulo}>Lembretes desativados</Text>
                <Text style={styles.avisoTexto}>
                  Toque para permitir as notificações e receber os horários.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.alertButton}
            onPress={handleAlertaSOS}
            accessibilityRole="button"
            accessibilityLabel="Acionar alerta de emergência">
            <View style={styles.alertContent}>
              <Ionicons name="warning" size={28} color="#fff" />
              <Text style={styles.alertText}>ALERTA SOS</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.cor.fundo,
  },
  conteudo: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: t.fonte(42),
    fontWeight: '800',
    color: t.cor.texto,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  ajustes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: ALVO_MINIMO,
    borderRadius: 999,
    borderWidth: t.borda,
    borderColor: t.cor.borda,
    backgroundColor: t.cor.superficieAlta,
  },
  ajustesTexto: {
    color: t.cor.destaque,
    fontSize: t.fonte(14),
    fontWeight: '600',
  },
  subtitle: {
    fontSize: t.fonte(16),
    color: t.cor.textoFraco,
    textAlign: 'center',
    fontWeight: '400',
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.cor.superficieAlta,
    borderWidth: 1,
    borderColor: t.cor.superficie,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  resumoNumero: {
    color: t.cor.texto,
    fontSize: t.fonte(24),
    fontWeight: '700',
  },
  resumoRotulo: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(12),
    textAlign: 'center',
  },
  resumoDivisor: {
    width: 1,
    height: 32,
    backgroundColor: t.cor.superficie,
  },
  buttonContainer: {
    gap: 16,
  },
  modernButton: {
    backgroundColor: t.cor.superficie,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.cor.borda,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: t.cor.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    color: t.cor.texto,
    fontSize: t.fonte(18),
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonDescription: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(14),
    fontWeight: '400',
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: t.cor.avisoFundo,
    borderWidth: 1,
    borderColor: t.cor.avisoBorda,
    borderRadius: 16,
    padding: 16,
  },
  avisoTitulo: {
    color: t.cor.aviso,
    fontSize: t.fonte(16),
    fontWeight: '600',
    marginBottom: 2,
  },
  avisoTexto: {
    color: t.cor.textoMedio,
    fontSize: t.fonte(13),
  },
  alertButton: {
    backgroundColor: t.cor.perigo,
    padding: 24,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: t.cor.perigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    color: t.cor.texto,
    fontSize: t.fonte(17),
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 10,
  },
});
