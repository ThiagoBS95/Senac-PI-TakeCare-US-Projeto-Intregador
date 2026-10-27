/**
 * Modelo de dados do TakeCare.
 * Tudo que é gravado no dispositivo passa por estes tipos.
 */

export type Idoso = {
  id: string;
  nome: string;
  /** Data de nascimento em ISO (AAAA-MM-DD). A idade é derivada dela. */
  nascimento: string;
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

/** Acionamento do botão de emergência (eixo C). */
export type Alerta = {
  id: string;
  idosoId: string;
  acionadoEm: string;
  latitude: number | null;
  longitude: number | null;
  /** Por que a localização não veio, quando for o caso. */
  observacaoLocalizacao: string | null;
  /** O que o usuário chegou a fazer depois de acionar. */
  acoes: ('ligou' | 'mensagem')[];
};

/** Tudo que mora no armazenamento local, com a versão do esquema. */
export type Banco = {
  versao: number;
  idosos: Idoso[];
  medicamentos: Medicamento[];
  doses: Dose[];
  alertas: Alerta[];
};

export const VERSAO_ESQUEMA = 3;

export const BANCO_VAZIO: Banco = {
  versao: VERSAO_ESQUEMA,
  idosos: [],
  medicamentos: [],
  doses: [],
  alertas: [],
};

/** Idade em anos completos na data de hoje. */
export function idadeEm(nascimento: string): number | null {
  const d = new Date(nascimento);
  if (Number.isNaN(d.getTime())) return null;
  const hoje = new Date();
  let anos = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) anos -= 1;
  return anos >= 0 && anos <= 130 ? anos : null;
}
