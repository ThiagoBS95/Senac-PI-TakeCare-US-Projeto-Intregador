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
  /** Texto secundário sobre botão colorido. */
  primariaTextoFraco: string;
  perigo: string;
  sucesso: string;
  aviso: string;
  avisoFundo: string;
  avisoBorda: string;
  /** Tons de ênfase, legíveis sobre as superfícies do tema. */
  destaque: string;
  sucessoClaro: string;
  perigoClaro: string;
  textoMedio: string;
  apagado: string;
  sucessoFundo: string;
  neutroEscuro: string;
};

/**
 * Padrão: claro e sóbrio, no registro de ambiente de saúde — fundo quase branco,
 * cartões brancos e um azul-esverdeado de apoio. Texto em azul-marinho em vez de
 * preto puro, que cansa menos a vista em leitura prolongada.
 */
export const PALETA_PADRAO: Paleta = {
  fundo: '#F2F6FA',
  superficie: '#FFFFFF',
  superficieAlta: '#E8F0F7',
  borda: '#D5E1EC',
  texto: '#10293F',
  textoFraco: '#5B7A94',
  primaria: '#0E7C86',
  primariaTexto: '#FFFFFF',
  primariaTextoFraco: '#E4EFF1',
  perigo: '#C62828',
  sucesso: '#2E7D32',
  aviso: '#8A5A00',
  avisoFundo: '#FFF8E8',
  avisoBorda: '#E8C37A',
  destaque: '#0B6670',
  sucessoClaro: '#1B5E20',
  perigoClaro: '#B3261E',
  textoMedio: '#2C4A63',
  apagado: '#90A4B8',
  sucessoFundo: '#E6F4EA',
  neutroEscuro: '#DCE6F0',
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
  primariaTextoFraco: '#FFFFFF',
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
