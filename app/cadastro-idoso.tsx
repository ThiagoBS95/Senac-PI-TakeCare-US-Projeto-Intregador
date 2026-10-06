import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDados } from '@/data/contexto';

export default function CadastroIdosoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { idosos, salvarIdoso } = useDados();

  const emEdicao = Boolean(id);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Em edição, carrega o cadastro existente nos campos.
  useEffect(() => {
    if (!id) return;
    const atual = idosos.find((i) => i.id === id);
    if (!atual) return;
    setNome(atual.nome);
    setIdade(atual.idade);
    setResponsavel(atual.responsavel);
    setTelefoneResponsavel(atual.telefoneResponsavel ?? '');
  }, [id, idosos]);

  const formatarTelefone = (texto: string) => {
    const digitos = texto.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !idade.trim() || !responsavel.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const anos = Number(idade);
    if (!Number.isInteger(anos) || anos < 1 || anos > 120) {
      Alert.alert('Idade inválida', 'Informe a idade em anos, entre 1 e 120.');
      return;
    }

    try {
      setSalvando(true);
      await salvarIdoso(
        {
          nome: nome.trim(),
          idade: idade.trim(),
          responsavel: responsavel.trim(),
          telefoneResponsavel: telefoneResponsavel.trim(),
        },
        id,
      );
      Alert.alert('Sucesso', emEdicao ? 'Cadastro atualizado!' : 'Cadastro realizado com sucesso!');
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{emEdicao ? 'Editar Idoso' : 'Cadastro de Idoso'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do idoso</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome completo"
            placeholderTextColor="#6B7280"
            accessibilityLabel="Nome do idoso"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={styles.input}
            value={idade}
            onChangeText={(t) => setIdade(t.replace(/\D/g, '').slice(0, 3))}
            placeholder="Digite a idade"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            accessibilityLabel="Idade"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do responsável</Text>
          <TextInput
            style={styles.input}
            value={responsavel}
            onChangeText={setResponsavel}
            placeholder="Digite o nome do responsável"
            placeholderTextColor="#6B7280"
            accessibilityLabel="Nome do responsável"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone do responsável</Text>
          <TextInput
            style={styles.input}
            value={telefoneResponsavel}
            onChangeText={(t) => setTelefoneResponsavel(formatarTelefone(t))}
            placeholder="(11) 90000-0000"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            accessibilityLabel="Telefone do responsável"
          />
          <Text style={styles.ajuda}>Usado pelo alerta de emergência.</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, salvando && styles.saveButtonDesabilitado]}
          onPress={handleSalvar}
          disabled={salvando}
          accessibilityRole="button">
          <Text style={styles.saveButtonText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  form: {
    gap: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  ajuda: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDesabilitado: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
