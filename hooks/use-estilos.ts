import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Tema } from '@/constants/tema';
import { useTema } from '@/data/preferencias';

/**
 * Cria a folha de estilos a partir do tema atual e só refaz quando o tema muda.
 *
 * Uso:
 *   const e = useEstilos(criarEstilos);
 *   const criarEstilos = (t: Tema) => StyleSheet.create({ ... });
 */
export function useEstilos<T extends StyleSheet.NamedStyles<T>>(
  criar: (tema: Tema) => T,
): T {
  const tema = useTema();
  return useMemo(() => criar(tema), [criar, tema]);
}
