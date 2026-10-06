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

import { useDados } from '@/data/contexto';
import { Idoso } from '@/data/tipos';

export default function IdososScreen() {
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
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cardDetalhe: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  acoes: {
    flexDirection: 'row',
    gap: 4,
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
    paddingHorizontal: 20,
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
