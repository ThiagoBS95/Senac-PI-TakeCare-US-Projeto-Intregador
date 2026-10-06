import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useDados } from '@/data/contexto';

export default function HomeScreen() {
  const router = useRouter();
  const { idosos, medicamentos, doses, carregando, lembretesAtivos, ativarLembretes } = useDados();

  const totalDoses = medicamentos.reduce((soma, m) => soma + m.horarios.length, 0);

  const handleAlertaSOS = () => {
    Alert.alert('Emergência acionada', 'O cuidador foi notificado.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>TakeCare</Text>
          <Text style={styles.subtitle}>Seu bem-estar em primeiro lugar</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  resumoRotulo: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  resumoDivisor: {
    width: 1,
    height: 32,
    backgroundColor: '#1F2937',
  },
  buttonContainer: {
    gap: 16,
  },
  modernButton: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
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
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '400',
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#78350F',
    borderRadius: 16,
    padding: 16,
  },
  avisoTitulo: {
    color: '#FCD34D',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  avisoTexto: {
    color: '#D6D3D1',
    fontSize: 13,
  },
  alertButton: {
    backgroundColor: '#DC2626',
    padding: 24,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#DC2626',
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
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 10,
  },
});
