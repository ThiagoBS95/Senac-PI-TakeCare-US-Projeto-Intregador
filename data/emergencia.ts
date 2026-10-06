/**
 * Acionamento de emergência (eixo C).
 *
 * O alerta sai pelo próprio aparelho: liga para o responsável e oferece o envio
 * de uma mensagem com a localização. Não depende de servidor nem de conta — foi
 * a forma de entregar a jornada do Antônio (etapas 5 e 6) dentro do prazo da
 * 2ª etapa. O envio entre perfis, por notificação, fica para a evolução.
 */
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

import { Idoso } from './tipos';

export type Localizacao = {
  latitude: number;
  longitude: number;
  precisaoM: number | null;
  obtidaEm: string;
};

export type ResultadoLocalizacao =
  | { situacao: 'ok'; localizacao: Localizacao }
  | { situacao: 'sem_permissao' }
  | { situacao: 'servico_desligado' }
  | { situacao: 'falhou'; motivo: string };

const suportado = Platform.OS === 'android' || Platform.OS === 'ios';

/**
 * Obtém a posição atual. Nunca lança: em emergência, falha de GPS não pode
 * impedir a ligação — devolve o motivo e o fluxo segue sem o mapa.
 */
export async function obterLocalizacao(): Promise<ResultadoLocalizacao> {
  if (!suportado) return { situacao: 'falhou', motivo: 'Plataforma sem GPS' };

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { situacao: 'sem_permissao' };

    const ligado = await Location.hasServicesEnabledAsync();
    if (!ligado) return { situacao: 'servico_desligado' };

    const posicao = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      situacao: 'ok',
      localizacao: {
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
        precisaoM: posicao.coords.accuracy ?? null,
        obtidaEm: new Date(posicao.timestamp).toISOString(),
      },
    };
  } catch (erro) {
    return { situacao: 'falhou', motivo: erro instanceof Error ? erro.message : 'desconhecido' };
  }
}

export function linkDoMapa(localizacao: Localizacao): string {
  return `https://maps.google.com/?q=${localizacao.latitude},${localizacao.longitude}`;
}

export function montarMensagem(idoso: Idoso | undefined, localizacao: Localizacao | null): string {
  const quem = idoso?.nome ?? 'A pessoa idosa';
  const base = `EMERGÊNCIA — ${quem} acionou o alerta do TakeCare e precisa de ajuda.`;
  if (!localizacao) {
    return `${base}\nLocalização não disponível no momento do acionamento.`;
  }
  return `${base}\nLocalização: ${linkDoMapa(localizacao)}`;
}

/** Só os dígitos, para montar o link tel:/whatsapp. */
function digitos(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

export function temTelefone(idoso: Idoso | undefined): boolean {
  return Boolean(idoso && digitos(idoso.telefoneResponsavel).length >= 10);
}

export async function ligarPara(idoso: Idoso): Promise<boolean> {
  const numero = digitos(idoso.telefoneResponsavel);
  if (!numero) return false;
  const url = Platform.OS === 'ios' ? `telprompt:${numero}` : `tel:${numero}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/** Abre o aplicativo de mensagens com o texto pronto; o envio é do usuário. */
export async function enviarMensagem(idoso: Idoso, texto: string): Promise<boolean> {
  const numero = digitos(idoso.telefoneResponsavel);
  if (!numero) return false;

  const separador = Platform.OS === 'ios' ? '&' : '?';
  const sms = `sms:${numero}${separador}body=${encodeURIComponent(texto)}`;
  const whatsapp = `whatsapp://send?phone=55${numero}&text=${encodeURIComponent(texto)}`;

  try {
    if (await Linking.canOpenURL(whatsapp)) {
      await Linking.openURL(whatsapp);
      return true;
    }
    await Linking.openURL(sms);
    return true;
  } catch {
    return false;
  }
}
