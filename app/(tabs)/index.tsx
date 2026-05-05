import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleCadastroIdoso = () => {
    router.push('/cadastro-idoso');
  };

  const handleCadastroMedicamento = () => {
    router.push('/cadastro-medicamento');
  };

  const handleAlertaSOS = () => {
    Alert.alert('Emergência acionada', 'O cuidador foi notificado.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>TakeCare</Text>
        <Text style={styles.subtitle}>Seu bem-estar em primeiro lugar</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.modernButton} onPress={handleCadastroIdoso}>
          <View style={styles.buttonIcon}>
            <Ionicons name="person-add" size={24} color="#fff" />
          </View>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>Cadastro de Idoso</Text>
            <Text style={styles.buttonDescription}>Adicionar perfil de idoso</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modernButton} onPress={handleCadastroMedicamento}>
          <View style={styles.buttonIcon}>
            <Ionicons name="medkit" size={24} color="#fff" />
          </View>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>Cadastro de Medicamento</Text>
            <Text style={styles.buttonDescription}>Gerenciar medicamentos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.alertButton} onPress={handleAlertaSOS}>
          <View style={styles.alertContent}>
            <Ionicons name="warning" size={28} color="#fff" />
            <Text style={styles.alertText}>ALERTA SOS</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
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
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
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
  alertButton: {
    backgroundColor: '#DC2626',
    padding: 24,
    borderRadius: 20,
    marginTop: 20,
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
  },
});
