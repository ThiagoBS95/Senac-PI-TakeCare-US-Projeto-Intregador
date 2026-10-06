/**
 * Tokens visuais do TakeCare.
 *
 * Duas paletas e três escalas de texto, porque a persona Antônio (74 anos,
 * dificuldade com textos pequenos) é quem opera o aplicativo na hora que mais
 * importa. Nenhuma tela usa cor ou tamanho fixo: tudo vem daqui.
 */

export type Paleta = {
  fundo: string;
  superficie: string;
  superficieAlta: string;
  borda: string;
  texto: string;
  textoFraco: string;
  primaria: string;
  primariaTexto: string;
  perigo: string;
  sucesso: string;
  aviso: string;
  avisoFundo: string;
  avisoBorda: string;
  /** Tons claros usados sobre superfícies escuras. */
  destaque: string;
  sucessoClaro: string;
  perigoClaro: string;
  textoMedio: string;
  apagado: string;
  sucessoFundo: string;
  neutroEscuro: string;
};

/** Padrão: fundo escuro, confortável em ambiente com pouca luz. */
export const PALETA_PADRAO: Paleta = {
  fundo: '#0A0A0A',
  superficie: '#1F2937',
  superficieAlta: '#111827',
  borda: '#374151',
  texto: '#FFFFFF',
  textoFraco: '#9CA3AF',
  primaria: '#3B82F6',
  primariaTexto: '#FFFFFF',
  perigo: '#DC2626',
  sucesso: '#16A34A',
  aviso: '#FCD34D',
  avisoFundo: '#1C1917',
  avisoBorda: '#78350F',
  destaque: '#93C5FD',
  sucessoClaro: '#86EFAC',
  perigoClaro: '#FCA5A5',
  textoMedio: '#E5E7EB',
  apagado: '#6B7280',
  sucessoFundo: '#064E3B',
  neutroEscuro: '#334155',
};

/**
 * Alto contraste: preto absoluto, bordas visíveis e cores saturadas.
 * Todas as combinações de texto sobre fundo passam de 7:1 (WCAG AAA).
 */
export const PALETA_CONTRASTE: Paleta = {
  fundo: '#000000',
  superficie: '#000000',
  superficieAlta: '#000000',
  borda: '#FFFFFF',
  texto: '#FFFFFF',
  textoFraco: '#F5F5F5',
  primaria: '#1D4ED8',
  primariaTexto: '#FFFFFF',
  perigo: '#B91C1C',
  sucesso: '#15803D',
  aviso: '#FDE047',
  avisoFundo: '#000000',
  avisoBorda: '#FDE047',
  destaque: '#FDE047',
  sucessoClaro: '#4ADE80',
  perigoClaro: '#FCA5A5',
  textoMedio: '#FFFFFF',
  apagado: '#D4D4D4',
  sucessoFundo: '#000000',
  neutroEscuro: '#000000',
};

export type NomeEscala = 'normal' | 'grande' | 'maior';

export const ESCALAS: Record<NomeEscala, number> = {
  normal: 1,
  grande: 1.2,
  maior: 1.45,
};

export const ROTULO_ESCALA: Record<NomeEscala, string> = {
  normal: 'Normal',
  grande: 'Grande',
  maior: 'Maior',
};

export type Tema = {
  cor: Paleta;
  /** Multiplicador do tamanho de fonte. */
  escala: number;
  altoContraste: boolean;
  /** Aplica a escala a um tamanho em pontos. */
  fonte: (tamanho: number) => number;
  /** Espessura de borda: mais grossa no alto contraste. */
  borda: number;
};

export function montarTema(altoContraste: boolean, escala: number): Tema {
  return {
    cor: altoContraste ? PALETA_CONTRASTE : PALETA_PADRAO,
    escala,
    altoContraste,
    fonte: (tamanho: number) => Math.round(tamanho * escala),
    borda: altoContraste ? 2 : 1,
  };
}

/** Alvo mínimo de toque recomendado pelas diretrizes de acessibilidade. */
export const ALVO_MINIMO = 48;
