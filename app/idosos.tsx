import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ALVO_MINIMO, Tema } from '@/constants/tema';
import { useEstilos } from '@/hooks/use-estilos';
import { useDados } from '@/data/contexto';
import { Idoso } from '@/data/tipos';

export default function IdososScreen() {
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const { idosos, carregando, excluirIdoso, medicamentosDoIdoso } = useDados();

  const confirmarExclusao = (idoso: Idoso) => {
    const vinculados = medicamentosDoIdoso(idoso.id).length;
    const aviso = vinculados
      ? `\n\nOs ${vinculados} medicamento(s) cadastrados para ${idoso.nome} também serão excluídos.`
      : '';

    Alert.alert('Excluir cadastro', `Deseja excluir ${idoso.nome}?${aviso}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => excluirIdoso(idoso.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Idoso }) => {
    const quantosRemedios = medicamentosDoIdoso(item.id).length;
    return (
      <View style={styles.card}>
        <View style={styles.cardTexto}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <Text style={styles.cardDetalhe}>
            {item.idade} anos · responsável: {item.responsavel}
          </Text>
          <Text style={styles.cardDetalhe}>
            {quantosRemedios === 0
              ? 'Nenhum medicamento cadastrado'
              : `${quantosRemedios} medicamento(s)`}
          </Text>
        </View>

        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.acao}
            onPress={() => router.push({ pathname: '/cadastro-idoso', params: { id: item.id } })}
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
    );
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
        <Text style={styles.title}>Idosos cadastrados</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#3B82F6" size="large" style={styles.centro} />
      ) : (
        <FlatList
          data={idosos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="people-outline" size={48} color="#4B5563" />
              <Text style={styles.vazioTitulo}>Nenhum idoso cadastrado</Text>
              <Text style={styles.vazioTexto}>
                Cadastre a primeira pessoa para começar a registrar medicamentos.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.novo}
        onPress={() => router.push('/cadastro-idoso')}
        accessibilityRole="button">
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.novoTexto}>Cadastrar idoso</Text>
      </TouchableOpacity>
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
    flexShrink: 1,
  },
  centro: {
    marginTop: 60,
  },
  lista: {
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: t.cor.superficie,
    borderWidth: 1,
    borderColor: t.cor.borda,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTexto: {
    flex: 1,
    gap: 4,
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
  acoes: {
    flexDirection: 'row',
    gap: 4,
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
    paddingHorizontal: 20,
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
