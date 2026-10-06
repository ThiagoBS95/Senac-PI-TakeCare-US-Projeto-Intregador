/**
 * Modelo de dados do TakeCare (eixo A — registro real).
 * Tudo que é gravado no dispositivo passa por estes tipos.
 */

export type Idoso = {
  id: string;
  nome: string;
  idade: string;
  responsavel: string;
  telefoneResponsavel: string;
  criadoEm: string;
};

export type Medicamento = {
  id: string;
  idosoId: string;
  nome: string;
  dosagem: string;
  /** Horários no formato HH:MM, um por dose do dia. */
  horarios: string[];
  criadoEm: string;
};

/** Registro de uma dose: alimenta o histórico do eixo B. */
export type Dose = {
  id: string;
  medicamentoId: string;
  idosoId: string;
  /** Horário previsto, no formato HH:MM. */
  horarioPrevisto: string;
  /** Momento em que o cuidador respondeu. */
  respondidoEm: string;
  situacao: 'tomada' | 'adiada' | 'nao_tomada';
};

/** Tudo que mora no armazenamento local, com a versão do esquema. */
export type Banco = {
  versao: number;
  idosos: Idoso[];
  medicamentos: Medicamento[];
  doses: Dose[];
};

export const VERSAO_ESQUEMA = 1;

export const BANCO_VAZIO: Banco = {
  versao: VERSAO_ESQUEMA,
  idosos: [],
  medicamentos: [],
  doses: [],
};
