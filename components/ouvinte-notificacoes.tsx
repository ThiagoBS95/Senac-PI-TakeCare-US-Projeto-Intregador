/**
 * Liga a notificação ao aplicativo (eixo B, item B7).
 *
 * - botão "Tomou" na própria notificação: grava a dose sem abrir o aplicativo;
 * - botão "Adiar": repete o lembrete em 15 minutos;
 * - toque no corpo da notificação: abre a tela de confirmação da dose.
 */
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useDados } from '@/data/contexto';
import * as notificacoes from '@/data/notificacoes';

export function OuvinteNotificacoes() {
  const router = useRouter();
  const { medicamentos, registrarDose } = useDados();

  // O listener é registrado uma vez; a referência mantém os dados atuais.
  const atual = useRef({ medicamentos, registrarDose });
  atual.current = { medicamentos, registrarDose };

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const inscricao = Notifications.addNotificationResponseReceivedListener(async (resposta) => {
      const dados = resposta.notification.request.content.data as {
        medicamentoId?: string;
        idosoId?: string;
        horario?: string;
      };
      if (!dados?.medicamentoId) return;

      const acao = resposta.actionIdentifier;
      const medicamento = atual.current.medicamentos.find((m) => m.id === dados.medicamentoId);

      if (acao === 'tomou' || acao === 'adiar') {
        await atual.current.registrarDose({
          medicamentoId: dados.medicamentoId,
          idosoId: dados.idosoId ?? medicamento?.idosoId ?? '',
          horarioPrevisto: dados.horario ?? '',
          respondidoEm: new Date().toISOString(),
          situacao: acao === 'tomou' ? 'tomada' : 'adiada',
        });
        if (acao === 'adiar' && medicamento) {
          await notificacoes.adiar(medicamento);
        }
        return;
      }

      // Toque no corpo: leva à tela de confirmação.
      router.push({
        pathname: '/dose',
        params: { medicamentoId: dados.medicamentoId, horario: dados.horario ?? '' },
      });
    });

    return () => inscricao.remove();
  }, [router]);

  return null;
}
