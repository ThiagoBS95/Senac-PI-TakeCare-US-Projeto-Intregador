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

/** Aceita 8, 08, 8:0, 0800… e devolve HH:MM, ou null se não for hora válida. */
function normalizarHorario(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, '');
  if (digitos.length === 0 || digitos.length > 4) return null;

  const hora = Number(digitos.length <= 2 ? digitos : digitos.slice(0, digitos.length - 2));
  const minuto = digitos.length <= 2 ? 0 : Number(digitos.slice(-2));

  if (hora > 23 || minuto > 59) return null;
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

export default function CadastroMedicamentoScreen() {
  const router = useRouter();
  const { id, idosoId: idosoParam } = useLocalSearchParams<{ id?: string; idosoId?: string }>();
  const { idosos, medicamentos, salvarMedicamento } = useDados();

  const emEdicao = Boolean(id);
  const [idosoId, setIdosoId] = useState<string>(idosoParam ?? '');
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [horarios, setHorarios] = useState<string[]>([]);
  const [novoHorario, setNovoHorario] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) {
      // Com um único idoso cadastrado, já deixa selecionado.
      if (!idosoId && idosos.length === 1) setIdosoId(idosos[0].id);
      return;
    }
    const atual = medicamentos.find((m) => m.id === id);
    if (!atual) return;
    setIdosoId(atual.idosoId);
    setNome(atual.nome);
    setDosagem(atual.dosagem);
    setHorarios(atual.horarios);
  }, [id, medicamentos, idosos, idosoId]);

  const adicionarHorario = () => {
    const normalizado = normalizarHorario(novoHorario);
    if (!normalizado) {
      Alert.alert('Horário inválido', 'Informe a hora no formato 08:00.');
      return;
    }
    if (horarios.includes(normalizado)) {
      Alert.alert('Horário repetido', `${normalizado} já está na lista.`);
      return;
    }
    setHorarios([...horarios, normalizado].sort());
    setNovoHorario('');
  };

  const removerHorario = (h: string) => setHorarios(horarios.filter((x) => x !== h));

  const handleSalvar = async () => {
    if (!idosoId) {
      Alert.alert('Selecione o idoso', 'Escolha para quem é este medicamento.');
      return;
    }
    if (!nome.trim() || !dosagem.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (horarios.length === 0) {
      Alert.alert('Sem horário', 'Adicione pelo menos um horário para o lembrete.');
      return;
    }

    try {
      setSalvando(true);
      await salvarMedicamento(
        { idosoId, nome: nome.trim(), dosagem: dosagem.trim(), horarios },
        id,
      );
      Alert.alert(
        emEdicao ? 'Medicamento atualizado' : 'Medicamento cadastrado',
        emEdicao ? 'As alterações foram salvas.' : 'O medicamento foi registrado com sucesso.',
      );
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (idosos.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Cadastro de Medicamento</Text>
        </View>
        <View style={styles.vazio}>
          <Ionicons name="person-add-outline" size={48} color="#4B5563" />
          <Text style={styles.vazioTitulo}>Cadastre um idoso primeiro</Text>
          <Text style={styles.vazioTexto}>
            Todo medicamento pertence a uma pessoa idosa. Faça o cadastro dela para continuar.
          </Text>
          <TouchableOpacity
            style={styles.vazioBotao}
            onPress={() => router.replace('/cadastro-idoso')}>
            <Text style={styles.saveButtonText}>Cadastrar idoso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={styles.title}>
          {emEdicao ? 'Editar Medicamento' : 'Cadastro de Medicamento'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Para quem é</Text>
          <View style={styles.chips}>
            {idosos.map((i) => {
              const ativo = i.id === idosoId;
              return (
                <TouchableOpacity
                  key={i.id}
                  style={[styles.chip, ativo && styles.chipAtivo]}
                  onPress={() => setIdosoId(i.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}>
                  <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{i.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do medicamento</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome do medicamento"
            placeholderTextColor="#6B7280"
            accessibilityLabel="Nome do medicamento"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosagem</Text>
          <TextInput
            style={styles.input}
            value={dosagem}
            onChangeText={setDosagem}
            placeholder="Ex: 1 comprimido"
            placeholderTextColor="#6B7280"
            accessibilityLabel="Dosagem"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Horários</Text>
          <View style={styles.linhaHorario}>
            <TextInput
              style={[styles.input, styles.inputHorario]}
              value={novoHorario}
              onChangeText={setNovoHorario}
              placeholder="08:00"
              placeholderTextColor="#6B7280"
              keyboardType="numbers-and-punctuation"
              onSubmitEditing={adicionarHorario}
              accessibilityLabel="Novo horário"
            />
            <TouchableOpacity
              style={styles.adicionar}
              onPress={adicionarHorario}
              accessibilityRole="button"
              accessibilityLabel="Adicionar horário">
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {horarios.length > 0 && (
            <View style={styles.chips}>
              {horarios.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={styles.horarioChip}
                  onPress={() => removerHorario(h)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover horário ${h}`}>
                  <Text style={styles.horarioTexto}>{h}</Text>
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={styles.ajuda}>
            Um horário por dose do dia. Toque no horário para remover.
          </Text>
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
    fontSize: 26,
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
  linhaHorario: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inputHorario: {
    flex: 1,
  },
  adicionar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  chipAtivo: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipTexto: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  chipTextoAtivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  horarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  horarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  vazio: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
  },
  vazioTitulo: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '600',
  },
  vazioTexto: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  vazioBotao: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
