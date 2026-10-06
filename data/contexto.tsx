/**
 * Estado global do TakeCare. Carrega o banco local na abertura do aplicativo
 * e expõe as operações de cadastro para todas as telas.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as armazenamento from './armazenamento';
import { Banco, BANCO_VAZIO, Dose, Idoso, Medicamento } from './tipos';

type ValorContexto = {
  carregando: boolean;
  idosos: Idoso[];
  medicamentos: Medicamento[];
  doses: Dose[];
  salvarIdoso: (dados: Omit<Idoso, 'id' | 'criadoEm'>, id?: string) => Promise<void>;
  excluirIdoso: (id: string) => Promise<void>;
  salvarMedicamento: (dados: Omit<Medicamento, 'id' | 'criadoEm'>, id?: string) => Promise<void>;
  excluirMedicamento: (id: string) => Promise<void>;
  registrarDose: (dados: Omit<Dose, 'id'>) => Promise<void>;
  medicamentosDoIdoso: (idosoId: string) => Medicamento[];
};

const Contexto = createContext<ValorContexto | null>(null);

export function ProvedorDados({ children }: { children: React.ReactNode }) {
  const [banco, setBanco] = useState<Banco>(BANCO_VAZIO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    armazenamento.carregar().then((inicial) => {
      if (!ativo) return;
      setBanco(inicial);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const salvarIdoso = useCallback(async (dados: Omit<Idoso, 'id' | 'criadoEm'>, id?: string) => {
    setBanco(await armazenamento.salvarIdoso(dados, id));
  }, []);

  const excluirIdoso = useCallback(async (id: string) => {
    setBanco(await armazenamento.excluirIdoso(id));
  }, []);

  const salvarMedicamento = useCallback(
    async (dados: Omit<Medicamento, 'id' | 'criadoEm'>, id?: string) => {
      setBanco(await armazenamento.salvarMedicamento(dados, id));
    },
    [],
  );

  const excluirMedicamento = useCallback(async (id: string) => {
    setBanco(await armazenamento.excluirMedicamento(id));
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
      salvarIdoso,
      excluirIdoso,
      salvarMedicamento,
      excluirMedicamento,
      registrarDose,
      medicamentosDoIdoso,
    }),
    [
      carregando,
      banco,
      salvarIdoso,
      excluirIdoso,
      salvarMedicamento,
      excluirMedicamento,
      registrarDose,
      medicamentosDoIdoso,
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
