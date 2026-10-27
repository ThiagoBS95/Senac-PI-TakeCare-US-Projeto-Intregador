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

import { ALVO_MINIMO, Tema } from '@/constants/tema';
import { useTema } from '@/data/preferencias';
import { useEstilos } from '@/hooks/use-estilos';
import { useDados } from '@/data/contexto';
import { Medicamento } from '@/data/tipos';

export default function MedicamentosScreen() {
  const styles = useEstilos(criarEstilos);
  const tema = useTema();
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
          <Ionicons name="arrow-back" size={24} color={tema.cor.texto} />
        </TouchableOpacity>
        <Text style={styles.title}>Medicamentos</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color={tema.cor.primaria} size="large" style={styles.centro} />
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
                      <Ionicons name="time-outline" size={14} color={tema.cor.destaque} />
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
                  <Ionicons name="checkmark-done" size={22} color={tema.cor.sucessoClaro} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acao}
                  onPress={() =>
                    router.push({ pathname: '/cadastro-medicamento', params: { id: item.id } })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.nome}`}>
                  <Ionicons name="create-outline" size={22} color={tema.cor.destaque} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acao}
                  onPress={() => confirmarExclusao(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir ${item.nome}`}>
                  <Ionicons name="trash-outline" size={22} color={tema.cor.perigoClaro} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="medkit-outline" size={48} color={tema.cor.apagado} />
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
          <Ionicons name="add" size={20} color={tema.cor.primariaTexto} />
          <Text style={styles.novoTexto}>Cadastrar medicamento</Text>
        </TouchableOpacity>
      )}
    </View>
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
    marginBottom: 24,
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
    fontSize: t.fonte(26),
    fontWeight: '700',
    color: t.cor.texto,
  },
  centro: {
    marginTop: 60,
  },
  lista: {
    paddingBottom: 100,
  },
  secao: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(13),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  semItem: {
    color: t.cor.apagado,
    fontSize: t.fonte(14),
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: t.cor.superficie,
    borderWidth: 1,
    borderColor: t.cor.borda,
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
    color: t.cor.texto,
    fontSize: t.fonte(18),
    fontWeight: '600',
  },
  cardDetalhe: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(14),
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
    backgroundColor: t.cor.superficieAlta,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  horarioTexto: {
    color: t.cor.destaque,
    fontSize: t.fonte(13),
    fontWeight: '600',
  },
  acoes: {
    flexDirection: 'row',
    gap: 4,
  },
  acaoDose: {
    backgroundColor: t.cor.sucessoFundo,
  },
  acao: {
    width: ALVO_MINIMO,
    height: ALVO_MINIMO,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.cor.superficieAlta,
  },
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 80,
  },
  vazioTitulo: {
    color: t.cor.textoMedio,
    fontSize: t.fonte(18),
    fontWeight: '600',
  },
  vazioTexto: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(14),
    textAlign: 'center',
  },
  novo: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: t.cor.primaria,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 8,
  },
  novoTexto: {
    color: t.cor.texto,
    fontSize: t.fonte(16),
    fontWeight: '600',
  },
});
