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

import { ALVO_MINIMO, Tema } from '@/constants/tema';
import { useTema } from '@/data/preferencias';
import { useEstilos } from '@/hooks/use-estilos';
import { useDados } from '@/data/contexto';
import { idadeEm } from '@/data/tipos';

/** "31/12/1950" -> "1950-12-31"; devolve '' se a data não existir no calendário. */
function paraIso(texto: string): string {
  const m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  const [, dia, mes, ano] = m;
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const existe =
    d.getFullYear() === Number(ano) &&
    d.getMonth() === Number(mes) - 1 &&
    d.getDate() === Number(dia);
  return existe ? `${ano}-${mes}-${dia}` : '';
}

/** Caminho inverso, para preencher o campo ao editar. */
function paraTexto(iso: string): string {
  const m = (iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

export default function CadastroIdosoScreen() {
  const styles = useEstilos(criarEstilos);
  const tema = useTema();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { idosos, salvarIdoso } = useDados();

  const emEdicao = Boolean(id);
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Confere em voz alta o que a data significa, para evitar erro de digitação.
  const anosDigitados = idadeEm(paraIso(nascimento));
  const idadeTexto = anosDigitados === null ? '' : `${anosDigitados} anos`;

  // Em edição, carrega o cadastro existente nos campos.
  useEffect(() => {
    if (!id) return;
    const atual = idosos.find((i) => i.id === id);
    if (!atual) return;
    setNome(atual.nome);
    setNascimento(paraTexto(atual.nascimento));
    setResponsavel(atual.responsavel);
    setTelefoneResponsavel(atual.telefoneResponsavel ?? '');
  }, [id, idosos]);

  // Digita só os números; as barras entram sozinhas.
  const formatarData = (texto: string) => {
    const d = texto.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  };

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
    if (!nome.trim() || !nascimento.trim() || !responsavel.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const iso = paraIso(nascimento);
    if (!iso) {
      Alert.alert('Data inválida', 'Informe a data de nascimento no formato dia/mês/ano.');
      return;
    }

    const anos = idadeEm(iso);
    if (anos === null || anos < 1 || anos > 120) {
      Alert.alert('Data inválida', 'A data informada não corresponde a uma idade entre 1 e 120 anos.');
      return;
    }

    try {
      setSalvando(true);
      await salvarIdoso(
        {
          nome: nome.trim(),
          nascimento: iso,
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
          <Ionicons name="arrow-back" size={24} color={tema.cor.texto} />
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
            placeholderTextColor={tema.cor.apagado}
            accessibilityLabel="Nome do idoso"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            value={nascimento}
            onChangeText={(t) => setNascimento(formatarData(t))}
            placeholder="dia/mês/ano"
            placeholderTextColor={tema.cor.apagado}
            keyboardType="numeric"
            maxLength={10}
            accessibilityLabel="Data de nascimento"
          />
          {idadeTexto ? <Text style={styles.ajuda}>{idadeTexto}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do responsável</Text>
          <TextInput
            style={styles.input}
            value={responsavel}
            onChangeText={setResponsavel}
            placeholder="Digite o nome do responsável"
            placeholderTextColor={tema.cor.apagado}
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
            placeholderTextColor={tema.cor.apagado}
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

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.cor.fundo,
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
    minWidth: ALVO_MINIMO,
    minHeight: ALVO_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: t.fonte(28),
    fontWeight: '700',
    color: t.cor.texto,
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
    fontSize: t.fonte(16),
    fontWeight: '500',
    color: t.cor.texto,
    marginBottom: 4,
  },
  input: {
    backgroundColor: t.cor.superficie,
    borderWidth: 1,
    borderColor: t.cor.borda,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: t.fonte(16),
    color: t.cor.texto,
  },
  ajuda: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(13),
  },
  saveButton: {
    backgroundColor: t.cor.primaria,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: t.cor.primaria,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDesabilitado: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: t.cor.texto,
    fontSize: t.fonte(16),
    fontWeight: '600',
  },
});
