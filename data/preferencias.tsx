/**
 * Preferências de acessibilidade: tamanho do texto e alto contraste.
 * Ficam gravadas no aparelho, separadas dos dados de cuidado.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ESCALAS, montarTema, NomeEscala, Tema } from '@/constants/tema';

const CHAVE = '@takecare/preferencias';

type Preferencias = {
  escala: NomeEscala;
  altoContraste: boolean;
};

const PADRAO: Preferencias = { escala: 'normal', altoContraste: false };

type ValorContexto = Preferencias & {
  tema: Tema;
  definirEscala: (escala: NomeEscala) => Promise<void>;
  alternarContraste: () => Promise<void>;
};

const Contexto = createContext<ValorContexto | null>(null);

export function ProvedorPreferencias({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferencias>(PADRAO);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(CHAVE)
      .then((texto) => {
        if (!ativo || !texto) return;
        const lido = JSON.parse(texto);
        setPrefs({
          escala: lido?.escala in ESCALAS ? lido.escala : PADRAO.escala,
          altoContraste: Boolean(lido?.altoContraste),
        });
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);

  const gravar = useCallback(async (novas: Preferencias) => {
    setPrefs(novas);
    await AsyncStorage.setItem(CHAVE, JSON.stringify(novas)).catch(() => undefined);
  }, []);

  const definirEscala = useCallback(
    (escala: NomeEscala) => gravar({ ...prefs, escala }),
    [gravar, prefs],
  );

  const alternarContraste = useCallback(
    () => gravar({ ...prefs, altoContraste: !prefs.altoContraste }),
    [gravar, prefs],
  );

  const valor = useMemo<ValorContexto>(
    () => ({
      ...prefs,
      tema: montarTema(prefs.altoContraste, ESCALAS[prefs.escala]),
      definirEscala,
      alternarContraste,
    }),
    [prefs, definirEscala, alternarContraste],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePreferencias(): ValorContexto {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('usePreferencias precisa estar dentro de <ProvedorPreferencias>.');
  return valor;
}

/** Atalho para quem só precisa das cores e da escala. */
export function useTema(): Tema {
  return usePreferencias().tema;
}
