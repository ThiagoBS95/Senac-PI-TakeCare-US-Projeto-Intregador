import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { ALVO_MINIMO, NomeEscala, ROTULO_ESCALA, Tema } from '@/constants/tema';
import { usePreferencias } from '@/data/preferencias';
import { useEstilos } from '@/hooks/use-estilos';

const ESCALAS: NomeEscala[] = ['normal', 'grande', 'maior'];

export default function AjustesScreen() {
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const { escala, altoContraste, definirEscala, alternarContraste, tema } = usePreferencias();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={tema.cor.texto} />
        </TouchableOpacity>
        <Text style={styles.title}>Acessibilidade</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.secao}>Tamanho do texto</Text>
        <View style={styles.opcoes}>
          {ESCALAS.map((nome) => {
            const ativo = escala === nome;
            return (
              <TouchableOpacity
                key={nome}
                style={[styles.opcao, ativo && styles.opcaoAtiva]}
                onPress={() => definirEscala(nome)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={`Texto ${ROTULO_ESCALA[nome]}`}>
                <Text style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]}>
                  {ROTULO_ESCALA[nome]}
                </Text>
                {ativo ? <Ionicons name="checkmark" size={20} color={tema.cor.primariaTexto} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.previa}>
          <Text style={styles.previaRotulo}>Prévia</Text>
          <Text style={styles.previaTitulo}>Losartana 50 mg</Text>
          <Text style={styles.previaTexto}>1 comprimido · 08:00 e 20:00</Text>
        </View>

        <Text style={styles.secao}>Contraste</Text>
        <View style={styles.linhaSwitch}>
          <View style={styles.linhaTexto}>
            <Text style={styles.switchTitulo}>Alto contraste</Text>
            <Text style={styles.switchDetalhe}>
              Fundo preto, bordas marcadas e cores mais fortes.
            </Text>
          </View>
          <Switch
            value={altoContraste}
            onValueChange={alternarContraste}
            trackColor={{ false: tema.cor.borda, true: tema.cor.primaria }}
            thumbColor={tema.cor.texto}
            accessibilityLabel="Alto contraste"
          />
        </View>

        <Text style={styles.nota}>
          As preferências valem para todas as telas e continuam valendo quando o aplicativo
          é fechado.
        </Text>
      </ScrollView>
    </View>
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.cor.fundo,
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      minWidth: ALVO_MINIMO,
      minHeight: ALVO_MINIMO,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: t.fonte(26),
      fontWeight: '700',
      color: t.cor.texto,
    },
    conteudo: {
      paddingBottom: 40,
      gap: 12,
    },
    secao: {
      color: t.cor.textoFraco,
      fontSize: t.fonte(13),
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 12,
    },
    opcoes: {
      gap: 10,
    },
    opcao: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: ALVO_MINIMO,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: t.cor.superficie,
      borderWidth: t.borda,
      borderColor: t.cor.borda,
    },
    opcaoAtiva: {
      backgroundColor: t.cor.primaria,
      borderColor: t.cor.primaria,
    },
    opcaoTexto: {
      color: t.cor.texto,
      fontSize: t.fonte(17),
      fontWeight: '500',
    },
    opcaoTextoAtivo: {
      color: t.cor.primariaTexto,
      fontWeight: '700',
    },
    previa: {
      backgroundColor: t.cor.superficieAlta,
      borderWidth: t.borda,
      borderColor: t.cor.borda,
      borderRadius: 14,
      padding: 18,
      gap: 4,
      marginTop: 8,
    },
    previaRotulo: {
      color: t.cor.textoFraco,
      fontSize: t.fonte(12),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    previaTitulo: {
      color: t.cor.texto,
      fontSize: t.fonte(20),
      fontWeight: '700',
    },
    previaTexto: {
      color: t.cor.textoFraco,
      fontSize: t.fonte(15),
    },
    linhaSwitch: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      minHeight: ALVO_MINIMO,
      backgroundColor: t.cor.superficie,
      borderWidth: t.borda,
      borderColor: t.cor.borda,
      borderRadius: 14,
      padding: 18,
    },
    linhaTexto: {
      flex: 1,
      gap: 2,
    },
    switchTitulo: {
      color: t.cor.texto,
      fontSize: t.fonte(17),
      fontWeight: '600',
    },
    switchDetalhe: {
      color: t.cor.textoFraco,
      fontSize: t.fonte(13),
    },
    nota: {
      color: t.cor.textoFraco,
      fontSize: t.fonte(13),
      lineHeight: t.fonte(19),
      marginTop: 16,
    },
  });
