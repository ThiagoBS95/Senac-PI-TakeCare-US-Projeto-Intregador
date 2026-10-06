/**
 * Estado global do TakeCare. Carrega o banco local na abertura do aplicativo,
 * expõe as operações de cadastro e mantém os lembretes em dia: salvar um
 * medicamento reagenda, excluir cancela.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as armazenamento from './armazenamento';
import * as notificacoes from './notificacoes';
import { Banco, BANCO_VAZIO, Dose, Idoso, Medicamento } from './tipos';

type ValorContexto = {
  carregando: boolean;
  idosos: Idoso[];
  medicamentos: Medicamento[];
  doses: Dose[];
  /** null enquanto a verificação inicial não terminou. */
  lembretesAtivos: boolean | null;
  salvarIdoso: (dados: Omit<Idoso, 'id' | 'criadoEm'>, id?: string) => Promise<void>;
  excluirIdoso: (id: string) => Promise<void>;
  salvarMedicamento: (dados: Omit<Medicamento, 'id' | 'criadoEm'>, id?: string) => Promise<void>;
  excluirMedicamento: (id: string) => Promise<void>;
  registrarDose: (dados: Omit<Dose, 'id'>) => Promise<void>;
  medicamentosDoIdoso: (idosoId: string) => Medicamento[];
  ativarLembretes: () => Promise<boolean>;
};

const Contexto = createContext<ValorContexto | null>(null);

export function ProvedorDados({ children }: { children: React.ReactNode }) {
  const [banco, setBanco] = useState<Banco>(BANCO_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [lembretesAtivos, setLembretesAtivos] = useState<boolean | null>(null);

  // Abertura do aplicativo: carrega os dados e prepara o canal de notificação.
  useEffect(() => {
    let ativo = true;

    notificacoes.configurarExibicao();

    (async () => {
      const inicial = await armazenamento.carregar();
      if (!ativo) return;
      setBanco(inicial);
      setCarregando(false);

      await notificacoes.prepararCanal();
      await notificacoes.prepararAcoes();

      const permitido = await notificacoes.temPermissao();
      if (!ativo) return;
      setLembretesAtivos(permitido);

      // Reagenda a partir do que está gravado: cobre reinstalação e reinício.
      if (permitido) {
        await notificacoes.reagendarTudo(inicial.medicamentos, inicial.idosos);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const ativarLembretes = useCallback(async () => {
    const concedida = await notificacoes.pedirPermissao();
    setLembretesAtivos(concedida);
    if (concedida) {
      await notificacoes.reagendarTudo(banco.medicamentos, banco.idosos);
    }
    return concedida;
  }, [banco.medicamentos, banco.idosos]);

  const salvarIdoso = useCallback(async (dados: Omit<Idoso, 'id' | 'criadoEm'>, id?: string) => {
    setBanco(await armazenamento.salvarIdoso(dados, id));
  }, []);

  const excluirIdoso = useCallback(async (id: string) => {
    const antes = await armazenamento.carregar();
    const doIdoso = antes.medicamentos.filter((m) => m.idosoId === id);
    setBanco(await armazenamento.excluirIdoso(id));
    // Sem isto, o lembrete continuaria tocando para um cadastro que não existe mais.
    await Promise.all(doIdoso.map((m) => notificacoes.cancelarMedicamento(m.id, m.horarios)));
  }, []);

  const salvarMedicamento = useCallback(
    async (dados: Omit<Medicamento, 'id' | 'criadoEm'>, id?: string) => {
      const atualizado = await armazenamento.salvarMedicamento(dados, id);
      setBanco(atualizado);

      const salvo = id
        ? atualizado.medicamentos.find((m) => m.id === id)
        : atualizado.medicamentos[atualizado.medicamentos.length - 1];

      if (salvo && (await notificacoes.temPermissao())) {
        const idoso = atualizado.idosos.find((i) => i.id === salvo.idosoId);
        await notificacoes.agendarMedicamento(salvo, idoso);
      }
    },
    [],
  );

  const excluirMedicamento = useCallback(async (id: string) => {
    setBanco(await armazenamento.excluirMedicamento(id));
    await notificacoes.cancelarMedicamento(id);
  }, []);

  const registrarDose = useCallback(async (dados: Omit<Dose, 'id'>) => {
    setBanco(await armazenamento.registrarDose(dados));
  }, []);

  const medicamentosDoIdoso = useCallback(
    (idosoId: string) => banco.medicamentos.filter((m) => m.idosoId === idosoId),
    [banco.medicamentos],
  );

  const valor = useMemo<ValorContexto>(
    () => ({
      carregando,
      idosos: banco.idosos,
      medicamentos: banco.medicamentos,
      doses: banco.doses,
      lembretesAtivos,
      salvarIdoso,
      excluirIdoso,
      salvarMedicamento,
      excluirMedicamento,
      registrarDose,
      medicamentosDoIdoso,
      ativarLembretes,
    }),
    [
      carregando,
      banco,
      lembretesAtivos,
      salvarIdoso,
      excluirIdoso,
      salvarMedicamento,
      excluirMedicamento,
      registrarDose,
      medicamentosDoIdoso,
      ativarLembretes,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDados(): ValorContexto {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('useDados precisa estar dentro de <ProvedorDados>.');
  }
  return valor;
}
