import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useDados } from '@/data/contexto';
import * as notificacoes from '@/data/notificacoes';
import { Dose } from '@/data/tipos';

/**
 * Tela aberta pela notificação do lembrete. Registra o que aconteceu com a dose,
 * que é o que alimenta o histórico e, mais adiante, o indicador de adesão.
 */
export default function DoseScreen() {
  const router = useRouter();
  const { medicamentoId, horario } = useLocalSearchParams<{
    medicamentoId?: string;
    horario?: string;
  }>();
  const { medicamentos, idosos, registrarDose } = useDados();
  const [enviando, setEnviando] = useState(false);

  const medicamento = medicamentos.find((m) => m.id === medicamentoId);
  const idoso = idosos.find((i) => i.id === medicamento?.idosoId);

  const responder = async (situacao: Dose['situacao']) => {
    if (!medicamento) return;
    setEnviando(true);

    await registrarDose({
      medicamentoId: medicamento.id,
      idosoId: medicamento.idosoId,
      horarioPrevisto: horario ?? '',
      respondidoEm: new Date().toISOString(),
      situacao,
    });

    if (situacao === 'adiada') {
      await notificacoes.adiar(medicamento);
    }

    router.replace('/historico');
  };

  if (!medicamento) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.vazio}>
          <Ionicons name="help-circle-outline" size={48} color="#4B5563" />
          <Text style={styles.vazioTitulo}>Medicamento não encontrado</Text>
          <Text style={styles.vazioTexto}>
            O cadastro pode ter sido excluído depois que o lembrete foi criado.
          </Text>
          <TouchableOpacity style={styles.secundario} onPress={() => router.replace('/')}>
            <Text style={styles.secundarioTexto}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.cabecalho}>
        <View style={styles.selo}>
          <Ionicons name="alarm" size={28} color="#fff" />
        </View>
        <Text style={styles.horario}>{horario || 'Agora'}</Text>
        <Text style={styles.nome}>{medicamento.nome}</Text>
        <Text style={styles.detalhe}>{medicamento.dosagem}</Text>
        {idoso ? <Text style={styles.detalhe}>{idoso.nome}</Text> : null}
      </View>

      <View style={styles.acoes}>
        <TouchableOpacity
          style={[styles.botao, styles.tomou]}
          onPress={() => responder('tomada')}
          disabled={enviando}
          accessibilityRole="button">
          <Ionicons name="checkmark-circle" size={26} color="#fff" />
          <Text style={styles.botaoTexto}>Tomou</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.adiar]}
          onPress={() => responder('adiada')}
          disabled={enviando}
          accessibilityRole="button">
          <Ionicons name="time" size={26} color="#fff" />
          <Text style={styles.botaoTexto}>Adiar 15 minutos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.naoTomou]}
          onPress={() => responder('nao_tomada')}
          disabled={enviando}
          accessibilityRole="button">
          <Ionicons name="close-circle" size={26} color="#fff" />
          <Text style={styles.botaoTexto}>Não tomou</Text>
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
    paddingTop: 80,
  },
  cabecalho: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  selo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  horario: {
    color: '#93C5FD',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  nome: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  detalhe: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  acoes: {
    gap: 14,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: 16,
    elevation: 6,
  },
  tomou: {
    backgroundColor: '#16A34A',
  },
  adiar: {
    backgroundColor: '#334155',
  },
  naoTomou: {
    backgroundColor: '#B91C1C',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 80,
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
  secundario: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1F2937',
  },
  secundarioTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
