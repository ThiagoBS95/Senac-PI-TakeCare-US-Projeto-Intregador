import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDados } from '@/data/contexto';
import { Medicamento } from '@/data/tipos';

export default function MedicamentosScreen() {
  const router = useRouter();
  const { idosos, medicamentos, carregando, excluirMedicamento } = useDados();

  // Um grupo por pessoa idosa, para o cuidador saber de quem é cada remédio.
  const secoes = useMemo(
    () =>
      idosos.map((i) => ({
        title: i.nome,
        idosoId: i.id,
        data: medicamentos.filter((m) => m.idosoId === i.id),
      })),
    [idosos, medicamentos],
  );

  const confirmarExclusao = (medicamento: Medicamento) => {
    Alert.alert('Excluir medicamento', `Deseja excluir ${medicamento.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirMedicamento(medicamento.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Medicamentos</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#3B82F6" size="large" style={styles.centro} />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.secao}>{section.title}</Text>
          )}
          renderSectionFooter={({ section }) =>
            section.data.length === 0 ? (
              <Text style={styles.semItem}>Nenhum medicamento para esta pessoa.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTexto}>
                <Text style={styles.cardNome}>{item.nome}</Text>
                <Text style={styles.cardDetalhe}>{item.dosagem}</Text>
                <View style={styles.horarios}>
                  {item.horarios.map((h) => (
                    <View key={h} style={styles.horarioChip}>
                      <Ionicons name="time-outline" size={14} color="#93C5FD" />
                      <Text style={styles.horarioTexto}>{h}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.acoes}>
                <TouchableOpacity
                  style={[styles.acao, styles.acaoDose]}
                  onPress={() =>
                    router.push({
                      pathname: '/dose',
                      params: { medicamentoId: item.id, horario: item.horarios[0] ?? '' },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Registrar dose de ${item.nome}`}>
                  <Ionicons name="checkmark-done" size={22} color="#86EFAC" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acao}
                  onPress={() =>
                    router.push({ pathname: '/cadastro-medicamento', params: { id: item.id } })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.nome}`}>
                  <Ionicons name="create-outline" size={22} color="#93C5FD" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acao}
                  onPress={() => confirmarExclusao(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir ${item.nome}`}>
                  <Ionicons name="trash-outline" size={22} color="#FCA5A5" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="medkit-outline" size={48} color="#4B5563" />
              <Text style={styles.vazioTitulo}>Nenhum idoso cadastrado</Text>
              <Text style={styles.vazioTexto}>
                Cadastre uma pessoa idosa para registrar os medicamentos dela.
              </Text>
            </View>
          }
        />
      )}

      {idosos.length > 0 && (
        <TouchableOpacity
          style={styles.novo}
          onPress={() => router.push('/cadastro-medicamento')}
          accessibilityRole="button">
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.novoTexto}>Cadastrar medicamento</Text>
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centro: {
    marginTop: 60,
  },
  lista: {
    paddingBottom: 100,
  },
  secao: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  semItem: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTexto: {
    flex: 1,
    gap: 6,
  },
  cardNome: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cardDetalhe: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  horarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  horarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  horarioTexto: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '600',
  },
  acoes: {
    flexDirection: 'row',
    gap: 4,
  },
  acaoDose: {
    backgroundColor: '#064E3B',
  },
  acao: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
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
  novo: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 8,
  },
  novoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
