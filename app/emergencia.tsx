import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useDados } from '@/data/contexto';
import * as emergencia from '@/data/emergencia';
import { Localizacao } from '@/data/emergencia';

type EstadoLocal =
  | { fase: 'buscando' }
  | { fase: 'ok'; localizacao: Localizacao }
  | { fase: 'indisponivel'; motivo: string };

const MOTIVOS: Record<string, string> = {
  sem_permissao: 'Permissão de localização negada.',
  servico_desligado: 'O GPS do aparelho está desligado.',
};

export default function EmergenciaScreen() {
  const router = useRouter();
  const { idosoId } = useLocalSearchParams<{ idosoId?: string }>();
  const { idosos, registrarAlerta, anotarAcaoDoAlerta } = useDados();

  // Sem escolha explícita, assume o primeiro cadastro: em emergência não há
  // tempo para selecionar nada.
  const idoso = idosos.find((i) => i.id === idosoId) ?? idosos[0];
  const [estado, setEstado] = useState<EstadoLocal>({ fase: 'buscando' });
  const [acoes, setAcoes] = useState<string[]>([]);
  const alertaId = useRef<string | null>(null);
  const registrado = useRef(false);

  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;

    (async () => {
      const resultado = await emergencia.obterLocalizacao();
      const local = resultado.situacao === 'ok' ? resultado.localizacao : null;
      const motivo =
        resultado.situacao === 'ok'
          ? null
          : MOTIVOS[resultado.situacao] ?? 'Não foi possível obter a localização.';

      setEstado(local ? { fase: 'ok', localizacao: local } : { fase: 'indisponivel', motivo: motivo! });

      // O acionamento é gravado mesmo sem localização: o registro do pedido de
      // socorro não pode depender do GPS.
      alertaId.current = await registrarAlerta({
        idosoId: idoso?.id ?? '',
        acionadoEm: new Date().toISOString(),
        latitude: local?.latitude ?? null,
        longitude: local?.longitude ?? null,
        observacaoLocalizacao: motivo,
        acoes: [],
      });
    })();
  }, [idoso?.id, registrarAlerta]);

  const local = estado.fase === 'ok' ? estado.localizacao : null;
  const temContato = emergencia.temTelefone(idoso);

  const ligar = async () => {
    if (!idoso) return;
    const foi = await emergencia.ligarPara(idoso);
    if (foi) {
      setAcoes((a) => [...a, 'ligou']);
      if (alertaId.current) await anotarAcaoDoAlerta(alertaId.current, 'ligou');
    }
  };

  const mandarMensagem = async () => {
    if (!idoso) return;
    const foi = await emergencia.enviarMensagem(idoso, emergencia.montarMensagem(idoso, local));
    if (foi) {
      setAcoes((a) => [...a, 'mensagem']);
      if (alertaId.current) await anotarAcaoDoAlerta(alertaId.current, 'mensagem');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.selo}>
          <Ionicons name="warning" size={34} color="#fff" />
        </View>
        <Text style={styles.titulo}>Emergência acionada</Text>
        <Text style={styles.subtitulo}>
          {idoso ? idoso.nome : 'Nenhuma pessoa idosa cadastrada'}
        </Text>

        <View style={styles.cartao}>
          {estado.fase === 'buscando' && (
            <View style={styles.linha}>
              <Ionicons name="location" size={20} color="#93C5FD" />
              <Text style={styles.cartaoTexto}>Obtendo a localização…</Text>
            </View>
          )}

          {estado.fase === 'ok' && (
            <>
              <View style={styles.linha}>
                <Ionicons name="location" size={20} color="#86EFAC" />
                <Text style={styles.cartaoTexto}>Localização obtida</Text>
              </View>
              <Text style={styles.coordenadas}>
                {estado.localizacao.latitude.toFixed(5)}, {estado.localizacao.longitude.toFixed(5)}
                {estado.localizacao.precisaoM
                  ? ` · ±${Math.round(estado.localizacao.precisaoM)} m`
                  : ''}
              </Text>
            </>
          )}

          {estado.fase === 'indisponivel' && (
            <>
              <View style={styles.linha}>
                <Ionicons name="alert-circle" size={20} color="#FCD34D" />
                <Text style={styles.cartaoTexto}>Sem localização</Text>
              </View>
              <Text style={styles.coordenadas}>{estado.motivo} O pedido de ajuda continua valendo.</Text>
            </>
          )}
        </View>

        {temContato ? (
          <View style={styles.acoes}>
            <TouchableOpacity
              style={[styles.botao, styles.ligar]}
              onPress={ligar}
              accessibilityRole="button"
              accessibilityLabel={`Ligar para ${idoso!.responsavel}`}>
              <Ionicons name="call" size={26} color="#fff" />
              <View>
                <Text style={styles.botaoTexto}>Ligar para {idoso!.responsavel}</Text>
                <Text style={styles.botaoDetalhe}>{idoso!.telefoneResponsavel}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, styles.mensagem]}
              onPress={mandarMensagem}
              accessibilityRole="button">
              <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
              <View>
                <Text style={styles.botaoTexto}>Enviar mensagem</Text>
                <Text style={styles.botaoDetalhe}>
                  {local ? 'Com o link da localização' : 'Sem localização'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.aviso}>
            <Ionicons name="information-circle" size={22} color="#FCD34D" />
            <Text style={styles.avisoTexto}>
              {idoso
                ? 'Cadastre o telefone do responsável para que o alerta possa ligar e enviar mensagem.'
                : 'Cadastre a pessoa idosa e o telefone do responsável.'}
            </Text>
          </View>
        )}

        {acoes.length > 0 && (
          <Text style={styles.registro}>
            Registrado: {acoes.includes('ligou') ? 'ligação' : ''}
            {acoes.includes('ligou') && acoes.includes('mensagem') ? ' e ' : ''}
            {acoes.includes('mensagem') ? 'mensagem' : ''}.
          </Text>
        )}

        <TouchableOpacity
          style={styles.voltar}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.voltarTexto}>Fechar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#140404',
  },
  conteudo: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    alignItems: 'center',
  },
  selo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitulo: {
    color: '#FCA5A5',
    fontSize: 17,
    marginTop: 4,
    marginBottom: 28,
    textAlign: 'center',
  },
  cartao: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 24,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  coordenadas: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  acoes: {
    width: '100%',
    gap: 14,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 6,
  },
  ligar: {
    backgroundColor: '#16A34A',
  },
  mensagem: {
    backgroundColor: '#1D4ED8',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  botaoDetalhe: {
    color: '#E5E7EB',
    fontSize: 13,
    marginTop: 2,
  },
  aviso: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#78350F',
    borderRadius: 16,
    padding: 16,
  },
  avisoTexto: {
    flex: 1,
    color: '#D6D3D1',
    fontSize: 14,
    lineHeight: 20,
  },
  registro: {
    color: '#86EFAC',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  voltar: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#1F2937',
  },
  voltarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
