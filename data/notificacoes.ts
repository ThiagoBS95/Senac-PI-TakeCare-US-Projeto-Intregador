/**
 * Lembretes de medicamento (eixo B).
 *
 * Cada horário de cada medicamento vira uma notificação diária. O identificador
 * segue o padrão `dose:<medicamentoId>:<HH-MM>`, o que permite cancelar e
 * reagendar sem tocar nos lembretes dos outros medicamentos.
 *
 * Importante: no Expo Go o agendamento não funciona — é preciso um development
 * build (`npx expo run:android`). As funções abaixo não quebram nesse caso;
 * apenas devolvem false/vazio, e o cadastro segue funcionando.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Idoso, Medicamento } from './tipos';

export const CATEGORIA_DOSE = 'dose-medicamento';
const CANAL_ANDROID = 'lembretes-medicamento';

/** O web não agenda notificação local: evita erro em qualquer chamada. */
const suportado = Platform.OS === 'android' || Platform.OS === 'ios';

function identificador(medicamentoId: string, horario: string): string {
  return `dose:${medicamentoId}:${horario.replace(':', '-')}`;
}

/** Com o aplicativo aberto, o lembrete ainda assim aparece. */
export function configurarExibicao(): void {
  if (!suportado) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Canal exigido pelo Android para som e prioridade altos. */
export async function prepararCanal(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
    name: 'Lembretes de medicamento',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
}

/** Botões de resposta rápida direto na notificação. */
export async function prepararAcoes(): Promise<void> {
  if (!suportado) return;
  await Notifications.setNotificationCategoryAsync(CATEGORIA_DOSE, [
    { identifier: 'tomou', buttonTitle: 'Tomou', options: { opensAppToForeground: false } },
    { identifier: 'adiar', buttonTitle: 'Adiar 15 min', options: { opensAppToForeground: false } },
  ]);
}

export async function temPermissao(): Promise<boolean> {
  if (!suportado) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function pedirPermissao(): Promise<boolean> {
  if (!suportado) return false;
  const atual = await Notifications.getPermissionsAsync();
  if (atual.status === 'granted') return true;
  if (!atual.canAskAgain) return false;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.status === 'granted';
}

function corpoDoLembrete(medicamento: Medicamento, idoso?: Idoso): string {
  const quem = idoso ? ` — ${idoso.nome}` : '';
  return `${medicamento.dosagem}${quem}`;
}

/** Agenda um lembrete diário para cada horário do medicamento. */
export async function agendarMedicamento(
  medicamento: Medicamento,
  idoso?: Idoso,
): Promise<string[]> {
  if (!suportado) return [];
  await cancelarMedicamento(medicamento.id, medicamento.horarios);

  const agendados: string[] = [];
  for (const horario of medicamento.horarios) {
    const [hora, minuto] = horario.split(':').map(Number);
    if (Number.isNaN(hora) || Number.isNaN(minuto)) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: identificador(medicamento.id, horario),
      content: {
        title: `Hora do ${medicamento.nome}`,
        body: corpoDoLembrete(medicamento, idoso),
        categoryIdentifier: CATEGORIA_DOSE,
        data: {
          medicamentoId: medicamento.id,
          idosoId: medicamento.idosoId,
          horario,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hora,
        minute: minuto,
        channelId: CANAL_ANDROID,
      },
    });
    agendados.push(identificador(medicamento.id, horario));
  }
  return agendados;
}

/**
 * Cancela os lembretes do medicamento. Sem a lista de horários, varre os
 * agendamentos existentes — é o caso da exclusão, em que o registro já sumiu.
 */
export async function cancelarMedicamento(
  medicamentoId: string,
  horarios?: string[],
): Promise<void> {
  if (!suportado) return;

  if (horarios?.length) {
    await Promise.all(
      horarios.map((h) =>
        Notifications.cancelScheduledNotificationAsync(identificador(medicamentoId, h)).catch(
          () => undefined,
        ),
      ),
    );
    return;
  }

  const pendentes = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pendentes
      .filter((n) => n.identifier.startsWith(`dose:${medicamentoId}:`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => undefined)),
  );
}

/** Reagenda tudo: usado na abertura do aplicativo e após conceder permissão. */
export async function reagendarTudo(
  medicamentos: Medicamento[],
  idosos: Idoso[],
): Promise<number> {
  if (!suportado) return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();

  let total = 0;
  for (const medicamento of medicamentos) {
    const idoso = idosos.find((i) => i.id === medicamento.idosoId);
    const ids = await agendarMedicamento(medicamento, idoso);
    total += ids.length;
  }
  return total;
}

/** Usado pelo botão "Adiar": repete o lembrete daqui a alguns minutos. */
export async function adiar(
  medicamento: { id: string; nome: string; dosagem: string; idosoId: string },
  minutos = 15,
): Promise<void> {
  if (!suportado) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Lembrete: ${medicamento.nome}`,
      body: `${medicamento.dosagem} — adiado ${minutos} min`,
      categoryIdentifier: CATEGORIA_DOSE,
      data: { medicamentoId: medicamento.id, idosoId: medicamento.idosoId, adiado: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutos * 60,
      channelId: CANAL_ANDROID,
    },
  });
}

export async function listarAgendados(): Promise<Notifications.NotificationRequest[]> {
  if (!suportado) return [];
  return Notifications.getAllScheduledNotificationsAsync();
}
