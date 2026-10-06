import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ALVO_MINIMO, Tema } from '@/constants/tema';
import { useEstilos } from '@/hooks/use-estilos';
import { useDados } from '@/data/contexto';
import { Dose } from '@/data/tipos';

const ROTULO: Record<Dose['situacao'], { texto: string; cor: string; icone: keyof typeof Ionicons.glyphMap }> = {
  tomada: { texto: 'Tomada', cor: '#16A34A', icone: 'checkmark-circle' },
  adiada: { texto: 'Adiada', cor: '#CA8A04', icone: 'time' },
  nao_tomada: { texto: 'Não tomada', cor: '#DC2626', icone: 'close-circle' },
};

function diaDe(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
}

function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoricoScreen() {
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const { doses, alertas, medicamentos, idosos } = useDados();
  const [filtroIdoso, setFiltroIdoso] = useState<string | null>(null);
  const [aba, setAba] = useState<'doses' | 'emergencias'>('doses');

  const secoes = useMemo(() => {
    const filtradas = filtroIdoso ? doses.filter((d) => d.idosoId === filtroIdoso) : doses;
    const porDia = new Map<string, Dose[]>();

    [...filtradas]
      .sort((a, b) => b.respondidoEm.localeCompare(a.respondidoEm))
      .forEach((dose) => {
        const dia = diaDe(dose.respondidoEm);
        porDia.set(dia, [...(porDia.get(dia) ?? []), dose]);
      });

    return Array.from(porDia, ([title, data]) => ({ title, data }));
  }, [doses, filtroIdoso]);

  const totalTomadas = doses.filter((d) => d.situacao === 'tomada').length;
  const adesao = doses.length ? Math.round((totalTomadas / doses.length) * 100) : null;

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
        <Text style={styles.title}>Histórico de doses</Text>
      </View>

      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.aba, aba === 'doses' && styles.abaAtiva]}
          onPress={() => setAba('doses')}
          accessibilityRole="button">
          <Text style={[styles.abaTexto, aba === 'doses' && styles.abaTextoAtivo]}>
            Doses ({doses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, aba === 'emergencias' && styles.abaAtiva]}
          onPress={() => setAba('emergencias')}
          accessibilityRole="button">
          <Text style={[styles.abaTexto, aba === 'emergencias' && styles.abaTextoAtivo]}>
            Emergências ({alertas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {aba === 'emergencias' ? (
        <SectionList
          sections={[{ title: 'Acionamentos', data: [...alertas].reverse() }]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={() => null}
          renderItem={({ item }) => {
            const idoso = idosos.find((i) => i.id === item.idosoId);
            const temLocal = item.latitude !== null && item.longitude !== null;
            return (
              <View style={styles.card}>
                <Ionicons name="warning" size={24} color="#DC2626" />
                <View style={styles.cardTexto}>
                  <Text style={styles.cardNome}>
                    {new Date(item.acionadoEm).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {idoso ? <Text style={styles.cardDetalhe}>{idoso.nome}</Text> : null}
                  <Text style={styles.cardDetalhe}>
                    {temLocal
                      ? `Localização: ${item.latitude!.toFixed(5)}, ${item.longitude!.toFixed(5)}`
                      : item.observacaoLocalizacao ?? 'Sem localização'}
                  </Text>
                  <Text style={styles.cardDetalhe}>
                    {item.acoes.length === 0
                      ? 'Nenhuma ação registrada'
                      : `Ações: ${item.acoes.join(', ')}`}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="shield-checkmark-outline" size={48} color="#4B5563" />
              <Text style={styles.vazioTitulo}>Nenhum acionamento</Text>
              <Text style={styles.vazioTexto}>
                Os alertas de emergência acionados aparecem aqui.
              </Text>
            </View>
          }
        />
      ) : (
      <>
      {doses.length > 0 && (
        <View style={styles.resumo}>
          <Text style={styles.resumoNumero}>{adesao}%</Text>
          <Text style={styles.resumoTexto}>
            das {doses.length} dose(s) registradas foram confirmadas
          </Text>
        </View>
      )}

      {idosos.length > 1 && (
        <View style={styles.filtros}>
          <TouchableOpacity
            style={[styles.filtro, !filtroIdoso && styles.filtroAtivo]}
            onPress={() => setFiltroIdoso(null)}>
            <Text style={[styles.filtroTexto, !filtroIdoso && styles.filtroTextoAtivo]}>Todos</Text>
          </TouchableOpacity>
          {idosos.map((i) => (
            <TouchableOpacity
              key={i.id}
              style={[styles.filtro, filtroIdoso === i.id && styles.filtroAtivo]}
              onPress={() => setFiltroIdoso(i.id)}>
              <Text
                style={[styles.filtroTexto, filtroIdoso === i.id && styles.filtroTextoAtivo]}>
                {i.nome.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <SectionList
        sections={secoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.dia}>{section.title}</Text>}
        renderItem={({ item }) => {
          const medicamento = medicamentos.find((m) => m.id === item.medicamentoId);
          const idoso = idosos.find((i) => i.id === item.idosoId);
          const rotulo = ROTULO[item.situacao];
          return (
            <View style={styles.card}>
              <Ionicons name={rotulo.icone} size={24} color={rotulo.cor} />
              <View style={styles.cardTexto}>
                <Text style={styles.cardNome}>
                  {medicamento?.nome ?? 'Medicamento excluído'}
                </Text>
                <Text style={styles.cardDetalhe}>
                  {rotulo.texto} às {horaDe(item.respondidoEm)}
                  {item.horarioPrevisto ? ` · previsto ${item.horarioPrevisto}` : ''}
                </Text>
                {idoso ? <Text style={styles.cardDetalhe}>{idoso.nome}</Text> : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="document-text-outline" size={48} color="#4B5563" />
            <Text style={styles.vazioTitulo}>Nenhuma dose registrada</Text>
            <Text style={styles.vazioTexto}>
              Quando um lembrete for respondido, o registro aparece aqui.
            </Text>
          </View>
        }
      />
      </>
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
    marginBottom: 20,
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
  abas: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: t.cor.superficieAlta,
    borderWidth: 1,
    borderColor: t.cor.superficie,
  },
  abaAtiva: {
    backgroundColor: t.cor.superficie,
    borderColor: t.cor.primaria,
  },
  abaTexto: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(14),
    fontWeight: '600',
  },
  abaTextoAtivo: {
    color: t.cor.texto,
  },
  resumo: {
    backgroundColor: t.cor.superficieAlta,
    borderWidth: 1,
    borderColor: t.cor.superficie,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  resumoNumero: {
    color: t.cor.sucesso,
    fontSize: t.fonte(32),
    fontWeight: '800',
  },
  resumoTexto: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(14),
    textAlign: 'center',
  },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.cor.borda,
    backgroundColor: t.cor.superficieAlta,
  },
  filtroAtivo: {
    backgroundColor: t.cor.primaria,
    borderColor: t.cor.primaria,
  },
  filtroTexto: {
    color: t.cor.textoMedio,
    fontSize: t.fonte(14),
  },
  filtroTextoAtivo: {
    color: t.cor.texto,
    fontWeight: '600',
  },
  lista: {
    paddingBottom: 40,
  },
  dia: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(13),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    backgroundColor: t.cor.superficie,
    borderWidth: 1,
    borderColor: t.cor.borda,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardTexto: {
    flex: 1,
    gap: 2,
  },
  cardNome: {
    color: t.cor.texto,
    fontSize: t.fonte(16),
    fontWeight: '600',
  },
  cardDetalhe: {
    color: t.cor.textoFraco,
    fontSize: t.fonte(13),
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
});
