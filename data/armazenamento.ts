/**
 * Camada de persistência do TakeCare.
 * As telas nunca falam com o AsyncStorage direto: só por aqui ou pelo contexto.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Banco, BANCO_VAZIO, Dose, Idoso, Medicamento, VERSAO_ESQUEMA } from './tipos';

const CHAVE = '@takecare/banco';

function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function agora(): string {
  return new Date().toISOString();
}

/**
 * Migra bancos de versões anteriores. Hoje só existe a versão 1;
 * quando o esquema mudar, cada passo entra aqui.
 */
function migrar(bruto: any): Banco {
  if (!bruto || typeof bruto !== 'object') return { ...BANCO_VAZIO };

  const banco: Banco = {
    versao: typeof bruto.versao === 'number' ? bruto.versao : VERSAO_ESQUEMA,
    idosos: Array.isArray(bruto.idosos) ? bruto.idosos : [],
    medicamentos: Array.isArray(bruto.medicamentos) ? bruto.medicamentos : [],
    doses: Array.isArray(bruto.doses) ? bruto.doses : [],
  };

  banco.versao = VERSAO_ESQUEMA;
  return banco;
}

export async function carregar(): Promise<Banco> {
  try {
    const texto = await AsyncStorage.getItem(CHAVE);
    if (!texto) return { ...BANCO_VAZIO };
    return migrar(JSON.parse(texto));
  } catch {
    // Dado corrompido não pode derrubar o aplicativo: recomeça vazio.
    return { ...BANCO_VAZIO };
  }
}

async function gravar(banco: Banco): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(banco));
}

// ------------------------------------------------------------------ idosos

export async function salvarIdoso(
  dados: Omit<Idoso, 'id' | 'criadoEm'>,
  id?: string,
): Promise<Banco> {
  const banco = await carregar();

  if (id) {
    banco.idosos = banco.idosos.map((i) => (i.id === id ? { ...i, ...dados } : i));
  } else {
    banco.idosos.push({ ...dados, id: novoId(), criadoEm: agora() });
  }

  await gravar(banco);
  return banco;
}

/** Remove a pessoa idosa e, junto, seus medicamentos e doses. */
export async function excluirIdoso(id: string): Promise<Banco> {
  const banco = await carregar();
  banco.idosos = banco.idosos.filter((i) => i.id !== id);
  banco.medicamentos = banco.medicamentos.filter((m) => m.idosoId !== id);
  banco.doses = banco.doses.filter((d) => d.idosoId !== id);
  await gravar(banco);
  return banco;
}

// ------------------------------------------------------------ medicamentos

export async function salvarMedicamento(
  dados: Omit<Medicamento, 'id' | 'criadoEm'>,
  id?: string,
): Promise<Banco> {
  const banco = await carregar();

  if (id) {
    banco.medicamentos = banco.medicamentos.map((m) => (m.id === id ? { ...m, ...dados } : m));
  } else {
    banco.medicamentos.push({ ...dados, id: novoId(), criadoEm: agora() });
  }

  await gravar(banco);
  return banco;
}

export async function excluirMedicamento(id: string): Promise<Banco> {
  const banco = await carregar();
  banco.medicamentos = banco.medicamentos.filter((m) => m.id !== id);
  banco.doses = banco.doses.filter((d) => d.medicamentoId !== id);
  await gravar(banco);
  return banco;
}

// ------------------------------------------------------------------- doses

export async function registrarDose(dados: Omit<Dose, 'id'>): Promise<Banco> {
  const banco = await carregar();
  banco.doses.push({ ...dados, id: novoId() });
  await gravar(banco);
  return banco;
}

/** Usado pelo roteiro de teste manual e pela tela de ajustes. */
export async function apagarTudo(): Promise<Banco> {
  await AsyncStorage.removeItem(CHAVE);
  return { ...BANCO_VAZIO };
}
